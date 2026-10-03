"""Archive validated static files for the SHA-pinned artifact uploader."""

from pathlib import Path, PurePosixPath
import sys
import tarfile


def archive_pages(source, destination):
    source = Path(source)
    if source.is_symlink() or not source.is_dir() or not (source / "index.html").is_file():
        raise ValueError("Expected a prepared static site directory")

    def static_entry(member):
        if {".git", ".github"}.intersection(PurePosixPath(member.name).parts):
            return None
        if not (member.isfile() or member.isdir()):
            raise ValueError("Pages archives cannot contain links or special files")
        # prepare-pages keeps its directory private; Pages needs readable archive permissions.
        member.mode = 0o755 if member.isdir() else 0o644
        member.uid = member.gid = 0
        member.uname = member.gname = ""
        return member

    with tarfile.open(destination, "x", format=tarfile.GNU_FORMAT) as archive:
        archive.add(source, arcname=".", filter=static_entry)


if __name__ == "__main__":
    archive_pages(*sys.argv[1:])
