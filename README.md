# Diana & Roni · Wedding Website ❄️

A single-page, three-language (English / Hebrew / Russian) wedding invitation site for Georgia, March 17–24, 2027.
It's plain HTML, CSS and JavaScript, so there's no build step. It runs as-is on GitHub Pages.

```
index.html            ← all page text (English + Hebrew + Russian)
css/styles.css        ← colors, fonts, layout
js/main.js            ← language switch, countdown, snow
assets/images/        ← hero.jpg (top photo) + gallery-1.jpg (Gallery section photo)
```

## Preview locally

Double-click `index.html`, or run a tiny local server from this folder:

```bash
python3 -m http.server 8000   # then open http://localhost:8000
```

## Publish to GitHub Pages

1. **Create a repository** at <https://github.com/new>, e.g. `wedding`. Make it **Public**, since Pages on free accounts needs a public repo.
2. **Upload the files.** Pick one of these:
   - **In the browser:** on the new repo page click *uploading an existing file*, drag in **everything inside** this folder (`index.html`, `css/`, `js/`, `assets/`, `README.md`), then click *Commit changes*.
   - **With git:**
     ```bash
     git init
     git add .
     git commit -m "Wedding website"
     git branch -M main
     git remote add origin https://github.com/YOUR-USERNAME/wedding.git
     git push -u origin main
     ```
3. **Turn on Pages:** in the repo go to **Settings → Pages**. Under *Build and deployment* choose **Deploy from a branch**, select branch **main** and folder **/ (root)**, then click **Save**.
4. **Wait a minute or two.** Your site will be live at
   `https://YOUR-USERNAME.github.io/wedding/`. Refresh the Pages settings screen to see the link.

Every later commit to `main` republishes the site automatically.

> Tip: if you name the repo `YOUR-USERNAME.github.io`, the site lives at `https://YOUR-USERNAME.github.io/` with no sub-path.

## Make it yours

### Photos
Replace the files in `assets/images/` and **keep the same file names**:

| File | Where it appears | Suggested size |
|---|---|---|
| `hero.jpg` | Arched photo at the top | ~1600px long side, portrait or square looks best |
| `gallery-1.jpg` | The single photo in the Gallery section | ~1600–2000px wide |

- Look for `📸 SWAP ME` comments in `index.html`.
- Keep each photo under ~500 KB so it loads quickly on phones. <https://squoosh.app> is a free way to shrink them.
- File names are case-sensitive on GitHub Pages: `Photo.JPG` ≠ `photo.jpg`.

### Text
All text lives in `index.html`. Each sentence appears **three times**: inside `data-lang="en"`, `data-lang="he"` and `data-lang="ru"`. Edit all three. Look for `✏️` comments for spots you'll probably want to tweak, like the Hebrew ski-trip title.

The language buttons (EN / עב / RU) switch between them. Hebrew or Russian is shown automatically to visitors whose phone is set to that language, and the choice is remembered.

Links that open the site in one language: Hebrew https://basildiana.github.io/diana-roni-wedding/?lang=he · Russian https://basildiana.github.io/diana-roni-wedding/?lang=ru · English `?lang=en`.

### Countdown
Change `WEDDING_DATE` at the top of `js/main.js`. The countdown hides itself after the date passes.

### Colors & fonts
Edit the variables at the top of `css/styles.css` (`--slate`, `--sky`, `--ice`, …).
