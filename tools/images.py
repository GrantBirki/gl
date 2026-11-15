"""Read JPEG and PNG dimensions without a native codec or an npm package."""

from pathlib import Path
import struct


def dimensions(path):
    with Path(path).open("rb") as image:
        prefix = image.read(24)
        if prefix[:8] == b"\x89PNG\r\n\x1a\n" and prefix[12:16] == b"IHDR" and len(prefix) == 24:
            size = struct.unpack(">II", prefix[16:24])
            if min(size) > 0:
                return size
        if prefix[:2] != b"\xff\xd8":
            raise ValueError(f"Unsupported or invalid image: {path}")
        image.seek(2)
        while True:
            marker = image.read(1)
            if not marker:
                break
            if marker != b"\xff":
                raise ValueError(f"Invalid JPEG marker: {path}")
            while marker == b"\xff":
                marker = image.read(1)
            if not marker or marker in (b"\xd9", b"\xda"):
                break
            if marker[0] in (0x01, *range(0xD0, 0xD8)):
                continue
            length = image.read(2)
            if len(length) != 2:
                break
            length = int.from_bytes(length, "big")
            if length < 2:
                break
            if marker[0] in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
                data = image.read(5)
                if length >= 7 and len(data) == 5:
                    height, width = struct.unpack(">HH", data[1:])
                    if min(width, height) > 0:
                        return width, height
                break
            image.seek(length - 2, 1)
    raise ValueError(f"Could not read image dimensions: {path}")
