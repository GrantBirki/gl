"""Regenerate gallery metadata; homepage selections remain independently editable."""

import argparse
import json
from pathlib import Path
from .build import PUBLIC, SITE
from .images import dimensions


def generate():
    photos = []
    for image in sorted((PUBLIC / "assets/gallery").iterdir()):
        if image.suffix.lower() not in (".jpg", ".jpeg", ".png") or not image.is_file():
            continue
        width, height = dimensions(image)
        photos.append({"key": len(photos), "alt": image.name,
                       "src": "/" + str(image.relative_to(PUBLIC)), "width": width, "height": height})
    (SITE / "data/gallery.json").write_text(json.dumps(photos, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote metadata for {len(photos)} photos")


def select_photos(photos, names):
    lookup = {p["alt"]: p for p in photos}
    if len(names) != len(set(names)):
        raise ValueError("The homepage selection contains duplicate filenames")
    missing = [name for name in names if name not in lookup]
    if missing:
        raise ValueError(f"Unknown gallery photos: {', '.join(missing)}")
    return [lookup[name] for name in names]


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--select-home", type=Path, help="File containing one gallery filename per line")
    args = parser.parse_args()
    if args.select_home:
        names = [line.strip() for line in args.select_home.read_text(encoding="utf-8").splitlines() if line.strip()]
        photos = json.loads((SITE / "data/gallery.json").read_text(encoding="utf-8"))
        selected = select_photos(photos, names)
        (SITE / "data/home.json").write_text(json.dumps(selected, indent=2) + "\n", encoding="utf-8")
        print(f"Selected {len(selected)} homepage photos")
    else:
        generate()
