# Static-site architecture

The site previously declared 38 npm dependencies and locked 941 packages. The
current application, build, and test graph contains zero third-party packages.
This removes package installation, lifecycle hooks, framework hydration, native
image-codec downloads, and package-manager network requests from the build.

The reduction comes from removing the software, rather than copying its bundles:

| Previous dependency group | Replacement |
| --- | --- |
| Astro, MDX, Markdown processors, content routing | Editable HTML pages and a small Python include renderer |
| React and photo-album | Server-rendered photos with a native shortest-column layout |
| Three.js, react-globe.gl and their dependencies | First-party WebGL sphere, geographic labels, and travel arcs |
| react-confetti | A short, reduced-motion-aware Canvas animation |
| Tailwind, PostCSS, Autoprefixer | Existing visual rules retained as ordinary CSS |
| Iconify packages | Existing SVG icon paths included directly in the HTML |
| Image-size and native image-processing tools | Preoptimized image files and a bounded JPEG/PNG header reader |
| Vitest, coverage, ESLint, Prettier, TypeScript | Python unittest, Node's built-in tests, syntax and resource checks |
| Comment and JSON/YAML validation actions | The runner's GitHub CLI, standard-library JSON validation, and GitHub's workflow parser |

The native globe supports dragging, arrow keys, focused wheel/keyboard zoom, and
an accessible destination selector. It pauses offscreen and when the document is
hidden, honors reduced motion, and falls back to a static map when WebGL is
unavailable. Galleries render their images before JavaScript and retain their
responsive column layout when scripting is available.

The existing typography, spacing, colors, photographs, responsive image variants,
links, RSS, sitemap, and all prior HTML routes are preserved. Static CSS and image
files need no runtime package or build plugin. Their licenses live under
`docs/assets/licenses/`.

The tradeoff is intentionally less automation: page content is HTML rather than
Markdown/MDX; image optimization happens before committing an image; feeds and
sitemaps are explicit source files; and new styles are written as CSS. This fits
a small, mostly stable wedding site without maintaining a general-purpose content
framework or a homegrown Markdown parser.

GitHub's pinned checkout, artifact, CodeQL, Node setup, Pages, and branch-deploy
actions are still external tooling. Dependabot continues maintaining those action
pins with the existing cooldown. Python, Node, browsers, and hosting also remain
platform software that must be maintained. Zero packages is a smaller maintenance
surface, not a claim that first-party code or platform software cannot have bugs.

Tests enforce the empty npm graph and standard-library/local imports. If packages
are intentionally reintroduced later, review that budget explicitly and restore
their dependency-update configuration rather than silently bypassing maintenance.
