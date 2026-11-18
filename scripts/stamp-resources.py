"""Use distinct resource filenames, not just queries, for each local frontend build."""
import hashlib
import plistlib
import re
import sys
from pathlib import Path

root = Path(sys.argv[1])
version = plistlib.loads(Path(sys.argv[2]).read_bytes())["CFBundleShortVersionString"]
page = root / "index.html"
html = page.read_text()
for old in root.iterdir():
    if re.fullmatch(r"app-[0-9a-f]{12}\.(js|css)", old.name):
        old.unlink()  # Generated assets from a prior build, never source files.
for name in ["app.js", "app.css"]:
    asset = root / name
    digest = hashlib.sha256(asset.read_bytes()).hexdigest()[:12]
    target = f"app-{digest}{asset.suffix}"
    asset.rename(root / target)
    html = html.replace(f'"{name}"', f'"{target}"')
html = html.replace('id="app-version">MD Preview</span>', f'id="app-version">MD Preview {version}</span>')
page.write_text(html)
