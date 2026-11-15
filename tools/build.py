"""Build editable HTML, shared partials, and local assets without dependencies."""

import argparse
import html
import json
from pathlib import Path
import re
import shutil
import tempfile

from .validate import check_resources

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / "site"
PUBLIC = ROOT / "public"
DIST = ROOT / "dist"
TOKEN = re.compile(r'\{\{\s*(include|gallery)\s+"([\w.-]+)"\s*\}\}|\{\{\s*(globe|confetti)\s*\}\}')


def read_data(name):
    return json.loads((SITE / "data" / f"{name}.json").read_text(encoding="utf-8"))


def gallery(name):
    images = []
    for photo in read_data(name):
        src = photo["src"]
        if not src.startswith("/assets/gallery/") or ".." in Path(src).parts:
            raise ValueError(f"Gallery image must be local: {src}")
        if not (PUBLIC / src.lstrip("/")).is_file():
            raise ValueError(f"Missing gallery image: {src}")
        width, height = int(photo["width"]), int(photo["height"])
        if min(width, height) <= 0:
            raise ValueError(f"Invalid image dimensions: {src}")
        images.append(
            f'<img src="{html.escape(src, quote=True)}" '
            f'alt="{html.escape(photo["alt"], quote=True)}" width="{width}" height="{height}" '
            'loading="lazy" decoding="async">'
        )
    return ('<div class="container mx-auto mb-20 px-5 py-2 lg:px-32 lg:pt-12">'
            '<div class="photo-gallery" data-gallery>' + "\n".join(images) + '</div></div>')


def globe():
    options = ''.join(
        f'<option value="{i}" data-lat="{float(p["lat"])}" data-lon="{float(p["lon"])}">{html.escape(p["name"])}</option>'
        for i, p in enumerate(read_data("places"))
    )
    return (
        '<div class="travel-globe" data-globe>'
        '<canvas tabindex="0" aria-label="Interactive travel globe" aria-describedby="globe-help">'
        'An interactive globe of our travels. Choose a destination from the list.</canvas>'
        '<div class="globe-labels" aria-hidden="true"></div>'
        '<label class="globe-picker">Our travels <select aria-label="Choose a destination">'
        '<option value="">Choose a destination</option>' + options + '</select></label>'
        '<p id="globe-help" class="sr-only">Drag or use arrow keys to rotate. '
        'Use plus and minus to zoom. The destination list also works without graphics.</p>'
        '<p class="globe-status sr-only" aria-live="polite"></p></div>'
    )


def render(source, route, stack=()):
    def replace(match):
        kind, name, widget = match.groups()
        if widget == "globe":
            return globe()
        if widget == "confetti":
            return '<canvas class="confetti" data-confetti aria-hidden="true"></canvas>'
        if kind == "gallery":
            return gallery(name)
        if name in stack:
            raise ValueError(f"Recursive partial: {name}")
        path = SITE / "partials" / name
        if path.suffix != ".html" or path.is_symlink():
            raise ValueError(f"Invalid partial: {name}")
        text = path.read_text(encoding="utf-8")
        if name == "header.html":
            text = text.replace("aw-link-active", "")
            # Only the shared header receives the current-page marker.
            text = re.sub(
                r'<a\b[^>]*href="([^"]*)"[^>]*>',
                lambda m: m[0][:-1] + ' aria-current="page">'
                if (m[1].rstrip("/") or "/") == route else m[0], text,
            )
        return render(text, route, (*stack, name))
    return TOKEN.sub(replace, source)


def copy_public(destination):
    for path in PUBLIC.rglob("*"):
        if path.is_symlink():
            raise ValueError(f"Public assets must not be symlinks: {path.name}")
        if path.is_file():
            target = destination / path.relative_to(PUBLIC)
            target.parent.mkdir(parents=True, exist_ok=True)
            shutil.copyfile(path, target)


def build(output=DIST):
    output = Path(output).absolute()
    if output.is_symlink() or output == ROOT or output in ROOT.parents:
        raise ValueError("Unsafe build destination")
    if output.exists() and output != DIST and not (output / ".static-site-output").is_file():
        raise ValueError("Refusing to replace a directory not created by this builder")
    output.parent.mkdir(parents=True, exist_ok=True)
    pages = sorted((SITE / "pages").rglob("*.html"))
    with tempfile.TemporaryDirectory(prefix=".site-build-", dir=output.parent) as temporary:
        staging = Path(temporary) / "dist"
        staging.mkdir()
        copy_public(staging)
        for page in pages:
            relative = page.relative_to(SITE / "pages")
            if page.is_symlink():
                raise ValueError("Page sources must not be symlinks")
            route = ("/" if relative.parent == Path(".") else "/" + relative.parent.as_posix()) if relative.name == "index.html" else "/" + relative.as_posix()
            target = staging / relative
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(render(page.read_text(encoding="utf-8"), route), encoding="utf-8")
        for name in ("rss.xml", "sitemap-index.xml", "sitemap-0.xml"):
            shutil.copyfile(SITE / name, staging / name)
        check_resources(staging)
        (staging / ".static-site-output").write_text("static-site\n", encoding="utf-8")
        if output.exists():
            shutil.rmtree(output)
        shutil.move(str(staging), output)
    print(f"Built {len(pages)} HTML pages with zero third-party packages")
    return output


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=DIST)
    build(parser.parse_args().output)
