"""Check the generated site, including consumers affected by dependency upgrades."""

from html.parser import HTMLParser
from pathlib import Path
import unittest
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[2]
DIST = ROOT / "dist"


class Page(HTMLParser):
    def __init__(self, path):
        super().__init__()
        self.elements = []
        self.text = []
        self.feed(path.read_text())

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))

    def handle_data(self, data):
        self.text.append(data)

    def find(self, tag, **attrs):
        return [values for name, values in self.elements
                if name == tag and all(values.get(k) == v for k, v in attrs.items())]


class BuiltSiteTests(unittest.TestCase):
    def test_location_is_accessible_without_hydration(self):
        page = Page(DIST / "location/index.html")
        text = " ".join(page.text)
        self.assertIn("505 Corral de Tierra Rd", text)
        self.assertIn("Salinas, CA 93908", text)
        self.assertEqual(len(page.find("img", alt="venue location")), 1)
        directions = page.find("a", href="https://maps.app.goo.gl/e9ZA5bm9XZ361UqLA")[0]
        self.assertEqual(directions["target"], "_blank")
        self.assertEqual(set(directions["rel"].split()), {"noopener", "noreferrer"})
        self.assertTrue(page.find("a", href="/venue", target="_self"))
        self.assertFalse(page.find("astro-island"))
        self.assertTrue(page.find("svg", **{"aria-hidden": "true"}))

    def test_native_metadata_preserves_sharing_and_canonical_url(self):
        page = Page(DIST / "location/index.html")
        self.assertTrue(page.find("link", rel="canonical", href="https://gl.birki.io/location"))
        self.assertTrue(page.find("meta", property="og:title", content="G + L"))
        self.assertTrue(page.find("meta", name="robots", content="index,follow"))
        self.assertTrue(page.find("meta", name="twitter:card", content="summary_large_image"))
        image = page.find("meta", property="og:image")[0]["content"]
        self.assertTrue(image.startswith("https://gl.birki.io/"))
        self.assertTrue((DIST / image.removeprefix("https://gl.birki.io/")).is_file())

    def test_feed_and_post_routes_survive_content_migration(self):
        feed = ET.parse(DIST / "rss.xml")
        posts = feed.findall("./channel/item")
        self.assertTrue(posts)
        for post in posts:
            link = post.findtext("link")
            self.assertTrue(link.startswith("https://gl.birki.io/"))
            route = link.removeprefix("https://gl.birki.io/").strip("/")
            page = Page(DIST / route / "index.html")
            self.assertIn(post.findtext("title"), " ".join(page.text))
        self.assertTrue((DIST / "blog/index.html").is_file())

    def test_gallery_keeps_its_client_renderer(self):
        page = Page(DIST / "gallery/index.html")
        self.assertTrue(page.find("astro-island"))
        self.assertTrue((DIST / "assets/gallery").is_dir())

    def test_updated_icon_renderer_keeps_geometry_and_symbol_targets(self):
        page = Page(DIST / "location/index.html")
        for name in ["tabler:directions", "tabler:link"]:
            icon = page.find("svg", **{"data-icon": name})[0]
            self.assertEqual(icon["viewBox"], "0 0 24 24")
            self.assertEqual(icon["aria-hidden"], "true")
        ids = [attrs["id"] for _, attrs in page.elements if "id" in attrs]
        self.assertEqual(len(ids), len(set(ids)))
        for use in page.find("use"):
            target = use.get("href", "")
            if target.startswith("#"):
                self.assertIn(target[1:], ids)


if __name__ == "__main__":
    unittest.main()
