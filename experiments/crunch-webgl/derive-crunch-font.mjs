/** Convert only the supplied Anton digits into a tiny local Three.js typeface. No runtime font parser. */
import { readFile, writeFile } from 'node:fs/promises';
import opentype from 'opentype.js';
const bytes = await readFile('212-chicken-assets/212-chicken-assets/fonts/anton-400.ttf');
const font = opentype.parse(bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
const glyphs = {};
for (const character of ['1', '2']) {
  const glyph = font.charToGlyph(character);
  const outline = glyph.path.commands.map(command => {
    const type = command.type === 'C' ? 'b' : command.type.toLowerCase();
    const values = [type];
    for (const [x, y] of [['x', 'y'], ['x1', 'y1'], ['x2', 'y2']]) {
      if (command[x] !== undefined) values.push(Math.round(command[x]), Math.round(command[y]));
    }
    return values.join(' ');
  }).join(' ');
  const box = glyph.getBoundingBox();
  glyphs[character] = { ha: glyph.advanceWidth, x_min: box.x1, x_max: box.x2, o: outline };
}
const data = {glyphs, familyName:'Anton', ascender:font.ascender, descender:font.descender,
  underlinePosition:-100, underlineThickness:50,
  boundingBox:{yMin:font.descender,xMin:0,yMax:font.ascender,xMax:font.unitsPerEm}, resolution:font.unitsPerEm,
  original_font_information:{source:'Supplied Anton; SIL Open Font License (asset pack/fonts/anton-OFL.txt)'}};
await writeFile('src/generated/crunch-font.json',JSON.stringify(data)+'\n');
console.log('Generated local Anton 212 outlines.');
