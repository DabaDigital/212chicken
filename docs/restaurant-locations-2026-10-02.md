# Restaurant directory — 2 October 2026

The owner supplied nine published 212 Chicken location records in this chat, including Google place IDs, addresses, selected hours and services. They are stored in the existing `data/website.json` source, consumed by the validated restaurant adapter. `verified: true` records the owner's supplied publication status; it does not claim a fresh independent check of every Google listing.

Featured on the homepage: Maarif, Aeria Mall, O’Village and Tanger. All nine records are available through the city filter on `/restaurants`. Map links use the supplied Google place IDs. Ratings, review totals, “open now” states, uncertain Marrakech opening hours, and other 212 concepts are omitted.

Ain Diab, Gauthier and Rabat Agdal remain unpublished (`verified: false`). Rabat is therefore not offered as an empty city filter.

Aeria Mall's official listing independently confirms floor 2 and daily 11:00–23:00 hours: https://aeriamall.ma/shops/212-chicken/ (checked 2026-10-02).

No identifiable branch photos are available in the project. Cards use an intentional branded placeholder. Replace each record's `photo` with a real branch photo in the asset pack to publish storefront photography; the existing sync script includes these files automatically. Do not use the generated storefronts in the design as documentary branch photos.

The selected visual target is the user's second full-page screenshot: oversized food artwork overlapping the orange section, four cream cards below, and evenly aligned portrait tiles in the social section. Earlier removal of the homepage cards was based on an incorrect interpretation of the image order.
