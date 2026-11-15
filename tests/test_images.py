from pathlib import Path
import struct
import tempfile
import unittest

from tools.images import dimensions
from tools.build import PUBLIC, read_data
from tools.gallery import select_photos


class ImageTests(unittest.TestCase):
    def test_homepage_selection_preserves_requested_order(self):
        photos = read_data("gallery")
        self.assertEqual(select_photos(photos, [photos[2]["alt"], photos[0]["alt"]]), [photos[2], photos[0]])

    def test_unknown_or_duplicate_homepage_photos_are_rejected(self):
        photos = read_data("gallery")
        for names in (["missing.jpg"], [photos[0]["alt"], photos[0]["alt"]]):
            with self.assertRaises(ValueError):
                select_photos(photos, names)

    def test_existing_jpeg_and_png_dimensions_match_gallery_metadata(self):
        photos = read_data("gallery")
        for photo in photos:
            with self.subTest(photo=photo["src"]):
                self.assertEqual(dimensions(PUBLIC / photo["src"].lstrip("/")), (photo["width"], photo["height"]))

    def test_progressive_jpeg_and_application_segments(self):
        data = b'\xff\xd8\xff\xe0\x00\x06ABCD\xff\xc2\x00\x0b\x08' + struct.pack('>HH', 480, 640) + b'\x01\x01\x11\x00'
        with tempfile.NamedTemporaryFile(suffix=".jpg") as image:
            image.write(data); image.flush()
            self.assertEqual(dimensions(image.name), (640, 480))

    def test_invalid_or_truncated_images_fail_instead_of_guessing(self):
        for data in (b"", b"not an image", b"\xff\xd8\xff", b"\xff\xd8\xff\xe0\x00\x00"):
            with tempfile.NamedTemporaryFile() as image:
                image.write(data); image.flush()
                with self.assertRaises(ValueError):
                    dimensions(image.name)
