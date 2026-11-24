MWALIMU.SITE ANALYTICS — DEPLOYMENT PACKAGE
============================================

Included:
- resources.html
- updates.html
- jobs.html
- mwalimu-admin-content-manager.html
- mwalimu-analytics.js

DEPLOYMENT
1. In the GitHub repository teacherjoe256-blip/mwalimu-com, replace the four
   HTML files with the versions in this package.
2. Upload mwalimu-analytics.js to the ROOT of the repository, alongside index.html.
3. Commit the changes and allow Cloudflare Pages to finish deploying.
4. Open the public pages and test the counters. Sign in to /mwalimu-admin-content-manager.html
   as an administrator to see Website traffic.

DATABASE
No SQL needs to be rerun. This package uses the existing Supabase project,
tables and counters. Resource download totals are read from the public counters
that are incremented by the existing successful-download logging trigger.

NOTES
- Existing page layouts and content-management workflows are preserved.
- The admin dashboard uses the existing signed-in Supabase client and only
  displays analytics when app_metadata.role is "admin".
- The admin panel includes this week's unique visitors and total visits,
  a 12-week bar chart, and a 12-week breakdown table.
- Public counters show successful resource downloads and update/job opens.
- Analytics identifiers are random browser UUIDs stored in localStorage.
