# The Seattle Volunteer List

A static directory of **187 nonprofits and community organizations** across the greater Seattle / Puget Sound region that accept volunteers: covering Seattle, Bellevue, Kirkland, Redmond, Woodinville, Bothell, Renton, Tukwila, Kent, Auburn, Burien, SeaTac, Des Moines, Federal Way, Issaquah, Sammamish, Mercer Island, the Snoqualmie Valley, and Snohomish County.

Features: search, filter by cause (11 categories including **Culture & Heritage**), filter by city/area, **map view** (Leaflet/OpenStreetMap), requirement chips on every card (min age, background check, groups, commitment type), a "Surprise me" random pick, and every listing links directly to that organization's live volunteer page.

**SEO landing pages** (`<slug>/index.html`, 18 of them) target seasonal, activity, audience and city searches: e.g. Thanksgiving volunteering, hospital programs, corporate team events, teen service hours, Eastside/South-King-County guides. They are generated from the live directory data by:

```bash
node build-pages.js
```

Run this after any change to `ORGS` in `assets/data.js`. It regenerates all subpages and `sitemap.xml` (robots.txt is static).

## Layout

- `index.html`: homepage markup and styles
- `assets/data.js`: all directory data (`CAUSES`, `LOCS`, `ORGS`, `ATTRS`, `CITYXY`)
- `assets/app.js`: search, filters and map
- `assets/vendor/leaflet/`: Leaflet 1.9.4, self-hosted so the site loads no third-party scripts

## Updating listings

Each entry in the `ORGS` array in `assets/data.js` looks like:

```js
{n:"Organization Name", l:"seattle", c:["food"], d:"What volunteers do.", u:"https://volunteer-page-url"}
```

- `l`: location key (see the `LOCS` map just above it)
- `c`: one or more cause keys (see the `CAUSES` map)
- `u`: use an `https://` link. The build refuses anything that isn't http(s).
- Text is HTML-escaped when rendered, so write plain text (a literal `&` is fine).

Then run `node build-pages.js`, commit and push. GitHub Pages updates automatically.

## Security

- Every page carries a Content-Security-Policy meta tag. The homepage only allows its own scripts; the guide pages allow no scripts at all.
- If you add a new external resource (a font, an analytics script, an embed), add its host to the CSP in `index.html` and/or `build-pages.js`, or the browser will block it.

## Note

Listings were last verified August 2026. Volunteer programs change schedules frequently; each card links to the source of truth so visitors always see current openings.


## Custom domain

Live at https://seattlevolunteerlist.com (DNS managed on Cloudflare; apex A records point to GitHub Pages IPs, www CNAMEs to localfocusdigital.github.io). Keep these records **DNS only** (grey cloud) so GitHub can issue and renew the HTTPS certificate, and keep **Enforce HTTPS** ticked in Settings → Pages.
