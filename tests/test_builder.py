import hashlib
import ast
from html.parser import HTMLParser
import json
from pathlib import Path
import tempfile
import sys
import unittest
from unittest.mock import patch

from tools import build as site
from tools.check import check_resources


class Document(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.elements = []
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        self.elements.append((tag, dict(attrs)))


class BuilderTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.temporary = tempfile.TemporaryDirectory()
        cls.output = site.build(Path(cls.temporary.name) / "site")

    @classmethod
    def tearDownClass(cls):
        cls.temporary.cleanup()

    def test_every_previous_route_is_preserved(self):
        routes = json.loads((site.ROOT / "tests/fixtures/routes.json").read_text())
        self.assertEqual(len(routes), 30)
        for route in routes:
            self.assertTrue((self.output / route).is_file(), route)

    def test_every_local_image_script_stylesheet_and_symbol_resolves(self):
        self.assertEqual(check_resources(self.output), 30)

    def test_gallery_photos_are_visible_without_javascript(self):
        for route, data in [("index.html", "home"), ("gallery/index.html", "gallery")]:
            page = Document((self.output / route).read_text())
            actual = [attrs["src"] for tag, attrs in page.elements if tag == "img" and attrs.get("src", "").startswith("/assets/gallery/")]
            self.assertEqual(actual, [p["src"] for p in site.read_data(data)])

    def test_globe_has_an_accessible_destination_for_every_place(self):
        page = Document((self.output / "index.html").read_text())
        options = [a for t, a in page.elements if t == "option" and a.get("value")]
        self.assertEqual(len(options), len(site.read_data("places")))
        for option, place in zip(options, site.read_data("places")):
            self.assertEqual(float(option["data-lat"]), place["lat"])
            self.assertEqual(float(option["data-lon"]), place["lon"])

    def test_current_page_is_marked_in_shared_navigation(self):
        page = Document((self.output / "schedule/index.html").read_text())
        current = [a["href"] for t, a in page.elements if t == "a" and a.get("aria-current") == "page"]
        self.assertEqual(current, ["/schedule"])

    def test_build_is_deterministic_and_repeatable(self):
        def hashes():
            return {str(p.relative_to(self.output)): hashlib.sha256(p.read_bytes()).hexdigest()
                    for p in self.output.rglob("*") if p.is_file()}
        before = hashes()
        site.build(self.output)
        self.assertEqual(hashes(), before)

    def test_partial_traversal_is_not_interpreted(self):
        self.assertEqual(site.render('{{ include "../private" }}', "/"), '{{ include "../private" }}')

    def test_recursive_partials_are_rejected(self):
        with patch.object(Path, "read_text", return_value='{{ include "loop.html" }}'):
            with self.assertRaisesRegex(ValueError, "Recursive partial"):
                site.render('{{ include "loop.html" }}', "/")

    def test_gallery_rejects_nonlocal_paths_before_rendering(self):
        with patch.object(site, "read_data", return_value=[{"src": "https://example.com/image.jpg"}]):
            with self.assertRaisesRegex(ValueError, "must be local"):
                site.gallery("home")

    def test_gallery_escapes_alt_text(self):
        photo = dict(site.read_data("home")[0], alt='\"><script>alert(1)</script>')
        with patch.object(site, "read_data", return_value=[photo]):
            rendered = site.gallery("home")
        self.assertNotIn('<script>', rendered)
        self.assertIn('&lt;script&gt;', rendered)

    def test_builder_rejects_source_as_output(self):
        with self.assertRaisesRegex(ValueError, "Unsafe build"):
            site.build(site.ROOT)

    def test_builder_preserves_unrelated_output_directory(self):
        with tempfile.TemporaryDirectory() as temporary:
            path = Path(temporary)
            (path / "keep.txt").write_text("keep")
            with self.assertRaisesRegex(ValueError, "Refusing"):
                site.build(path)
            self.assertEqual((path / "keep.txt").read_text(), "keep")

    def test_failed_rebuild_keeps_previous_site_intact(self):
        before = (self.output / "index.html").read_bytes()
        with patch.object(site, "gallery", side_effect=ValueError("Invalid gallery")):
            with self.assertRaisesRegex(ValueError, "Invalid gallery"):
                site.build(self.output)
        self.assertEqual((self.output / "index.html").read_bytes(), before)

    def test_public_asset_symlinks_are_not_followed(self):
        with tempfile.TemporaryDirectory() as temporary:
            source = Path(temporary) / "public"
            source.mkdir()
            private = Path(temporary) / "private.txt"
            private.write_text("not public")
            (source / "link.txt").symlink_to(private)
            with patch.object(site, "PUBLIC", source):
                with self.assertRaisesRegex(ValueError, "must not be symlinks"):
                    site.copy_public(Path(temporary) / "output")

    def test_photo_upload_redirect_is_preserved(self):
        page = Document((self.output / "qrcode/index.html").read_text())
        refresh = [a for t, a in page.elements if t == "meta" and a.get("http-equiv") == "refresh"]
        self.assertEqual(refresh[0]["content"], "0;url=https://weduploader.com/upload/Q53WpiAyHCbZpTw8")

    def test_no_third_party_packages_are_declared_or_locked(self):
        manifest = json.loads((site.ROOT / "package.json").read_text())
        for field in ("dependencies", "devDependencies", "optionalDependencies", "overrides"):
            self.assertFalse(manifest.get(field))
        lock = json.loads((site.ROOT / "package-lock.json").read_text())
        self.assertEqual(list(lock["packages"]), [""])

    def test_python_tools_and_tests_only_import_the_standard_library_or_local_code(self):
        for folder in (site.ROOT / "tools", site.ROOT / "tests", site.ROOT / ".github/scripts"):
            for path in folder.rglob("*.py"):
                tree = ast.parse(path.read_text())
                for node in ast.walk(tree):
                    modules = [a.name for a in node.names] if isinstance(node, ast.Import) else [node.module] if isinstance(node, ast.ImportFrom) and node.level == 0 else []
                    for module in modules:
                        name = module.split(".")[0]
                        self.assertIn(name, sys.stdlib_module_names | {"tools"}, f"Non-standard dependency in {path.name}: {name}")
