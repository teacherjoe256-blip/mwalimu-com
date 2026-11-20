MWALIMU.COM — CORRECTED WEBSITE FILES
=====================================

Upload the contents of this ZIP to the ROOT of the existing GitHub repository
connected to Cloudflare Pages. Keep the filenames exactly as shown.

PUBLIC PAGES
- index.html
- resources.html
- ai.html
- jobs.html
- academy.html
- community.html
- updates.html

ADMIN PAGES
- mwalimu-admin-1.html
- mwalimu-admin-content-manager.html

SHARED / CONFIGURATION
- mwalimu-public-content.js
- _redirects
- mwalimu-site-content-setup.sql (run only if the table/policies have not already been created)

IMPORTANT
- The six non-home public pages now display their own page-specific content section
  instead of repeating the full homepage.
- Existing navigation, Supabase client setup, authentication scripts, and admin files
  have been retained from the supplied files.
- Static content remains the fallback if published database content is unavailable.
- The public content loader dispatches published rows as a browser event; it does not
  perform writes or expose any service-role key.
- Do not run the SQL migration again if it has already been successfully applied.

DEPLOYMENT CHECKLIST
1. Back up the current GitHub files.
2. Upload/replace all files in this package at the repository root.
3. Wait for Cloudflare Pages deployment to finish.
4. Test each public page, admin sign-in, resource browsing/downloads, and mobile navigation.
5. Check browser console and Supabase logs for runtime errors.

This package has been checked for file presence, HTML parsing, unique IDs, and local
page-section routing. Live Cloudflare/Supabase behaviour cannot be certified from
local files alone and must be tested on the deployed site.
