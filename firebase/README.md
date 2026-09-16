# Firebase side

Applied by hand once, then rarely touched. Replace `ADMIN_UID` in both rule
files with the UID of the one Google account allowed to edit - the rules are
written to be the whole access-control story, so a typo here is the only thing
between a private editing store and a public one.

```bash
# after: firebase login && firebase use <project-id>
firebase deploy --only firestore:rules,storage:rules

# lets the browser fetch content.json cross-origin; without it the site
# silently falls back to its bundled copy
gsutil cors set firebase/cors.json gs://<project-id>.appspot.com
```

## Why the public site never touches Firestore

`firebase/firestore` is roughly 85KB gzip - larger than this entire
application - and it would sit in front of first paint. The site instead reads
one published JSON file from Storage, validated before use, with the bundled
copy as the fallback. See `src/lib/content.tsx`.

## What is public

| Path | Read | Write |
|---|---|---|
| `content.json` | anyone | admin |
| `work/**` | anyone | admin, images under 3MB |
| `backups/**` | admin | admin |
| Firestore, all of it | admin | admin |
