"""Check source syntax, JSON, and every local resource in the built HTML/CSS."""

import ast
import json
import subprocess

from .build import DIST, ROOT, build
from .validate import check_resources




def main():
    for folder in (ROOT / "tools", ROOT / "tests", ROOT / ".github/scripts"):
        for source in folder.rglob("*.py"):
            ast.parse(source.read_text(encoding="utf-8"), filename=str(source))
    for folder in (ROOT / "site", ROOT / "public"):
        for source in folder.rglob("*.json"):
            json.loads(source.read_text(encoding="utf-8"))
    for source in sorted((ROOT / "public/assets").glob("*")):
        if source.suffix in (".js", ".mjs"):
            subprocess.run(["node", "--check", str(source)], check=True)
    build()
    count = check_resources(DIST)
    print(f"Python, JavaScript, JSON and resources for {count} pages passed")


if __name__ == "__main__":
    main()
