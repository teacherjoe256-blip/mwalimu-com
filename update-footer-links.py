#!/usr/bin/env python3
"""Update Mwalimu.com footer placeholder links in HTML files in this folder."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent
REPLACEMENTS = {
    "About Mwalimu": "/about.html",
    "Contact": "/contact.html",
    "Privacy": "/privacy.html",
    "Terms": "/terms.html",
}

changed = []
for path in ROOT.glob("*.html"):
    original = path.read_text(encoding="utf-8")
    updated = original
    for label, target in REPLACEMENTS.items():
        # Only replace an anchor whose visible text is the exact footer label and href is "#".
        pattern = re.compile(r'<a\s+href=(["\'])#\1\s*>\s*' + re.escape(label) + r'\s*</a>', re.I)
        updated, count = pattern.subn(f'<a href="{target}">{label}</a>', updated)
    if updated != original:
        path.write_text(updated, encoding="utf-8")
        changed.append(path.name)

print("Updated footer links in:", ", ".join(changed) if changed else "No matching placeholder links found.")
print("Copy the four new pages into the same deployed website root.")
