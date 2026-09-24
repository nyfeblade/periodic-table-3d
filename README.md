# Periodic Table 3D — Elements in Space

An offline, self-contained, ultra-immersive 3D periodic table.

**[Open the live site →](https://nyfeblade.github.io/periodic-table-3d/)**

## What it is

`index.html` is a single, self-contained HTML file (~1.7 MB, no build step, no
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

### Simulations & datasets

- **Real orbital shapes**: toggle any element's atom view from the Bohr model
  to point clouds of its occupied orbitals (1s … 7p, s/p/d/f), sampled from
  the hydrogen-like wavefunctions |ψ<sub>nlm</sub>|² (associated Laguerre
  radial part × real spherical harmonics). Points are colored by the sign of
  ψ, and electron occupancy follows the aufbau configuration and Hund's rule.
- **All 3,383 known nuclides** (244 stable) from the
  [IAEA Live Chart of Nuclides](https://www-nds.iaea.org/relnsd/vcharthtml/VChartHTML.html):
  half-life, natural abundance, mass excess, atomic mass and every decay mode
  with its branching ratio, shown in each element's panel.
- **Radioactive decay simulator**: a Monte Carlo run on any unstable isotope
  (every nucleus has the same per-step probability of decaying), drawn against
  the exact curve N₀·2<sup>−t/t½</sup>, with daughters split by the real
  branching ratios.
- **Decay chains**: the uranium (U-238), actinium (U-235), thorium (Th-232)
  and neptunium (Np-237) series, with the Q-value of every step, minor branches
  and the total energy released by each chain.
- **Nuclear reaction lab**: 11 fusion and fission presets (pp chain, D-D, D-T,
  ³He-³He, Li-6/Li-7, CNO, U-235 and Pu-239 fission) plus a free reaction
  builder. It checks that charge and nucleon number are conserved, then
  computes Q from the mass excesses and reports the threshold energy,
  Coulomb barrier, energy per kilogram and its TNT/gasoline equivalents.
- **Chemistry**: 50 balanced reactions (combustion, synthesis, decomposition,
  replacement, precipitation, acid–base, redox, biological), each marked
  exothermic or endothermic. Every equation is checked to be atom-balanced.
- **Bond predictor**: pick any two elements to see the predicted bond type
  (metallic, nonpolar covalent, polar covalent or ionic) from the Pauling
  electronegativity difference (ionic only when a metal is involved), plus the Pauling ionic-character estimate.
- **Periodic trends in 3D**: turn the table into a height map of
  electronegativity, ionization energy, atomic radius, electron affinity,
  density, melting point or boiling point.

### Shareable links

| Link | Opens |
|---|---|
| `?element=Au` | Gold's detail panel |
| `?element=U&orbitals=1` | Uranium's orbital view |
| `?element=Na&bond=Cl` | Na–Cl bond prediction |
| `?decay=Rn-222` | Decay simulation for radon-222 |
| `?open=decaychains` / `?open=chemistry` | Those drawers |
| `?open=nuclearlab&preset=4` | Nuclear lab with a preset loaded |
| `?trend=en` (also `ie1`, `ar`, `ea`, `d`, `mp`, `bp`) | A trend height map |

## Project structure

| File | Purpose |
|---|---|
| `index.html` | **The shipped app.** Fully self-contained — this is the only file you need to open or deploy. |
| `index_template.html` | HTML template used to assemble `index.html`. |
| `app.js` | All application logic (scene, UI, data, notes/versions). |
| `style.css` | All styling. |
| `elements.json` | Trimmed periodic table dataset embedded into the page. |
| `isotopes.json` | All 3,383 nuclides from the IAEA Live Chart of Nuclides. |
| `decay_chains.json` | The four natural decay series. |
| `nuclear_presets.json` | Nuclear reaction presets (Q-values are computed, not stored). |
| `chem_reactions.json` | The 50 chemical reactions. |
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
- Orbital shapes are exact **hydrogen-like** (one-electron) solutions. In
  many-electron atoms the real orbitals have the same angular shapes and node
  counts, but different radial sizes. Each subshell's cloud is scaled to the
  same on-screen size, so compare shapes, not sizes.
- Nuclear Q-values use **atomic** mass excesses, which already include the
  electrons. In β⁺ emission this means Q includes the 1.022 MeV from the
  positron annihilating with an electron.
- Decay branch percentages follow the NUBASE convention: delayed branches
  (e.g. β⁻n) are part of their parent branch and are shown separately. Where
  the IAEA gives a decay mode without a measured ratio, it is shown as "?%".
- The U-238 chain goes through **Pa-234m**, the metastable state that Th-234
  decays almost entirely feed, rather than the Pa-234 ground state.
- The bond predictor is the textbook electronegativity-difference rule, a
  heuristic with known exceptions (e.g. NaH is ionic although ΔEN = 1.27).
- Trend maps leave out elements with no measured value and all elements past
  Z = 100. Atomic radius is the bonded (mostly covalent) radius. Gas
  densities are stored in g/L and converted to g/cm³ for the density map.

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
