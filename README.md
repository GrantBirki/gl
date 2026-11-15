# G + L 💍

Wedding website for Grant and Leah: [gl.birki.io](https://gl.birki.io).

This is a static website built with Python's standard library and ordinary HTML,
CSS, and browser JavaScript. There are **zero third-party application, build, or
test packages** to install. GitHub Actions remain pinned and maintained separately.

## Develop and preview

Python 3.11 or later is sufficient to build and serve the site:

```sh
python3 -m tools.serve --watch
```

The local server listens on `127.0.0.1:4321`. Edit a source file, wait for the
rebuild message, and refresh the browser. Use `--port` or `--host` when needed.

```sh
python3 -m tools.build       # Build the static site into dist/
python3 -m tools.serve       # Build and preview without watching files
```

## Edit the site

- `site/pages/`: editable HTML for every existing page, including the legacy blog.
  A directory's `index.html` becomes that directory's public route.
- `site/partials/`: the shared head, navigation, and footer. Pages use
  `{{ include "header.html" }}` and similar includes.
- `site/data/home.json` and `gallery.json`: selected homepage photos and the full
  gallery. `{{ gallery "home" }}` and `{{ gallery "gallery" }}` render them.
- `site/data/places.json`: names and geographic coordinates for `{{ globe }}`.
- `public/`: files copied directly to the public site. Optimized images and local
  fonts are retained under `public/assets/media/`; gallery originals are under
  `public/assets/gallery/`.
- `public/assets/site.css`: the previous visual styles, now maintained as plain
  CSS. There is no Tailwind generator: add or change CSS rules directly.
  `widgets.css` contains the native gallery, globe, and confetti styles.
- `public/assets/*.mjs` and `site.js`: small, first-party browser modules. There is
  no React, Three.js, Astro runtime, external JavaScript CDN, or vendored bundle.
- `site/rss.xml` and the sitemap XML files: retained static feeds and route lists.
  Update them when adding or removing blog content or routes. The template blog
  posts are preserved content, not instructions for the current build system.

Add gallery JPG/PNG files, then run `script/generate-gallery-images` to refresh
metadata. To change the homepage selection, edit `site/data/home.json`, or put one
filename per line in `tmp/keep.txt` and run `script/select-images`.

Images are prepared ahead of time, rather than optimized on every build. Supply
appropriately sized images when adding new content. Existing fonts, photographs,
responsive image variants, SVG icons, and their licenses have been retained.

## Check changes

The complete checks also use Node 22+ for its built-in JavaScript test runner and
syntax checker. CI uses the version in `.node-version`. No npm install is needed.

```sh
./script/test                # Python, packaging, and native JavaScript tests
python3 -m tools.check       # Syntax, JSON, local assets, and SVG references
```

The tests cover all 30 previous routes, metadata and RSS, no-JavaScript galleries,
image dimensions, builder boundaries, reproducible builds, globe geometry, and
photo layout. Browser checks should also cover desktop/mobile navigation, the
globe's drag/keyboard/destination controls, and reduced-motion behavior.

## Deploy and roll back

The existing `.deploy` PR comment flow and GitHub Pages deployment are retained.
Candidate code builds in a read-only job; a separate trusted runner validates and
packages the static archive before deployment. No application secrets are needed.

`package.json` and its empty lockfile are compatibility wrappers for npm commands
and older deployment workflows. `npm ci && npm run build` still works and installs
zero packages. Current workflows call Python directly for the build.

Use GitHub's **Revert** action on the migration PR to restore the previous
implementation; the normal main-branch deployment then publishes that revision.
See [the architecture notes](docs/architecture.md) for the dependency tradeoffs.
