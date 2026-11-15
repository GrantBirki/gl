"""Local static preview, with optional rebuilding when source files change."""

import argparse
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
import threading

from .build import DIST, PUBLIC, SITE, ROOT, build


class SiteHandler(SimpleHTTPRequestHandler):
    def send_error(self, code, message=None, explain=None):
        if code == 404 and (DIST / "404.html").is_file():
            content = (DIST / "404.html").read_bytes()
            self.send_response(404)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(content)))
            self.end_headers()
            if self.command != "HEAD":
                self.wfile.write(content)
        else:
            super().send_error(code, message, explain)


def fingerprint():
    files = []
    for folder in (PUBLIC, SITE, ROOT / "tools"):
        for path in sorted(folder.rglob("*")):
            if "__pycache__" in path.parts:
                continue
            try:
                info = path.stat()
                if path.is_file():
                    files.append((str(path), info.st_mtime_ns, info.st_size))
            except FileNotFoundError:
                # Editors often save by atomically replacing or deleting a file.
                continue
    return tuple(files)


def watch(stop):
    previous = fingerprint()
    while not stop.wait(0.5):
        current = fingerprint()
        if current != previous:
            try:
                build()
            except (OSError, ValueError) as error:
                print(f"Build failed; keeping the previous preview: {error}", flush=True)
            previous = current


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=4321)
    parser.add_argument("--watch", action="store_true")
    args = parser.parse_args()
    build()
    stop = threading.Event()
    if args.watch:
        threading.Thread(target=watch, args=(stop,), daemon=True).start()
    server = ThreadingHTTPServer((args.host, args.port), partial(SiteHandler, directory=DIST))
    print(f"Serving on {args.host}:{args.port}; press Ctrl+C to stop", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        stop.set()
        server.server_close()


if __name__ == "__main__":
    main()
