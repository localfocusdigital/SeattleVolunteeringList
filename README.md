# The Seattle Volunteer List

A static directory of **187 nonprofits and community organizations** across the greater Seattle / Puget Sound region that accept volunteers — covering Seattle, Bellevue, Kirkland, Redmond, Woodinville, Bothell, Renton, Tukwila, Kent, Auburn, Burien, SeaTac, Des Moines, Federal Way, Issaquah, Sammamish, Mercer Island, the Snoqualmie Valley, and Snohomish County.

Features: search, filter by cause (11 categories including **Culture & Heritage**), filter by city/area, **map view** (Leaflet/OpenStreetMap), requirement chips on every card (min age, background check, groups, commitment type), a "Surprise me" random pick, and every listing links directly to that organization's live volunteer page.

**SEO landing pages** (`<slug>/index.html`, 18 of them) target seasonal, activity, audience and city searches — e.g. Thanksgiving volunteering, hospital programs, corporate team events, teen service hours, Eastside/South-King-County guides. They are generated from the live directory data by:

```bash
node build-pages.js
```

Run this after any change to `ORGS` in index.html — it regenerates all subpages and `sitemap.xml` (robots.txt is static).

## Deploy to GitHub Pages

1. Create a new repository on GitHub (any name, e.g. `volunteer-puget-sound`).
2. Upload `index.html` to the repo (drag-and-drop on github.com works fine).
3. Go to **Settings → Pages**.
4. Under "Build and deployment", set **Source: Deploy from a branch**, pick your default branch (`main`) and `/ (root)` folder, then Save.
5. Your site goes live in 1–2 minutes at:
   `https://<your-username>.github.io/<repo-name>/`

Or from the command line:

```bash
git init
git add index.html
git commit -m "Initial volunteer directory"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```

Then enable Pages as described in step 3–4 above.

## Updating listings

All organization data lives in one place: the `ORGS` array inside `index.html`. Each entry looks like:

```js
{n:"Organization Name", l:"seattle", c:["food"], d:"What volunteers do.", u:"https://volunteer-page-url"}
```

- `l` — location key (see the `LOCS` map just above it)
- `c` — one or more cause keys (see the `CAUSES` map)
- To add an org: copy a line, edit it, done.
- To remove one: delete its line.

Commit and push — GitHub Pages updates automatically.

## Note

Listings were last verified August 2026. Volunteer programs change schedules frequently; each card links to the source of truth so visitors always see current openings.


## Custom domain

Live at https://seattlevolunteerlist.com (DNS managed on Cloudflare; apex A records point to GitHub Pages IPs, www CNAMEs to localfocusdigital.github.io).
