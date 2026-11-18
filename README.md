# Cartcheck

Look up a game cartridge, compare it with catalog and label photos, and walk the checks for that format.

A matching title means the game was released. A matching code supports the label. A matching board photo is a comparison. This page does not authenticate a cartridge.

## Open it

From this folder:

```bash
python3 -m http.server 8765
```

Then open http://127.0.0.1:8765/

`index.html` also opens straight from the folder. The catalog, guides, and board index are script files, so the page renders without a server. The saved board photos load either way.

Search a title or the code printed on the cart. A format page lists the notable games. A game page shows the catalog photo, any published label code, the checks for that shell, and a saved board photo when one matches the title.

## What is included

Twelve formats: NES, Super Nintendo, Nintendo 64, Game Boy, Game Boy Color, Game Boy Advance, Nintendo DS, Nintendo 3DS, Nintendo Switch, Sega Genesis, Game Gear, and Atari 2600.

The game list is the first page of notable US listings on each [PriceCharting](https://www.pricecharting.com/) console. Consoles, accessories, and cheat devices are left out. A missing title is not a fake title. Prices are not stored. Catalog photos still load from PriceCharting.

Label codes, shell checks, and board codes come from the public guides at [Game Verifying](https://gameverifying.com/wiki). The wording here is original. Methods that guide has retired are listed as things not to use.

PCB pictures linked from those guides are saved under `pcb/`. The pages use those local files, so the pictures still open if the original host is down. Nintendo DS, 3DS, and Switch cards stay closed. These photos are references. The NES guide has no board scans, so that page has no board gallery. A Y08 DS board is flagged because Game Verifying has documented that code on counterfeit cards.

## Rebuild the data

Both scripts need `python3` and `curl`.

```bash
python3 scripts/build_catalog.py
python3 scripts/fetch_pcbs.py
```

`build_catalog.py` rewrites `js/catalog.js` from the current PriceCharting pages and the Game Verifying Nintendo 64 and Pokemon lists. `fetch_pcbs.py` downloads board photos that are not already saved and rewrites `js/pcbs.js`. A later run skips image files that are already valid.

## Layout

- `index.html` is the page
- `css/site.css` is the layout
- `js/app.js` is the search and the game pages
- `js/catalog.js`, `js/guides.js`, and `js/pcbs.js` are the data
- `pcb/` holds the saved board photos
- `scripts/` rebuilds the catalog and the board archive
