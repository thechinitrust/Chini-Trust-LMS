# Supabase Auth production settings

Password recovery uses `https://learn.chinitrust.org/reset-password` as its
canonical return URL. Apply the matching hosted Supabase Auth configuration:

- **Authentication → URL Configuration → Site URL:**
  `https://learn.chinitrust.org`
- **Authentication → URL Configuration → Redirect URLs:** add the exact URL
  `https://learn.chinitrust.org/reset-password`

Also set `NEXT_PUBLIC_SITE_URL=https://learn.chinitrust.org` in the production
Vercel environment and redeploy. The application has this value as a safe
default, but defining it makes the deployment configuration explicit.

The Supabase dashboard is authoritative for a hosted project: editing
`supabase/config.toml` updates the local/CLI configuration only until it is
pushed to the linked project.
