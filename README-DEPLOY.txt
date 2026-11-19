MWALIMU.COM — UPDATED MULTI-PAGE WEBSITE
==========================================

Upload ALL files in this folder to the same published root folder in your
GitHub repository. Do not rename the files.

PUBLIC PAGES
- index.html
- resources.html
- ai.html
- jobs.html
- academy.html
- community.html
- updates.html

ADMIN
- mwalimu-admin-1.html (existing admin page URL)
- mwalimu-admin-content-manager.html (same dashboard, descriptive filename)

SHARED SCRIPT
- mwalimu-public-content.js

SUPABASE
The public pages use the existing Mwalimu.com Supabase project and the
mwalimu_site_content table. The admin dashboard writes content to that table.
Only records marked Published are displayed on the public pages. Drafts remain
visible only in the administrator dashboard.

The existing teaching-resource library, authentication, and page navigation
are retained. If no content has been published for a section, its existing
built-in page content remains visible as a fallback.

DEPLOYMENT
Upload every file in this folder to the root of the same GitHub repository
connected to Cloudflare Pages. Keep all filenames exactly as they are.
