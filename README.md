# anges.work

Static site for Ange, built from the Figma design. Plain HTML, CSS and a little JavaScript — no build step.

## Structure

```
index.html                  → anges.work/            (About Me)
work/index.html             → anges.work/work
collaborations/index.html   → anges.work/collaborations
404.html                    → shown for any unknown URL
assets/css/style.css
assets/js/main.js           → overlays, contact form, "Go Back Up"
assets/img/                 → paintings, frame, star
CNAME                       → custom domain for GitHub Pages
.nojekyll                   → tells GitHub Pages to serve files as they are
```

Each page is a folder with an `index.html`, so URLs have no `.html` suffix.

## Deploy on GitHub Pages

1. Push the contents of this folder to the root of a repository (e.g. `main` branch).
2. Repository → Settings → Pages → Source: "Deploy from a branch", branch `main`, folder `/ (root)`.
3. Custom domain: `anges.work` (already set by the `CNAME` file). Once DNS works, tick **Enforce HTTPS**.
4. DNS at your domain provider:
   - `A` records for `anges.work` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - optional `AAAA` → `2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`
   - optional `CNAME` for `www` → `<your-github-username>.github.io`
   - It's a good idea to verify the domain under your GitHub account settings → Pages.

## Things to edit

- **Contact address**: `CONTACT_EMAIL` at the top of `assets/js/main.js`. The form opens the visitor's mail app with the message filled in.
- **Instagram handle**: in `index.html`.
- **Artworks / collabs**: copy an `<article class="entry">` block in `work/index.html` or `collaborations/index.html`. Put longer text for the overlay in a `<template class="entry__detail">` inside the article (see "Second Artwork").
- Links like `anges.work/work/#second-artwork` open that artwork's overlay directly. The gold frames on the home page use these links.

## Preview locally

All paths are relative, so either works:

- Double-click `index.html` to open it in the browser. Navigation and overlays work from disk too.
- Or run a small server, which behaves exactly like GitHub Pages (clean URLs such as `/work/`):

  ```
  python3 -m http.server 8000
  ```

  then visit http://localhost:8000.

## Draft and publish with GitHub Codespaces

1. On GitHub, create a branch for your draft, then open the repository in a Codespace on that branch.
2. Edit the HTML, CSS, images, or JavaScript. Codespaces starts a preview server and opens the forwarded port; if it does not open automatically, use the **Ports** panel and open port `8000` in your browser.
3. Save your changes and refresh the preview to review them. The preview runs from your Codespace and does not publish the site.
4. When you are satisfied, commit and push the branch, then open and merge a pull request into `main`. GitHub Pages publishes the `main` branch using the repository's Pages settings above. Changes on other branches stay drafts.

The Codespaces setup is in `.devcontainer/devcontainer.json`.
