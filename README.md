# Diana & Ronnie · Wedding Website ❄️

A single-page wedding invitation site for our week in Georgia (March 17–24, 2027).
Plain HTML, CSS and JavaScript with no build step, so it runs as-is on GitHub Pages.

| Language | Branch | Live site |
|---|---|---|
| English | `main` | https://basildiana.github.io/diana-roni-wedding/ |
| Hebrew (RTL) | `hebrew-version` | https://basildiana.github.io/diana-roni-wedding-he/ |

```
index.html              ← page text (the ONLY file that differs between branches, along with this README)
css/styles.css          ← shared styles (mirrors automatically for Hebrew via dir="rtl")
js/main.js              ← shared: countdown, mobile menu, falling snow
assets/images/picnic.jpg  ← panoramic hero photo
assets/images/meadow.jpg  ← sign-off highlight photo
```

## Working on both branches at once (git worktrees)

Each branch can be checked out in its own folder:

```bash
# from the English folder (branch main)
git worktree add ../diana-roni-wedding-he hebrew-version
```

- `diana-roni-wedding/` → `main` (English)
- `diana-roni-wedding-he/` → `hebrew-version` (Hebrew)

**Keep shared files identical.** After changing `css/`, `js/` or `assets/` on `main`, commit, then copy them into the Hebrew branch:

```bash
cd ../diana-roni-wedding-he
git checkout main -- css js assets
git commit -m "Sync shared files from main"
```

## Preview locally

Run this in either folder, then open http://localhost:8000:

```bash
python3 -m http.server 8000
```

## Deploying to GitHub Pages

GitHub Pages serves **one branch per repository**, so each language gets its own Pages site.

### English: branch `main`

1. Push the branch: `git push origin main`
2. In the repo **diana-roni-wedding** go to **Settings → Pages → Build and deployment**.
3. Choose **Deploy from a branch**, branch **main**, folder **/ (root)**, then click **Save**.
4. After a minute or two the site is live at `https://basildiana.github.io/diana-roni-wedding/`.

### Hebrew: branch `hebrew-version`

The branch lives in the main repo, and is also pushed to a second repo, **diana-roni-wedding-he**, which serves it on Pages.

1. One-time setup: create the second repo and add it as a remote:
   ```bash
   gh repo create diana-roni-wedding-he --public
   git remote add he-site https://github.com/basildiana/diana-roni-wedding-he.git
   ```
2. Push the branch to both repos:
   ```bash
   git push origin hebrew-version
   git push he-site hebrew-version
   ```
3. In the repo **diana-roni-wedding-he** go to **Settings → Pages**, choose **Deploy from a branch**, branch **hebrew-version**, folder **/ (root)**, then click **Save**.
4. The site is live at `https://basildiana.github.io/diana-roni-wedding-he/`.

Every later push republishes automatically. The **EN / עב** button in each site's menu links to the other one. If the URLs change, update that link in both `index.html` files.

## Making changes

- **Photos:** replace `assets/images/picnic.jpg` (shown wide across the top) or `meadow.jpg` (near the end), keeping the same file names. If the crop cuts you off, tweak `object-position` on the `<img>` in `index.html`. Look for `📸 SWAP ME` comments. Keep photos under ~600 KB; <https://squoosh.app> shrinks them for free.
- **Text:** edit `index.html` on each branch. English is on `main`, Hebrew on `hebrew-version`.
- **Countdown date:** `WEDDING_DATE` at the top of `js/main.js`, which is a shared file.
- **Colors & fonts:** variables at the top of `css/styles.css`, which is a shared file. Pine accents are `--pine` and `--pine-deep`.
