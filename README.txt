# mwalimu.site footer and information pages update

This package adds four matching information pages and a small script to replace the four `href="#"` footer placeholders in your existing HTML files.

## Files included
- `about.html` — About Mwalimu
- `contact.html` — official phone, WhatsApp and email details
- `privacy.html` — general privacy policy
- `terms.html` — terms of use
- `update-footer-links.py` — updates matching footer links in HTML files in this folder

## Apply the update to the GitHub repository
1. Download and extract this ZIP.
2. Open your existing `mwalimu-com` repository on GitHub.
3. Upload `about.html`, `contact.html`, `privacy.html` and `terms.html` into the repository's top-level/root folder (the same folder as `index.html`).
4. For the existing site pages, change the four links in the footer's About column to:
   - `<a href="/about.html">About Mwalimu</a>`
   - `<a href="/contact.html">Contact</a>`
   - `<a href="/privacy.html">Privacy</a>`
   - `<a href="/terms.html">Terms</a>`
5. The included `update-footer-links.py` automates that replacement if you run it from a copy of the repository root. Put the script in the repository root and run `python update-footer-links.py`; then commit the modified HTML files.
6. Cloudflare Pages should deploy the new commit automatically if your GitHub-to-Cloudflare deployment is connected.

## Important
- The pages use Mwalimu's existing forest-green, cream, mint and gold visual palette and are mobile responsive.
- The supplied contact details are used exactly as provided.
- The Privacy Policy is deliberately written in cautious, general language. Review it if you later add analytics, advertising, payment processing, newsletters or other data collection.
- This package does not push changes to GitHub or deploy the website. You still need to upload/commit the files.
