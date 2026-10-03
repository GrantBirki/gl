"""Exercise the cold Pages packaging path without Node, caches, or network access."""

import io
import os
from pathlib import Path
import subprocess
import sys
import tarfile
import tempfile
import unittest

SCRIPTS = Path(__file__).resolve().parent
SELECTED = "a" * 40
WORKFLOW = "b" * 40


class ArchivePagesTest(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.site = self.root / "site-output"
        self.artifact = self.root / "artifact.tar"

    def command(self, script, *args):
        # Separate, isolated interpreters exercise the CLI used by the fresh prepare runner.
        return subprocess.run(
            [sys.executable, "-I", "-S", str(SCRIPTS / script), *map(str, args)],
            cwd=self.root,
            env={"PATH": os.defpath, "HOME": str(self.root)},
            capture_output=True,
            text=True,
        )

    def create_site(self):
        self.site.mkdir(mode=0o700)
        (self.site / "index.html").write_text("home", encoding="utf-8")

    def test_cold_build_archive_to_pages_contract(self):
        source = self.root / "site.tar"
        route = "stickers/" + "x" * 120 + "/index.html"
        contents = {
            "index.html": b"home",
            route: b"nested route",
            "assets/.keep": b"hidden asset",
            "assets/caf\u00e9.svg": b"svg",
            ".nojekyll": b"",
            "version.txt": b"candidate stamp",
            "workflow-version.txt": b"candidate workflow stamp",
            ".git/config": b"excluded",
            ".github/workflows/untrusted.yml": b"excluded",
        }
        with tarfile.open(source, "w") as archive:
            for name, data in contents.items():
                member = tarfile.TarInfo(name)
                member.size = len(data)
                member.mode = 0o777
                archive.addfile(member, io.BytesIO(data))

        self.assertFalse(self.site.exists())
        prepared = self.command("prepare-pages.py", source, self.site, SELECTED, WORKFLOW)
        self.assertEqual(prepared.returncode, 0, prepared.stderr)
        self.assertEqual(self.site.stat().st_mode & 0o777, 0o700)
        packaged = self.command("archive-pages.py", self.site, self.artifact)
        self.assertEqual(packaged.returncode, 0, packaged.stderr)

        # Read the actual upload input, never extract candidate-controlled archive paths.
        with tarfile.open(self.artifact, "r:") as archive:
            members = archive.getmembers()
            self.assertEqual(len({member.name for member in members}), len(members))
            self.assertLess(self.artifact.stat().st_size, 1024**3)
            for member in members:
                self.assertTrue(member.isfile() or member.isdir(), member.name)
                self.assertEqual(member.mode, 0o755 if member.isdir() else 0o644)
                self.assertEqual((member.uid, member.gid), (0, 0))
            files = {member.name: archive.extractfile(member).read() for member in members if member.isfile()}
            expected = {"./" + name: data for name, data in contents.items() if not name.startswith((".git/", ".github/"))}
            expected["./version.txt"] = (SELECTED + "\n").encode()
            expected["./workflow-version.txt"] = (WORKFLOW + "\n").encode()
            self.assertEqual(files, expected)

    def test_rejects_links_and_special_files(self):
        self.create_site()
        outside = self.root / "outside"
        outside.write_text("outside content", encoding="utf-8")
        entry = self.site / "entry"
        for kind in ("symlink", "hardlink", "fifo"):
            with self.subTest(kind=kind):
                if kind == "symlink":
                    entry.symlink_to(outside)
                elif kind == "hardlink":
                    os.link(self.site / "index.html", entry)
                else:
                    os.mkfifo(entry)
                result = self.command("archive-pages.py", self.site, self.artifact)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn("cannot contain links or special files", result.stderr)
                self.assertNotIn(b"outside content", self.artifact.read_bytes())
                entry.unlink()
                self.artifact.unlink()

    def test_rejects_missing_site_missing_index_and_symlink_root(self):
        for setup in ("missing", "no index", "symlink"):
            with self.subTest(setup=setup):
                if setup == "no index":
                    self.site.mkdir()
                elif setup == "symlink":
                    self.site.rmdir()
                    self.site.symlink_to(self.root, target_is_directory=True)
                result = self.command("archive-pages.py", self.site, self.artifact)
                self.assertNotEqual(result.returncode, 0)
                self.assertFalse(self.artifact.exists())

    def test_rejects_existing_artifact_without_overwriting(self):
        self.create_site()
        self.artifact.write_bytes(b"previous attempt")
        result = self.command("archive-pages.py", self.site, self.artifact)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(self.artifact.read_bytes(), b"previous attempt")


if __name__ == "__main__":
    unittest.main()
