"""Validate a static output tree using only the standard library."""

from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit


class Resources(HTMLParser):
    def __init__(self):
        super().__init__()
        self.resources = []
        self.ids = []
        self.uses = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if "id" in attrs:
            self.ids.append(attrs["id"])
        if tag == "use":
            self.uses.append(attrs.get("href", ""))
        if tag in ("img", "script", "source") and attrs.get("src"):
            self.resources.append(attrs["src"])
        if tag == "img" and attrs.get("srcset"):
            self.resources.extend(item.strip().split()[0] for item in attrs["srcset"].split(","))
        if tag == "link" and attrs.get("rel") in ("stylesheet", "icon", "shortcut icon", "mask-icon"):
            self.resources.append(attrs.get("href", ""))


def check_resources(output):
    output = Path(output).resolve()

    def exists(url, parent):
        parsed = urlsplit(url)
        if parsed.scheme or parsed.netloc or url.startswith("#"):
            return
        path = (output / unquote(parsed.path).lstrip("/")) if parsed.path.startswith("/") else parent / unquote(parsed.path)
        path = path.resolve()
        if not path.is_relative_to(output) or not path.is_file():
            raise ValueError(f"Missing or unsafe resource: {url} in {parent.relative_to(output)}")

    pages = list(output.rglob("*.html"))
    for page in pages:
        text = page.read_text(encoding="utf-8")
        if "<astro-" in text or "/_astro/" in text:
            raise ValueError(f"Framework runtime left in {page.name}")
        parser = Resources()
        parser.feed(text)
        if len(parser.ids) != len(set(parser.ids)):
            raise ValueError(f"Duplicate IDs in {page.relative_to(output)}")
        for use in parser.uses:
            if use.startswith("#") and use[1:] not in parser.ids:
                raise ValueError(f"Missing SVG symbol: {use}")
        for url in parser.resources:
            exists(url, page.parent)
    for css in output.rglob("*.css"):
        for match in re.finditer(r'url\([\'\"]?([^\)\'\"]+)', css.read_text(encoding="utf-8")):
            exists(match[1], css.parent)
    return len(pages)
