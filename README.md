# Periodic Table 3D — Elements in Space

An offline, self-contained, ultra-immersive 3D periodic table.

**[Open the live site →](https://nyfeblade.github.io/periodic-table-3d/)**

## What it is

`index.html` is a single, self-contained HTML file (~750 KB, no build step, no
internet connection required after download) containing:

- **All 118 confirmed elements** (plus element 119, shown clearly marked as
  theoretical/unconfirmed) rendered in real 3D space with Three.js.
- **Real scientific data** for every element: atomic mass, electron
  configuration & shells, electronegativity (Pauling), density, melting/boiling
  points, first ionization energy, electron affinity, molar heat capacity,
  discovery, and a summary — sourced from the public domain
  [Periodic-Table-JSON](https://github.com/Bowserinator/Periodic-Table-JSON)
  dataset.
- **True 3D layout**: elements sit at their real period/group position in the
  X/Y plane, and are staggered in *depth* (Z) by electron **block** (s / p / d
  / f) — so the shape of the table itself reflects electron configuration.
- **A starfield + nebula background**, glowing category-coded tiles, hover
  tooltips, click-to-inspect, and smooth camera flights to any element.
- **A simplified Bohr atom model** for each element (nucleus sized by nucleon
  count, shells and electron counts from real data) — clearly labeled as a
  simplified/illustrative model, not literal electron orbits.
- **A temperature simulator**: drag from 0–6000 K and every element's phase
  indicator (solid/liquid/gas) updates live from its real melting/boiling
  points.
- **Notes & versions**: write free-form notes on any element (or general
  notes), saved to the browser automatically. Save named "versions" (snapshots
  of all your notes), rename/delete them, and export/import them as `.json`
  files to back them up or move them to another browser/device.

## Project structure

| File | Purpose |
|---|---|
| `index.html` | **The shipped app.** Fully self-contained — this is the only file you need to open or deploy. |
| `index_template.html` | HTML template used to assemble `index.html`. |
| `app.js` | All application logic (scene, UI, data, notes/versions). |
| `style.css` | All styling. |
| `elements.json` | Trimmed periodic table dataset embedded into the page. |
| `three.min.js`, `OrbitControls.js` | Bundled Three.js r128 (vendored so the page works fully offline). |
| `build.py` | Assembles `index_template.html` + the JS/CSS/data files into the final `index.html`. Run `python3 build.py` after editing any source file. |

## Data accuracy & honesty notes

- Category colors are a domain-standard convention (like any periodic table
  poster); since a real periodic table needs more simultaneous color
  categories than can be made fully colorblind-safe on their own, every tile
  also always shows its symbol as text and the category name is always shown
  in the legend and detail panel — color is a helpful grouping cue, never the
  only identifier.
- Elements with category "unknown, probably X" (113–118) or fully
  undiscovered (119) are shown with a dashed border and a note that their
  properties are theoretical predictions, not confirmed measurements.
- The Bohr/orbit visualization is a simplified classical model for
  intuition — real electrons don't orbit like planets. Shell electron counts
  themselves are accurate.

## Notes on versions/storage

Notes and versions are stored in **your browser's local storage**, per
browser/device — there's no server or account. Export a version to a `.json`
file to keep a permanent backup or move it elsewhere.

## Local development

```
python3 build.py   # rebuilds index.html from the source files
```

Open `index.html` directly in a browser (no server needed), or serve the
folder with any static file server.
