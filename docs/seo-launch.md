# 212 Chicken: SEO and Google AI search readiness

## Development and launch domains

The owner confirmed that `212chicken.dabadigital.ma` is a development domain.
Set `SITE_URL=https://212chicken.dabadigital.ma` and `SITE_INDEXABLE=false` on that deployment.
The code additionally blocks indexing for that hostname. Vercel preview deployments remain blocked.
Do not submit the development sitemap to Google.

Confirm the exact brand domain before launch: the reference supplied was `https://212chicken.ma/`,
while a later message used `212checkend.ma`. No domain or DNS changes were made.
On the confirmed production domain, set `SITE_URL` to its HTTPS origin and `SITE_INDEXABLE=true`,
then rebuild. Metadata, structured data, sitemap and robots are generated from that configuration.
The production test uses 212chicken.ma as a local simulation, not a domain migration or deployment.

## Implemented

- Specific page titles and descriptions for the homepage, menu, directory and each branch.
- Nine static branch pages generated only from verified records. Restaurant cards link to them;
  each page provides the original branch-specific Google Maps destination and a menu link.
- Canonical URLs exclude menu filter query parameters. Sitemap includes the 12 canonical pages.
- Organization and WebSite identities connect to the supplied Instagram and TikTok profiles.
- Restaurant and BreadcrumbList data describe each branch. Menu data uses the same names and MAD
  prices as the visible catalogue. No ratings, phone numbers, availability or weekday schedules invented.
- Visible, server-rendered answers about the brand, locations, prices, hours and services.
- Production permits search snippets and large image previews. Optional `GOOGLE_SITE_VERIFICATION`
  accepts the Search Console HTML verification token.
- No additional client-side JavaScript is needed for the questions or location pages.

The shared storefront visual is illustrative, not evidence of each branch's appearance. Use actual
branch photos when available. The source menu is a snapshot; confirm prices and branch information
with the brand before launch. Hours lacking day-of-week detail are shown as supplied but not encoded
as a daily structured schedule.

## Launch actions requiring the brand's accounts

1. Confirm the production domain and preserve existing indexed URLs. Inventory the old site and map
   retired pages to the closest replacement with permanent redirects; do not redirect everything home.
2. Deploy to the confirmed domain with the production environment above. Verify `/robots.txt`,
   `/sitemap.xml`, canonical tags and absence of `noindex`. Keep the development copy excluded.
3. Verify the domain in Google Search Console (DNS verification or the optional HTML token).
   Submit `/sitemap.xml`, inspect the homepage, menu and branch URLs, and request indexing.
4. Run Google's Rich Results Test against the deployed branch pages. Optional missing fields need
   real data, not placeholder phone numbers, fabricated ratings or invented opening days.
5. Update each Google Business Profile with the matching branch URL, exact address, real phone,
   opening days/hours, menu link and authentic photos. Keep Instagram's website link consistent.
6. Track brand queries (212 Chicken / 212Chicken), menu and price queries, and location queries in
   Search Console. Compare impressions, clicks and landing pages after indexing; do not treat a
   Lighthouse SEO score as a ranking measurement.

## AI Overviews

There is no opt-in flag or special schema that guarantees inclusion. Google requires ordinary search
eligibility, indexable pages and snippets, useful visible content, and structured data matching it.
The development site intentionally remains ineligible until a production launch. No llms.txt,
fabricated review markup or keyword-stuffed hidden content was added. First-place rankings and
AI Overview inclusion cannot be promised.

Sources reviewed on 2026-10-03:

- https://developers.google.com/search/docs/appearance/ai-features
- https://developers.google.com/search/docs/appearance/structured-data/local-business
- https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- https://212chicken.ma/ (the fetched page exposed very little readable text)
- Instagram reference could not be fetched; no new brand claims were inferred from it.
