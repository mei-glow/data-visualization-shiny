# E-Mobility Global Transition — Shiny Python

An **exact UI clone** of `v2___E-Mobility_Dashboard__1_.html`, served through
Shiny for Python. The reference file is a self-unpacking React + Plotly
prototype; this app serves those original bundles verbatim (pre-transpiled
JSX → plain JS) so the layout, styling, every chart, callout, KPI, the
animated bar-race and the world choropleth are pixel-identical — while a
CSV bridge drives the charts from your real data where columns map.

## Run

```bash
pip install shiny pandas
shiny run --reload app.py
# open http://127.0.0.1:8000
```

No internet required: React, ReactDOM, Plotly and the Plotly geo topojson
are vendored under `www/vendor/`.

## Your data

Drop these in `data/cleaned_data/` (see the README there for schemas):

- `merged_output.csv`
- `ev2025.csv`

If absent, the dashboard runs on the original IEA fixture data (identical
to the reference). When present, `www/csv-bridge.js` overrides the relevant
chart series (world EV stock, sales share, powertrain split, per-country
stock) with your numbers and exposes `merged_output.csv` region metrics as
`window.__CSV_MERGE__`.

## Layout

```
app.py                     Shiny entry — loads CSVs, injects them, serves www/
www/
  design.css               Exact dashboard CSS (from the reference)
  *.jsx                     Editable source (original React app + data + charts)
  js/*.js                   Pre-transpiled bundles actually loaded by the page
  vendor/                   React, ReactDOM, Plotly, topojson (offline-safe)
data/cleaned_data/          Put merged_output.csv + ev2025.csv here
```

## Editing charts

Edit the `.jsx` files, then re-transpile to `js/`:

```bash
npm i -D @babel/cli @babel/core @babel/preset-react
npx babel www/<file>.jsx -o www/js/<file>.js --presets @babel/preset-react
```

## Notes

- Fixed a temporal-dead-zone bug in the original `mountFleetSalesShare`
  (`lastYr` used before declaration).
- Added a post-mount Plotly resize in `ChartCard` so stacked charts size
  correctly inside grid/flex containers.
