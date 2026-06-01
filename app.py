"""
=====================================================================
E-Mobility Global Transition - Shiny Python app
EXACT UI clone of v2___E-Mobility_Dashboard__1_.html

The original HTML is a client-side React + Plotly prototype. To match the
UI *exactly* (layout, styling, every chart, callout, KPI and the animated
bar-race / choropleth), this app serves the original React bundles verbatim
through Shiny's static-asset hosting, and injects the user's real CSVs
(data/cleaned_data/merged_output.csv + ev2025.csv) as JS globals so the
charts are driven by real data wherever a clean column mapping exists.

Folder layout
  app.py
  www/                      ← served as static assets at /www-bridge/
    data-fonts.css          (Inter + JetBrains Mono @font-face, optional)
    design.css              (the exact dashboard CSS)
    data-fixtures.jsx       (original IEA fixtures - window.* globals)
    csv-bridge.jsx          (overrides window.* from injected CSV rows)
    charts.jsx              (original Plotly chart builders)
    app.jsx                 (original React top-level app)
  data/cleaned_data/
    merged_output.csv
    ev2025.csv
=====================================================================
"""
import os
import json
import pandas as pd
from shiny import App, ui
from shiny.types import SilentException
import shiny

# ── Paths ─────────────────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
WWW_DIR  = os.path.join(BASE_DIR, "www")
DATA_DIR = os.path.join(BASE_DIR, "data", "cleaned_data")

# ── Load CSVs (server-side) ───────────────────────────────────────────
def _load_csv(name):
    path = os.path.join(DATA_DIR, name)
    if not os.path.exists(path):
        return None
    try:
        df = pd.read_csv(path)
        # JSON-safe: NaN → None, numpy types → native
        return json.loads(df.to_json(orient="records"))
    except Exception as e:  # pragma: no cover
        print(f"[app] Failed to read {name}: {e}")
        return None

MERGE_ROWS = _load_csv("merged_output.csv")
EV_ROWS    = _load_csv("ev2025.csv")

FILES_LOADED = bool(MERGE_ROWS) or bool(EV_ROWS)

# ── Read the original design CSS so it's inlined in <head> ────────────
def _read(name, default=""):
    p = os.path.join(WWW_DIR, name)
    if os.path.exists(p):
        with open(p, "r", encoding="utf-8") as f:
            return f.read()
    return default

DESIGN_CSS = _read("design.css")
ASSET_VERSION = str(int(max(
    os.path.getmtime(os.path.join(WWW_DIR, "js", name))
    for name in ("data-fixtures.js", "csv-bridge.js", "charts.js", "app.js")
    if os.path.exists(os.path.join(WWW_DIR, "js", name))
)))

# ── Inject CSV rows as JS globals (defined BEFORE the bundles load) ───
#    json.dumps with default str keeps it safe for huge arrays.
INJECT_JS = f"""
window.__MERGE_ROWS__ = {json.dumps(MERGE_ROWS) if MERGE_ROWS else 'null'};
window.__EV_ROWS__    = {json.dumps(EV_ROWS) if EV_ROWS else 'null'};
window.__FILES_LOADED__ = {str(FILES_LOADED).lower()};
// Serve Plotly's geo topojson from vendored assets (offline-safe choropleth).
if (window.Plotly && Plotly.setPlotConfig) {{
  Plotly.setPlotConfig({{ topojsonURL: 'www-bridge/vendor/topojson/' }});
}}
"""

# ── Page head: fonts, Plotly, React, design CSS ───────────────────────
HEAD = ui.head_content(
    ui.tags.meta(charset="utf-8"),
    ui.tags.meta(name="viewport", content="width=device-width,initial-scale=1"),
    ui.tags.title("E-Mobility Global Transition"),
    ui.tags.link(rel="preconnect", href="https://fonts.googleapis.com"),
    ui.tags.link(rel="preconnect", href="https://fonts.gstatic.com", crossorigin=""),
    ui.tags.link(
        rel="stylesheet",
        href=("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700"
              "&family=JetBrains+Mono:wght@400;500;700&display=swap"),
    ),
    # Plotly + React, vendored locally (works offline / in restricted networks).
    # JSX is pre-transpiled to plain JS at build time, so no Babel is needed.
    ui.tags.script(src="www-bridge/vendor/plotly.min.js"),
    ui.tags.script(src="www-bridge/vendor/react.min.js"),
    ui.tags.script(src="www-bridge/vendor/react-dom.min.js"),
    # Exact dashboard CSS
    ui.tags.style(ui.HTML(DESIGN_CSS)),
)

# ── Body: inject data, then load bundles in dependency order ──────────
#    Order matters:
#      1. INJECT_JS         → __MERGE_ROWS__ / __EV_ROWS__
#      2. data-fixtures.js  → window.* IEA fixtures
#      3. csv-bridge.js     → override window.* from CSV
#      4. charts.js         → Plotly builders
#      5. app.js            → React render
#    Plain (transpiled) scripts execute in strict document order.
app_ui = ui.page_fixed(
    HEAD,
    ui.tags.div(id="root"),
    ui.tags.script(ui.HTML(INJECT_JS)),
    ui.tags.script(src=f"www-bridge/js/data-fixtures.js?v={ASSET_VERSION}"),
    ui.tags.script(src=f"www-bridge/js/csv-bridge.js?v={ASSET_VERSION}"),
    ui.tags.script(src=f"www-bridge/js/charts.js?v={ASSET_VERSION}"),
    ui.tags.script(src=f"www-bridge/js/app.js?v={ASSET_VERSION}"),
    # Neutralize Shiny's default container so the dashboard owns full-width layout.
    ui.tags.style(ui.HTML(
        "body>.container-fluid,body>.container{padding:0!important;max-width:none!important;width:auto!important;margin:0!important}"
    )),
)

def server(input, output, session):
    # All rendering is client-side React; no reactive server logic needed.
    pass

# Serve www/ as static assets at /www-bridge/
app = App(
    app_ui,
    server,
    static_assets={"/www-bridge": WWW_DIR},
)
