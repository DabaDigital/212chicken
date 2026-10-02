import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const base = process.env.BASE_URL ?? 'http://localhost:3101';
const out = 'screenshots/motion';
await mkdir(out, {recursive:true});
const browser = await chromium.launch({channel:process.env.BROWSER_CHANNEL ?? 'msedge'});
const results = [];
for (const variant of [
  {name:'desktop',width:1440,height:900,reduce:false,js:true},
  {name:'mobile',width:390,height:844,reduce:false,js:true},
  {name:'reduced',width:1440,height:900,reduce:true,js:true},
  {name:'no-js',width:390,height:844,reduce:true,js:false},
]) {
 const context = await browser.newContext({viewport:{width:variant.width,height:variant.height},reducedMotion:variant.reduce?'reduce':'no-preference',javaScriptEnabled:variant.js});
 const page = await context.newPage();
 const errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto(base, {waitUntil:'networkidle'});
 await page.waitForTimeout(1100);
 await page.screenshot({path:`${out}/${variant.name}-initial.png`});
 const hero = page.locator('[data-hero]');
 const height = (await hero.boundingBox()).height;
 const states=[];
 for(const progress of [0,.25,.5,.75,1]) {
   await page.evaluate(y=>scrollTo(0,y),height*progress);
   await page.waitForTimeout(650);
   states.push(await page.locator('[data-hero-burger]').evaluate(el=>getComputedStyle(el).transform));
   await page.screenshot({path:`${out}/${variant.name}-${progress*100}.png`});
 }
 if(variant.js) {
   await page.emulateMedia({reducedMotion:'reduce'});
   await page.waitForTimeout(100);
   const reset = await page.locator('[data-hero-burger]').evaluate(el=>getComputedStyle(el).transform);
   if(reset !== 'none') errors.push(`Reduced motion did not clear transforms: ${reset}`);
   await page.getByRole('link',{name:'Explorer la carte',exact:true}).click();
   await page.waitForURL('**/carte');
   await page.locator('header').getByRole('link',{name:'212 Chicken — accueil'}).click();
   await page.waitForURL(base+'/');
   if(await page.locator('[data-hero]').count() !== 1) errors.push('Duplicate hero after route navigation');
 }
 results.push({variant:variant.name,states,errors});
 await context.close();
}
await writeFile(`${out}/results.json`,JSON.stringify(results,null,2));
await browser.close();
console.log(JSON.stringify(results,null,2));
if(results.some(r=>r.errors.length)) process.exitCode=1;
