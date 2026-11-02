# Thanksgiving at SpaceX

A static, zoomable viewer for an animated hidden-object scene. Two layers move in this test — Elon and the Tesla Cybercabs — on a painted 8K background. The motion matches the offline renderer in `reference/render_loop.py`: a seamless 30 second loop, driven in the browser by `performance.now()` modulo 30 seconds and drawn at the display refresh rate.

There is no build step. GitHub Pages (or any static file server) can serve the repository root as-is.

## Watch it locally

```bash
python3 -m http.server 8080
```

Open http://127.0.0.1:8080/. Loading the `index.html` file directly will not work, because the page fetches its motion data and images.

- Pinch, or scroll / trackpad, zooms toward the pointer. Zoom stops at a view of the whole scene and goes a little past 1:1 on the 8K background.
- Drag pans. The view stays inside the painting.
- Double-click or double-tap zooms in, and zooms back out once you are at the limit.
- Pause and the reset-view control sit at the lower right.

The 4K background paints first. Past the point where that preview would look soft, the page draws lossless 1024px tiles of `assets/background-8k.jpg`, and only the tiles in view.

## GitHub Pages

The site is meant to be published from the `main` branch root.

1. Open the repository on GitHub.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **Deploy from a branch**.
4. Set **Branch** to `main` and the folder to `/ (root)`.
5. Save.

The published URL is https://crippledninjalabs.github.io/thanksgiving-wimmelbild/. `.nojekyll` is included so Pages serves the files directly and does not run Jekyll.

The Open Graph and Twitter Card tags point at that URL and at `share.jpg` (1200×675, `summary_large_image`). There is no analytics or other third-party request.

## How the motion data works

`motion/paths.json` is the choreography. Coordinates are **1280×720 layout pixels**, not 8K pixels. The viewer multiplies them by 6, which is what `render_loop.py` does for an 8K frame (`k = 7680 / 1280`). Times are seconds on a 30 second loop.

`js/motion.js` is the port of that renderer: routes, ease in / ease out, cab phase offsets (the second pair of cabs is `copy_of` with a later `phase`), door-open crossfades, sprite choice, facing, scale, half-degree rotation, and Elon's walk and work cycles. Depth order is the layout y coordinate.

To extend it:

- **Another cab.** Add an object to `cabs`. A time-shifted duplicate only needs `copy_of` and `phase`.
- **Another road.** Add a polyline to `roads`. x should increase along the road, which is what the "distance at this x" lookup assumes.
- **Another character** that walks and works like Elon. Add a `characters` array of objects with the same fields as `elon` (`height_base`, `walk_fps`, `work_fps`, `bob_frac`, `timeline`, and an `id`). Point `motion/assets.json` → `characters.<id>` at a folder of `{id}_walk_{1-4}_{L|R}.png` and `{id}_work_{1-2}_{L|R}.png`. While `characters` is absent, the single `elon` object is used.
- **A new kind of motion.** Add a sampler beside `cabState` / `characterState` in `js/motion.js` and call it from `sample()`. The viewer only draws the sprite and shadow commands that `sample()` returns.

Sprite files are listed by the catalog in `js/motion.js` and mapped to files in `motion/assets.json`.

## Regenerating the 8K tiles

`assets/tiles/` is a lossless crop of `assets/background-8k.jpg` (jpegtran, so the tiles abut with the original pixels). From the repository root, with Pillow and `jpegtran` installed:

```bash
python3 tools/make_tiles.py
```

That also rewrites `share.jpg` and `favicon.png` from `assets/background-4k.jpg`.

## Check the motion port

```bash
node test/motion.test.mjs
```

The expected poses were generated from `reference/render_loop.py` and are stored in `test/expected.json`. `test/browser.mjs` loads the page in headless Chrome (puppeteer-core) and checks the loop, zoom, pan, and that frame 0 stays close to the offline render.
