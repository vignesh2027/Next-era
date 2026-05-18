# NEXT ERA NX-7

A cinematic, scroll-driven product page for a fictional humanoid robot, NX-7.
Built with Three.js, vanilla JS, and CSS — no build step.

## Live site

After deploying to GitHub Pages, your site will be available at:
`https://<your-username>.github.io/<repo-name>/`

## Deploy to GitHub Pages

1. Push this folder to a GitHub repo.
2. Go to **Settings → Pages**.
3. Source: **Deploy from a branch**.
4. Branch: **main**, folder: **/ (root)**.
5. Save. Your site will be live in ~1 minute.

## Local preview

Just open `index.html` in any modern browser — or serve it locally:
```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Files

- `index.html` — the page (30 sections + 30s intro)
- `styles.css` — base palette, type, hero, intro, footer
- `styles-sections.css` — extended section visual language
- `styles-extras.css` — new motion + intro layers
- `scene.js` — Three.js robot scene + intro choreography
- `app.js` — global JS (cursor, split-text, scroll, reveals)
- `extras.js` — section nav, sticky-scrub, neural canvas, etc.

## Credits

Original design and build. Fonts via Google Fonts (Cinzel, Cormorant Garamond,
Space Mono). Three.js loaded from cdnjs.
