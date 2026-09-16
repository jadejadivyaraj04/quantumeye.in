# Hosting

The domain is at GoDaddy, the site is not - GoDaddy's Website Builder only
publishes sites made in its own editor, and their cPanel hosting is a separate
paid product. The domain stays where it is and points at a static host that
builds from this repository.

`netlify.toml` and `public/_redirects` configure that. `.htaccess` and
`vercel.json` are here for Apache-style hosting and Vercel respectively, if
the host ever changes.

## What every host needs

1. Build command `npm run build`, publish directory `dist`
2. The four VITE_* variables in the host's environment - Vite inlines them at
   build time, so a build without them silently ships a site that ignores the
   dashboard and falls back to a mailto: link
3. Any path that is not a file must serve index.html, or /admin 404s
4. `index.html` uncached, hashed assets cached hard

## What does not need a deploy

Content. The dashboard commits `content/content.json`, and the live site reads
it from GitHub on load. Deploys are for code.
