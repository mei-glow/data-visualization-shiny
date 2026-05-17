"""
E-Mobility Global Transition - Shiny for Python
IEA Global EV Outlook 2025 Data Narrative
"""

import pandas as pd
import numpy as np
import plotly.graph_objects as go
import plotly.express as px
from plotly.subplots import make_subplots
from copy import deepcopy
from pathlib import Path

from shiny import App, ui, render, reactive
from shinywidgets import output_widget, render_widget

# ─────────────────────────────────────────────
#  DATA LOADING & PREPROCESSING
# ─────────────────────────────────────────────
DATA_PATH = Path(__file__).with_name("EVDataExplorer2025.xlsx")
df = pd.read_excel(DATA_PATH, sheet_name="GEVO_EV_2025")
df.columns = df.columns.str.strip()

EXCLUDE_REGIONS = {
    "World", "Europe", "Asia Pacific", "EU27", "North America",
    "Central and South America", "Africa", "Middle East and Caspian", "Rest of the world"
}

# --- World EV stock (Cars, BEV+PHEV) ---
world_stock_raw = df[
    (df["region_country"] == "World") &
    (df["parameter"] == "EV stock") &
    (df["mode"] == "Cars") &
    (df["category"] == "Historical") &
    (df["powertrain"].isin(["BEV", "PHEV"]))
]
world_stock = world_stock_raw.groupby("year")["value"].sum().reset_index()
world_stock_pt = world_stock_raw.pivot_table(index="year", columns="powertrain", values="value", aggfunc="sum").fillna(0)

# --- World EV sales share ---
world_sales_share = df[
    (df["region_country"] == "World") &
    (df["parameter"] == "EV sales share") &
    (df["mode"] == "Cars") &
    (df["category"] == "Historical") &
    (df["powertrain"] == "EV")
].sort_values("year")

# --- Country EV stock by year (animated race) ---
country_stock_time = df[
    (df["parameter"] == "EV stock") &
    (df["mode"] == "Cars") &
    (df["category"] == "Historical") &
    (df["powertrain"].isin(["BEV", "PHEV"])) &
    (~df["region_country"].isin(EXCLUDE_REGIONS))
]
country_stock_pivot = country_stock_time.groupby(["region_country", "year"])["value"].sum().reset_index()

# --- Stock share by country 2024 ---
stock_share_2024 = df[
    (df["parameter"] == "EV stock share") &
    (df["mode"] == "Cars") &
    (df["category"] == "Historical") &
    (df["year"] == 2024) &
    (df["powertrain"] == "EV") &
    (~df["region_country"].isin(EXCLUDE_REGIONS))
].sort_values("value", ascending=False).head(15)

# --- Charging points ---
charging = df[
    (df["region_country"] == "World") &
    (df["parameter"] == "EV charging points") &
    (df["category"] == "Historical")
]
charging_pt = charging.pivot_table(index="year", columns="powertrain", values="value", aggfunc="sum").fillna(0)
charging_pt = charging_pt.rename(columns={
    "Publicly available fast": "Fast",
    "Publicly available slow": "Slow"
})

# --- EV per charger ratio 2024 ---
stock_2024 = df[
    (df["parameter"] == "EV stock") & (df["mode"] == "Cars") &
    (df["category"] == "Historical") & (df["year"] == 2024) &
    (df["powertrain"].isin(["BEV", "PHEV"]))
]
stock_by_country = stock_2024.groupby("region_country")["value"].sum()
charger_2024 = df[
    (df["parameter"] == "EV charging points") &
    (df["category"] == "Historical") & (df["year"] == 2024)
]
charger_by_country = charger_2024.groupby("region_country")["value"].sum()
ratio_df = pd.DataFrame({
    "stock": stock_by_country,
    "chargers": charger_by_country,
    "ratio": stock_by_country / charger_by_country
}).dropna()
ratio_df = ratio_df[~ratio_df.index.isin(EXCLUDE_REGIONS)].sort_values("ratio", ascending=False)

# --- BEV vs PHEV by country 2024 ---
bev_phev_2024 = df[
    (df["parameter"] == "EV stock") & (df["mode"] == "Cars") &
    (df["category"] == "Historical") & (df["year"] == 2024) &
    (df["powertrain"].isin(["BEV", "PHEV"])) &
    (~df["region_country"].isin(EXCLUDE_REGIONS))
]
bev_phev_pivot = bev_phev_2024.groupby(["region_country", "powertrain"])["value"].sum().unstack(fill_value=0)
bev_phev_pivot["total"] = bev_phev_pivot.sum(axis=1)
bev_phev_pivot["bev_pct"] = bev_phev_pivot.get("BEV", 0) / bev_phev_pivot["total"] * 100
bev_phev_top = bev_phev_pivot.sort_values("total", ascending=False).head(12)

# --- STEPS + Historical projection (global stock) ---
world_all = df[
    (df["region_country"] == "World") &
    (df["parameter"] == "EV stock") &
    (df["mode"] == "Cars") &
    (df["powertrain"].isin(["BEV", "PHEV"]))
]
hist_world = world_all[world_all["category"] == "Historical"].groupby("year")["value"].sum().reset_index()
proj_world = world_all[world_all["category"] == "Projection-STEPS"].groupby("year")["value"].sum().reset_index()

# --- Fleet turnover: sales share vs stock share ---
sales_share_world = df[
    (df["region_country"] == "World") & (df["parameter"] == "EV sales share") &
    (df["mode"] == "Cars") & (df["powertrain"] == "EV")
].sort_values("year")
stock_share_world = df[
    (df["region_country"] == "World") & (df["parameter"] == "EV stock share") &
    (df["mode"] == "Cars") & (df["powertrain"] == "EV")
].sort_values("year")
sales_share_proj = df[
    (df["region_country"] == "World") & (df["parameter"] == "EV sales share") &
    (df["mode"] == "Cars") & (df["powertrain"] == "EV") & (df["category"] == "Projection-STEPS")
].sort_values("year")
stock_share_proj = df[
    (df["region_country"] == "World") & (df["parameter"] == "EV stock share") &
    (df["mode"] == "Cars") & (df["powertrain"] == "EV") & (df["category"] == "Projection-STEPS")
].sort_values("year")


# ─────────────────────────────────────────────
#  CHART THEME
# ─────────────────────────────────────────────
BG = "#0a0f1e"
BG2 = "#0d1526"
PANEL = "#0f1d30"
TEAL = "#2dd4bf"
TEAL2 = "#14b8a6"
ORANGE = "#fb923c"
RED = "#f87171"
MUTED = "#94a3b8"
WHITE = "#f1f5f9"
GOLD = "#fbbf24"

LAYOUT_BASE = dict(
    paper_bgcolor="rgba(0,0,0,0)",
    plot_bgcolor="rgba(0,0,0,0)",
    font=dict(family="'Syne', sans-serif", color=WHITE),
    margin=dict(l=40, r=30, t=50, b=40),
    xaxis=dict(gridcolor="rgba(255,255,255,0.05)", linecolor="rgba(255,255,255,0.1)"),
    yaxis=dict(gridcolor="rgba(255,255,255,0.05)", linecolor="rgba(255,255,255,0.1)"),
    legend=dict(bgcolor="rgba(0,0,0,0)", font=dict(size=11, color=MUTED)),
    hoverlabel=dict(bgcolor=PANEL, font_color=WHITE, bordercolor=TEAL),
)


def apply_theme(fig, **kwargs):
    layout = deepcopy(LAYOUT_BASE)
    for key, value in kwargs.items():
        if isinstance(value, dict) and isinstance(layout.get(key), dict):
            layout[key].update(value)
        else:
            layout[key] = value
    fig.update_layout(**layout)
    return fig


def hex_to_rgba(hex_color, alpha=1):
    hex_color = hex_color.lstrip("#")
    r, g, b = (int(hex_color[i:i + 2], 16) for i in (0, 2, 4))
    return f"rgba({r},{g},{b},{alpha})"


def fmt_m(v):
    if v >= 1e9: return f"{v/1e9:.1f}B"
    if v >= 1e6: return f"{v/1e6:.1f}M"
    if v >= 1e3: return f"{v/1e3:.0f}k"
    return str(int(v))


# ─────────────────────────────────────────────
#  SHARED CSS / FONTS
# ─────────────────────────────────────────────
CUSTOM_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

:root {
    --bg: #0a0f1e;
    --bg2: #0d1526;
    --panel: #0f1d30;
    --teal: #2dd4bf;
    --teal2: #14b8a6;
    --orange: #fb923c;
    --muted: #94a3b8;
    --white: #f1f5f9;
    --red: #f87171;
}

* { box-sizing: border-box; }

html, body {
    margin: 0; padding: 0;
    background: var(--bg);
    color: var(--white);
    font-family: 'Syne', sans-serif;
    scroll-behavior: smooth;
    overflow-x: hidden;
}

.page { min-height: 100vh; }

#duplicate_adoption,
#duplicate_powertrain {
    display: none !important;
}

.container-fluid {
    padding-left: 0;
    padding-right: 0;
}

/* ── SPLASH ── */
#s0 {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 100vh;
    background:
        radial-gradient(circle at 35% 0%, rgba(45,212,191,0.18), transparent 28%),
        linear-gradient(rgba(5,12,26,0.76), rgba(5,12,26,0.88)),
        url("https://images.unsplash.com/photo-1519608487953-e999c86e7455?w=1800&q=80");
    background-size: cover;
    background-position: center;
    text-align: center;
    gap: 20px;
    animation: fadeIn 1s ease;
    position: relative;
    padding-top: 96px;
}
#s0 h1 {
    font-family: 'Syne', sans-serif;
    font-size: clamp(2.5rem, 6vw, 5rem);
    font-weight: 700;
    color: var(--teal);
    margin: 0; letter-spacing: 0;
}
#s0 p {
    font-size: 1.2rem; color: var(--muted);
    font-weight: 500; margin: 0;
}
#s0 .begin-btn,
.begin-btn {
    display: inline-flex; align-items: center; gap: 8px;
    background: var(--teal2); color: #fff;
    padding: 14px 32px; border-radius: 50px;
    font-size: 0.9rem; font-weight: 700; cursor: pointer;
    border: 1px solid rgba(45,212,191,0.25); letter-spacing: 1.2px;
    text-transform: uppercase;
    transition: all 0.2s; margin-top: 16px;
    text-decoration: none;
}
#s0 .begin-btn:hover,
.begin-btn:hover { background: var(--teal); transform: translateY(-2px); box-shadow: 0 8px 24px rgba(45,212,191,0.3); color: #06111f; }
#s0::after {
    content: "POWERED BY IEA GLOBAL EV DATA";
    position: absolute;
    bottom: 34px;
    left: 0;
    right: 0;
    color: rgba(241,245,249,0.58);
    font-size: 0.78rem;
    letter-spacing: 3px;
    font-weight: 700;
}

/* ── NAVBAR ── */
.navbar {
    position: fixed; top: 0; left: 0; right: 0; z-index: 1000;
    background: rgba(10,15,30,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(255,255,255,0.06);
    display: flex; align-items: center;
    padding: 0 40px; height: 76px; gap: 48px;
}
.navbar .brand {
    font-family: 'Syne', sans-serif;
    font-size: clamp(1rem, 1.4vw, 1.55rem); font-weight: 700;
    color: var(--teal); white-space: nowrap;
    line-height: 1.08;
    max-width: 360px;
    letter-spacing: 0;
}
.navbar .nav-links {
    display: flex; gap: 28px; margin-left: auto;
    list-style: none; padding: 0; margin-right: 0;
}
.navbar .nav-links li a {
    color: var(--muted); text-decoration: none;
    font-size: 0.88rem; font-weight: 700;
    transition: color 0.2s; letter-spacing: 1.2px;
}
.navbar .nav-links li a:hover, .navbar .nav-links li a.active {
    color: var(--teal);
    border-bottom: 2px solid var(--teal);
    padding-bottom: 2px;
}

/* ── SECTION ── */
.section {
    padding: 116px 40px 64px;
    min-height: 100vh;
    width: 75%;
    max-width: 1600px; margin: 0 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
}
.section-full {
    padding: 80px 40px;
    background: var(--bg2);
}

.section-label {
    font-size: 0.7rem; font-weight: 700; letter-spacing: 3px;
    color: var(--teal2); text-transform: uppercase; margin-bottom: 8px;
}
.section h1 {
    font-family: 'Syne', sans-serif; font-size: clamp(2.6rem, 4.4vw, 4.5rem);
    font-weight: 700; color: var(--white); margin: 0 0 16px;
    line-height: 1.12; letter-spacing: 0;
}
.section h2 {
    font-family: 'Syne', sans-serif; font-size: clamp(2.1rem, 3.6vw, 3.8rem);
    font-weight: 700; color: var(--white); margin: 0 0 8px;
    letter-spacing: 0;
}
.section h3 {
    font-family: 'Syne', sans-serif; font-size: 1.2rem;
    font-weight: 600; color: var(--white); margin: 0 0 8px;
}
.section p {
    color: var(--muted); line-height: 1.7; font-size: clamp(1rem, 1.35vw, 1.25rem); max-width: 760px;
}

.icon-badge {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(45,212,191,0.12);
    border: 1px solid rgba(45,212,191,0.35);
    color: var(--teal);
    font-family: 'Syne', sans-serif;
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.5px;
    box-shadow: 0 0 24px rgba(45,212,191,0.16);
    margin-bottom: 16px;
}
.grid-3 .chart-panel > div:first-child {
    width: 54px;
    height: 54px;
    border-radius: 50%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(45,212,191,0.12);
    border: 1px solid rgba(45,212,191,0.35);
    color: transparent;
    font-size: 0;
    box-shadow: 0 0 24px rgba(45,212,191,0.16);
    margin-bottom: 16px;
}
.grid-3 .chart-panel:nth-child(1) > div:first-child::after,
.grid-3 .chart-panel:nth-child(2) > div:first-child::after,
.grid-3 .chart-panel:nth-child(3) > div:first-child::after {
    color: var(--teal);
    font-family: 'Syne', sans-serif;
    font-size: 0.76rem;
    font-weight: 800;
    letter-spacing: 0.5px;
}
.grid-3 .chart-panel:nth-child(1) > div:first-child::after { content: "EV"; }
.grid-3 .chart-panel:nth-child(2) > div:first-child::after { content: "MI"; }
.grid-3 .chart-panel:nth-child(3) > div:first-child::after { content: "TP"; }

/* ── KPI CARDS ── */
.kpi-row {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px; margin: 32px 0;
}
.kpi-card {
    background: var(--panel);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 12px; padding: 20px 24px;
}
.kpi-card .kpi-label { font-size: 0.75rem; color: var(--muted); font-weight: 500; margin-bottom: 6px; letter-spacing: 0.3px; }
.kpi-card .kpi-value { font-family: 'Syne', sans-serif; font-size: 2.2rem; font-weight: 700; color: var(--white); margin: 0; letter-spacing: 0; }
.kpi-card.highlight { border-color: var(--teal); }
.kpi-card.highlight .kpi-value { color: var(--orange); }
.kpi-card.alert { border-color: var(--red); }
.kpi-card.alert .kpi-value { color: var(--red); }

/* ── CHART PANEL ── */
.chart-panel {
    background: var(--panel);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 16px; padding: 24px; margin: 16px 0;
    overflow: hidden;
}
.chart-panel .chart-title {
    font-size: 0.75rem; font-weight: 600; letter-spacing: 1.5px;
    text-transform: uppercase; color: var(--muted); margin-bottom: 16px;
}
.race-controls .irs--shiny .irs-bar,
.race-controls .irs--shiny .irs-single {
    background: var(--teal);
    border-color: var(--teal);
}
.race-controls .irs--shiny .irs-handle {
    border-color: var(--teal);
    background: var(--panel);
    box-shadow: 0 0 18px rgba(45,212,191,0.45);
}

/* ── INSIGHT BOX ── */
.insight-box {
    border-left: 3px solid var(--teal);
    padding: 16px 20px;
    background: rgba(45,212,191,0.05);
    border-radius: 0 8px 8px 0;
    margin: 24px 0;
    font-size: 0.9rem; color: var(--muted);
    font-style: italic;
}
.insight-box span { color: var(--white); }

.warn-box {
    border: 1px solid rgba(251,146,60,0.3);
    background: rgba(251,146,60,0.07);
    border-radius: 10px; padding: 16px 20px; margin: 24px 0;
}
.warn-box .warn-title { color: var(--orange); font-weight: 600; margin-bottom: 6px; font-size: 0.9rem; }
.warn-box p { color: var(--muted); font-size: 0.85rem; margin: 0; }

/* ── NARRATIVE CARD (Mateo) ── */
.narrative-card { max-width: 700px; margin: 0 auto; }
.narrative-card img { width: 100%; border-radius: 12px; margin: 24px 0; }
.narrative-card .caption { font-size: 0.75rem; color: var(--muted); margin-top: -16px; margin-bottom: 20px; }

.stat-row { display: flex; gap: 32px; margin: 24px 0; }
.stat-block .stat-label { font-size: 0.75rem; color: var(--muted); margin-bottom: 4px; }
.stat-block .stat-value { font-family: 'Syne', sans-serif; font-size: 2.4rem; font-weight: 700; color: var(--orange); letter-spacing: 0; }
.stat-progress { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 8px; width: 240px; }
.stat-progress .fill { height: 100%; background: var(--orange); border-radius: 2px; width: 40%; }

/* ── GRID 2-COL ── */
.grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin: 24px 0; }
.grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin: 24px 0; }
.grid-left { display: grid; grid-template-columns: 1fr 380px; gap: 24px; align-items: start; }
.grid-right-panel {
    background: var(--panel);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px; padding: 24px;
    position: sticky; top: 80px;
}

/* ── RANK LIST ── */
.rank-item {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 16px; border-radius: 10px;
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.05);
    margin-bottom: 8px;
}
.rank-item .rank-num { color: var(--muted); font-size: 0.8rem; width: 20px; font-weight: 600; }
.rank-item .rank-name { flex: 1; font-weight: 600; font-size: 0.95rem; }
.rank-item .rank-val { font-family: 'Syne', sans-serif; font-size: 1.3rem; font-weight: 700; color: var(--teal); letter-spacing: 0; }

.highlight-card {
    background: rgba(45,212,191,0.08);
    border: 1px solid rgba(45,212,191,0.25);
    border-radius: 10px; padding: 16px 20px; margin-bottom: 16px;
}
.highlight-card .hl-label { font-size: 0.7rem; letter-spacing: 2px; text-transform: uppercase; color: var(--teal); margin-bottom: 6px; }
.highlight-card .hl-value { font-family: 'Syne', sans-serif; font-size: 1.5rem; font-weight: 700; color: var(--white); letter-spacing: 0; }

/* ── STRESS ZONES ── */
.stress-chips { display: flex; flex-wrap: wrap; gap: 10px; margin-top: 20px; }
.stress-chip {
    padding: 10px 16px; border-radius: 8px;
    font-size: 0.82rem; font-weight: 600;
}
.stress-chip.critical { background: rgba(248,113,113,0.15); border: 1px solid rgba(248,113,113,0.3); color: var(--red); }
.stress-chip.warn { background: rgba(251,146,60,0.1); border: 1px solid rgba(251,146,60,0.25); color: var(--orange); }

/* ── SLIDE DOT NAV ── */
.dot-nav {
    position: fixed; right: 24px; top: 50%;
    transform: translateY(-50%); z-index: 999;
    display: flex; flex-direction: column; gap: 16px;
    background: rgba(15,25,48,0.58); border-radius: 999px;
    border: 1px solid rgba(255,255,255,0.10);
    padding: 28px 16px; backdrop-filter: blur(8px);
}
.dot-nav a {
    width: 16px; height: 16px; border-radius: 50%;
    background: transparent;
    border: 2px solid rgba(241,245,249,0.55);
    display: block;
    transition: all 0.2s; text-decoration: none;
}
.dot-nav a:hover,
.dot-nav a.active {
    background: var(--teal);
    border-color: var(--teal);
    transform: scale(1.15);
    box-shadow: 0 0 24px rgba(45,212,191,0.85);
}

/* ── FOOTER ── */
.footer {
    border-top: 1px solid rgba(255,255,255,0.07);
    padding: 24px 40px;
    display: flex; justify-content: space-between; align-items: center;
    color: var(--muted); font-size: 0.8rem;
    background: var(--bg2);
}
.footer a { color: var(--muted); text-decoration: none; }
.footer a:hover { color: var(--teal); }

/* ── SCENARIO BUTTONS ── */
.scenario-btns { display: flex; gap: 10px; margin-bottom: 20px; }
.scenario-btn {
    padding: 8px 18px; border-radius: 50px;
    font-size: 0.82rem; font-weight: 600; cursor: pointer;
    border: 1px solid rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05); color: var(--muted);
    transition: all 0.2s;
}
.scenario-btn.active { background: var(--teal); border-color: var(--teal); color: #0a0f1e; }

/* ── ANIMATIONS ── */
@keyframes fadeIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
@keyframes countUp { from { opacity: 0; transform: scale(0.8); } to { opacity: 1; transform: scale(1); } }
.section { animation: fadeIn 0.6s ease both; }
.kpi-value { animation: countUp 0.8s ease both; }

/* Responsive */
@media (max-width: 900px) {
    .grid-2, .grid-3, .grid-left { grid-template-columns: 1fr; }
    .navbar .nav-links { display: none; }
    .dot-nav { display: none; }
    .section { padding: 48px 20px; }
    .kpi-row { grid-template-columns: repeat(2, 1fr); }
}
"""


# ─────────────────────────────────────────────
#  UI
# ─────────────────────────────────────────────
app_ui = ui.page_fluid(
    ui.tags.head(
        ui.tags.style(CUSTOM_CSS),
        ui.tags.link(rel="preconnect", href="https://fonts.googleapis.com"),
        ui.tags.script("""
        document.addEventListener("DOMContentLoaded", () => {
          const sectionIds = Array.from(document.querySelectorAll("[id^='s']")).map(el => el.id);
          const dotLinks = Array.from(document.querySelectorAll(".dot-nav a"));
          const navLinks = Array.from(document.querySelectorAll(".nav-links a"));
          const navGroups = {
            s5: ["s5", "s6"],
            s9: ["s9", "s10"],
            s7: ["s7", "s8", "s11", "s13"],
            s12: ["s12"],
            s11: ["s11"],
            s14: ["s14"]
          };
          const setActive = (id) => {
            dotLinks.forEach(link => link.classList.toggle("active", link.getAttribute("href") === "#" + id));
            navLinks.forEach(link => {
              const target = link.getAttribute("href").slice(1);
              const group = navGroups[target] || [target];
              link.classList.toggle("active", group.includes(id));
            });
          };
          const observer = new IntersectionObserver((entries) => {
            const visible = entries
              .filter(entry => entry.isIntersecting)
              .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
            if (visible) setActive(visible.target.id);
          }, { threshold: [0.35, 0.55, 0.75] });
          sectionIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) observer.observe(el);
          });
          setActive(location.hash ? location.hash.slice(1) : "s0");
        });
        """),
    ),

    # ── Dot navigation
    ui.HTML("""
    <nav class="dot-nav" aria-label="Page sections">
      <a href="#s0" title="Intro"></a>
      <a href="#s1" title="Narrative"></a>
      <a href="#s2" title="Carbon Footprint"></a>
      <a href="#s3" title="Objectives"></a>
      <a href="#s4" title="Human Stakes"></a>
      <a href="#s5" title="Dashboard"></a>
      <a href="#s6" title="Growth Curve"></a>
      <a href="#s7" title="Adoption Map"></a>
      <a href="#s8" title="Race for Volume"></a>
      <a href="#s9" title="Charging Infra"></a>
      <a href="#s10" title="Charger Stress"></a>
      <a href="#s11" title="Fleet Turnover"></a>
      <a href="#s12" title="Powertrain Mix"></a>
      <a href="#s13" title="Equity"></a>
      <a href="#s14" title="Projection"></a>
      <a href="#s15" title="Conclusion"></a>
    </nav>
    """),

    # ── SECTION 0: Splash
    ui.div(
        ui.div(
            ui.HTML('<h1>E-Mobility Global Transition</h1>'),
            ui.HTML('<p>A data story about the shift to sustainable transport.</p>'),
            ui.HTML('<a href="#s1" class="begin-btn">Begin Narrative &nbsp;→</a>'),
            class_="",
        ),
        id="s0", class_="page", style="display:flex;align-items:center;justify-content:center;flex-direction:column;min-height:100vh;"
    ),

    # ── NAVBAR (sticky after splash)
    ui.div(
        ui.div("E-Mobility Global Transition", class_="brand"),
        ui.HTML("""<ul class="nav-links">
          <li><a href="#s5">Dashboard</a></li>
          <li><a href="#s9">Charging Infrastructure</a></li>
          <li><a href="#s7">Adoption Trends</a></li>
          <li><a href="#s12">Sustainability</a></li>
          <li><a href="#s11">Policy</a></li>
          <li><a href="#s14">Energy Grid</a></li>
        </ul>"""),
        class_="navbar"
    ),

    # ── SECTION 1: Narrative (Mateo)
    ui.div(
        ui.div(
            ui.div("URBAN TRANSITION NARRATIVE", class_="section-label"),
            ui.h1("Mateo's Quiet Revolution"),
            ui.p("Mateo is a taxi driver in Bogotá. For 20 years, he breathed the fumes of his diesel engine. "
                 "He was spending 40% of his income on fuel. In 2023, he switched to a used EV."),
            ui.HTML("""
            <div class="chart-panel" style="max-width:620px;padding:0;overflow:hidden;margin:24px 0;">
              <img src="images/img1.jpg"
                   style="width:100%;display:block;border-radius:12px;" alt="EV taxi night city"/>
            </div>
            """),
            ui.p("Now, his fuel costs have plummeted, and his daughter can sleep through the night without "
                 "the sound of his engine idling in the driveway. Mateo's story is not isolated; it represents a "
                 "micro-economic shift happening across global metropolises where individual operators "
                 "are finding an economic imperative to abandon internal combustion."),
            ui.p("Mateo is just one of 58 million drivers making the shift - but for many, the infrastructure "
                 "isn't there yet."),
            ui.HTML("""
            <div class="stat-row">
              <div class="stat-block">
                <div class="stat-label">Income Spent on Fuel (Pre-EV)</div>
                <div class="stat-value">40%</div>
                <div class="stat-progress"><div class="fill"></div></div>
              </div>
              <div class="stat-block">
                <div class="stat-label">Global Drivers Shifting</div>
                <div class="stat-value" style="color:var(--teal)">58M</div>
                <div style="font-size:0.78rem;color:var(--muted);margin-top:6px;">Projected active EV operators across emerging markets by 2025.</div>
              </div>
            </div>
            """),
            ui.div(
                ui.HTML('<div class="warn-title">⚠ The Infrastructure Gap</div>'),
                ui.p("While vehicle adoption is accelerating among independent operators, urban charging "
                     "infrastructure in cities like Bogotá lags behind demand by an estimated 65%, creating "
                     "charging deserts for high-mileage drivers."),
                class_="warn-box"
            ),
            class_="narrative-card"
        ),
        id="s1", class_="section", style="display:flex;justify-content:center;padding-top:80px;"
    ),

    # ── SECTION 2: Objectives
    ui.div(
        ui.div(
            ui.div("GLOBAL CARBON FOOTPRINT", class_="section-label", style="text-align:center;color:var(--red);"),
            ui.HTML("""
            <div style="text-align:center;margin:8px auto 40px;">
              <div style="font-family:Inter,sans-serif;font-size:clamp(96px,18vw,230px);line-height:.92;font-weight:700;color:#dbeafe;letter-spacing:0;">1.2</div>
              <div style="font-family:Inter,sans-serif;font-size:clamp(24px,4vw,42px);font-weight:700;color:var(--muted);margin-top:0;letter-spacing:0;">Billion Tons</div>
            </div>
            """),
            ui.div(
                ui.p("In 2024, passenger cars emitted 1.2 billion tons of CO2. That is the weight of 3,200 Empire State Buildings released into the atmosphere every single year.",
                     style="max-width:760px;text-align:center;margin:0 auto;font-size:1.15rem;line-height:1.8;"),
                class_="chart-panel",
                style="max-width:860px;margin:0 auto 48px;padding:40px;"
            ),
            ui.HTML('<div style="text-align:center;"><a href="#s3" class="begin-btn">Explore Solutions</a></div>'),
        ),
        id="s2", class_="section", style=f"min-height:100vh;display:flex;align-items:center;justify-content:center;background:{BG};"
    ),

    ui.div(
        ui.div(
            ui.div("CONTEXT & OBJECTIVE", class_="section-label", style="text-align:center;"),
            ui.h1("Preparing for the Next Phase of Expansion", style="text-align:center;max-width:none;"),
            ui.p("Mateo is planning to expand his small fleet, but he needs actionable intelligence to make "
                 "confident investment decisions. To navigate the complexities of the global e-mobility landscape, "
                 "we must answer three critical questions.", style="text-align:center;max-width:none;margin:0 auto 40px;"),
            ui.div(
                ui.div(
                    ui.HTML('<div style="font-size:1.5rem;margin-bottom:12px;">⛽</div>'),
                    ui.h3("Infrastructure Readiness"),
                    ui.p("Where is the charging gap widest? We analyze regional ratios of EVs to available "
                         "public and private charging points to identify bottlenecks."),
                    class_="chart-panel"
                ),
                ui.div(
                    ui.HTML('<div style="font-size:1.5rem;margin-bottom:12px;">🌍</div>'),
                    ui.h3("Market Intensity"),
                    ui.p("Which markets are truly leading on intensity, not just volume? We evaluate adoption "
                         "rates relative to total market size and local policies."),
                    class_="chart-panel"
                ),
                ui.div(
                    ui.HTML('<div style="font-size:1.5rem;margin-bottom:12px;">📈</div>'),
                    ui.h3("The Tipping Point"),
                    ui.p("When will the total global fleet finally tip toward electric? We forecast penetration "
                         "curves across major vehicle segments and geographies."),
                    class_="chart-panel"
                ),
                class_="grid-3"
            ),
            ui.HTML('<div style="text-align:center;margin-top:32px;"><a href="#s5" class="begin-btn">Proceed to Data Analysis →</a></div>'),
        ),
        id="s3", class_="section"
    ),

    # ── SECTION 3: Human Stakes
    ui.div(
        ui.div(
            ui.div(
                ui.h1("The Human Stakes of the Electric Transition"),
                ui.HTML("""
                <p style="margin:20px 0 12px;"><strong style="color:var(--white);">In 2010</strong>,
                there were roughly <strong style="color:var(--teal);">20,000</strong> electric cars on the planet.</p>
                <p style="margin:12px 0;"><strong style="color:var(--white);">By 2024</strong>,
                that number had grown to <strong style="color:var(--white);">58 million</strong>.</p>
                <p style="margin:12px 0;"><strong style="color:var(--teal);">By 2030</strong>,
                the IEA projects 232 million - roughly one in every three new cars sold.</p>
                <hr style="border-color:rgba(255,255,255,0.1);margin:20px 0;"/>
                <p>This is the fastest technology adoption in the history of personal transportation.
                But the transition is uneven, the infrastructure is lagging in some markets, and the
                2030 targets assume policies that aren't yet in place.</p>
                <p style="font-size:0.75rem;letter-spacing:2px;text-transform:uppercase;color:var(--muted);margin-top:24px;">
                SCROLL TO SEE THE FULL STORY IN DATA.</p>
                """),
                style="flex:1;"
            ),
            ui.div(
                ui.HTML("""
                <img src="images/img2.webp"
                     style="width:100%;border-radius:12px;object-fit:cover;max-height:440px;" alt="EV charging"/>
                """),
                style="flex:1;"
            ),
            style="display:flex;gap:48px;align-items:center;flex-wrap:wrap;"
        ),
        id="s4", class_="section"
    ),

    # ── SECTION 4: Dashboard / KPI
    ui.div(
        ui.div(
            ui.h2("Global EV Snapshot"),
            ui.p("Status check: 2024 vs 2030 projections"),
            ui.div(
                ui.div(ui.HTML('<div class="kpi-label">EV cars on the road</div><div class="kpi-value">58.1 M</div>'), class_="kpi-card"),
                ui.div(ui.HTML('<div class="kpi-label">Share of car stock</div><div class="kpi-value">~5-6%</div>'), class_="kpi-card"),
                ui.div(ui.HTML('<div class="kpi-label">Share of new car sales</div><div class="kpi-value" style="color:var(--orange);">~22%</div>'), class_="kpi-card highlight"),
                ui.div(ui.HTML('<div class="kpi-label">Public charging points</div><div class="kpi-value">~5.4 M</div>'), class_="kpi-card"),
                ui.div(ui.HTML('<div class="kpi-label">IEA STEPS 2030 proj.</div><div class="kpi-value" style="color:var(--red);">232 M</div>'), class_="kpi-card alert"),
                class_="kpi-row"
            ),
            ui.div(
                ui.div(
                    ui.HTML('<div class="chart-title">EV STOCK GROWTH (2010-2024)</div>'),
                    output_widget("chart_stock_bar"),
                    class_="chart-panel"
                ),
                ui.div(
                    ui.HTML('<div class="chart-title">EV SALES SHARE TREND (%)</div>'),
                    output_widget("chart_sales_share"),
                    class_="chart-panel"
                ),
                class_="grid-2"
            ),
            ui.div(
                ui.HTML("""<span style="color:var(--muted);">"The EV fleet is growing - but sales are outrunning stock by a 3-4× margin. The legacy ICE fleet is still enormous."</span>"""),
                class_="insight-box"
            ),
        ),
        id="s5", class_="section"
    ),

    # ── SECTION 5: Growth Curve
    ui.div(
        ui.div(
            ui.div("TRAJECTORY", class_="section-label"),
            ui.h1("The Growth Curve"),
            ui.p("When linear curiosity became an exponential revolution."),
            ui.div(
                output_widget("chart_growth_curve"),
                class_="chart-panel"
            ),
            ui.div(
                ui.HTML('<span style="color:var(--white);">📈 </span><span>"The sales share line leads the stock line by several years - a leading indicator of the fleet transition to come."</span>'),
                class_="insight-box"
            ),
        ),
        id="s6", class_="section"
    ),

    # ── SECTION 6: Race for Volume (animated bar chart)
    ui.div(
        ui.div(
            ui.h1("Who Is Winning on Intensity?"),
            ui.p("Global stock share is unevenly distributed, with Nordic countries continuing to lead the transition."),
            ui.div(
                ui.div(
                    output_widget("chart_adoption_map"),
                    class_="chart-panel"
                ),
                ui.div(
                    ui.div(
                        ui.HTML("""
                        <div class="hl-label">HIGHLIGHT</div>
                        <div class="hl-value">Norway: 1 in 4 cars is electric.</div>
                        """),
                        class_="highlight-card", style="margin-bottom:20px;"
                    ),
                    ui.HTML('<div style="font-size:0.7rem;letter-spacing:2px;color:var(--muted);margin-bottom:12px;">TOP 3 BY EV SHARE (2024)</div>'),
                    ui.HTML("""
                    <div class="rank-item"><span class="rank-num">1</span><span class="rank-name">Norway<br><small style="color:var(--muted);font-weight:400;">Nordic Region</small></span><span class="rank-val">32.0%</span></div>
                    <div class="rank-item"><span class="rank-num">2</span><span class="rank-name">Iceland<br><small style="color:var(--muted);font-weight:400;">Nordic Region</small></span><span class="rank-val">18.0%</span></div>
                    <div class="rank-item"><span class="rank-num">3</span><span class="rank-name">Denmark<br><small style="color:var(--muted);font-weight:400;">Nordic Region</small></span><span class="rank-val">17.0%</span></div>
                    """),
                    ui.HTML("""
                    <hr style="border-color:rgba(255,255,255,0.07);margin:16px 0;">
                    <div style="font-size:0.75rem;color:var(--muted);">GLOBAL AVERAGE</div>
                    <div style="font-family:Inter,sans-serif;font-size:2rem;font-weight:700;letter-spacing:0;">2.8%</div>
                    <div style="font-size:0.8rem;color:var(--teal);">â†‘ +0.5% YoY</div>
                    """),
                    class_="grid-right-panel"
                ),
                class_="grid-left"
            ),
        ),
        id="s7", class_="section"
    ),

    ui.div(
        ui.div(
            ui.h1("The Race for Volume"),
            ui.p("Where raw scale meets industrial ambition."),
            ui.div(
                output_widget("chart_race"),
                class_="chart-panel"
            ),
            ui.div(
                ui.input_slider("race_year", "", min=2010, max=2024, value=2024, step=1, animate=True, width="100%"),
                ui.HTML("""
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;font-size:0.78rem;letter-spacing:1.4px;color:var(--muted);font-weight:700;text-transform:uppercase;">
                  <span>2010</span>
                  <span style="color:var(--teal);">Drag year slicer</span>
                  <span>2024</span>
                </div>
                """),
                class_="chart-panel race-controls",
                style="max-width:760px;margin:20px auto 0;padding:18px 28px;"
            ),
        ),
        id="s8", class_="section", style=f"background:{BG2};"
    ),

    # ── SECTION 7: Charging Infrastructure
    ui.div(
        ui.div(
            ui.h1("Chicken or Egg?"),
            ui.p("The fragile balance between EV deployment and public charging infrastructure."),
            ui.div(
                ui.div(
                    ui.div(
                        ui.HTML('<div class="chart-title">GLOBAL EV FLEET (MILLIONS)</div>'),
                        output_widget("chart_ev_fleet"),
                        class_="chart-panel", style="margin-bottom:16px;"
                    ),
                    ui.div(
                        ui.HTML('<div class="chart-title">PUBLIC CHARGING POINTS (MILLIONS)</div>'),
                        output_widget("chart_charging"),
                        class_="chart-panel"
                    ),
                ),
                ui.div(
                    ui.div(
                        ui.HTML('<div class="kpi-label">Chargers per EV (2010)</div><div class="kpi-value" style="font-size:2rem;color:var(--orange);">1 : 4</div>'),
                        class_="kpi-card", style="margin-bottom:16px;"
                    ),
                    ui.div(
                        ui.HTML('<div class="kpi-label">Chargers per EV (2024)</div><div class="kpi-value" style="font-size:2rem;color:var(--teal);">1 : 12</div>'),
                        class_="kpi-card highlight", style="margin-bottom:16px;"
                    ),
                    ui.div(
                        ui.HTML("""
                        <div style="font-size:0.8rem;font-weight:600;color:var(--teal);margin-bottom:8px;">📡 Narrative Insight</div>
                        <p style="font-size:0.85rem;max-width:none;">Globally, chargers slightly led EVs through 2022.
                        Since then, EV deployment has outpaced new charging points, creating a widening
                        infrastructure deficit in dense urban corridors.</p>
                        """),
                        class_="chart-panel"
                    ),
                    style="display:flex;flex-direction:column;"
                ),
                class_="grid-left"
            ),
        ),
        id="s9", class_="section"
    ),

    # ── SECTION 8: Charger Stress
    ui.div(
        ui.div(
            ui.h2("Charger Stress: The Infrastructure Gap"),
            ui.p("Where adoption outruns the grid."),
            ui.div(
                ui.div(
                    output_widget("chart_charger_stress"),
                    class_="chart-panel"
                ),
                ui.div(
                    ui.HTML("""
                    <div class="highlight-card" style="margin-bottom:16px;">
                      <div class="hl-label">⚠ Most Stressed Market</div>
                      <div class="hl-value">New Zealand</div>
                    </div>
                    <div style="margin-bottom:16px;">
                      <div style="font-size:0.75rem;color:var(--muted);margin-bottom:4px;">EVs per Public Charger</div>
                      <div style="font-family:Inter,sans-serif;font-size:2.5rem;font-weight:700;color:var(--red);letter-spacing:0;">78.2</div>
                    </div>
                    <p style="font-size:0.83rem;max-width:none;">Rapid EV adoption has significantly outpaced public infrastructure development,
                    creating high potential for charge anxiety among urban apartment dwellers and long-distance drivers.</p>
                    <hr style="border-color:rgba(255,255,255,0.07);margin:16px 0;">
                    <div style="font-size:0.75rem;color:var(--muted);margin-bottom:8px;">GLOBAL CONTEXT</div>
                    <p style="font-size:0.83rem;max-width:none;">While China maintains a comfortable 7:1 ratio despite
                    massive scale, emerging EV markets are consistently hitting the "Stress Threshold" (30:1) before
                    regulatory intervention accelerates grid deployment.</p>
                    """),
                    class_="grid-right-panel"
                ),
                class_="grid-left"
            ),
            ui.div("CRITICAL STRESS ZONES (HIGHEST EV-TO-CHARGER RATIO)", style="font-size:0.7rem;letter-spacing:2px;font-weight:700;color:var(--muted);margin-top:24px;"),
            ui.div(
                ui.HTML('<div class="stress-chip critical">⚠ New Zealand &nbsp; 78 EVs/charger</div>'),
                ui.HTML('<div class="stress-chip warn">Australia &nbsp; 45 EVs/charger</div>'),
                ui.HTML('<div class="stress-chip warn">Mexico &nbsp; 37 EVs/charger</div>'),
                ui.HTML('<div class="stress-chip warn">USA &nbsp; 33 EVs/charger</div>'),
                ui.HTML('<div class="stress-chip warn">Norway &nbsp; 31 EVs/charger</div>'),
                class_="stress-chips"
            ),
        ),
        id="s10", class_="section", style=f"background:{BG2};"
    ),

    # ── SECTION 9: Adoption Map / Globe
    ui.div(
        ui.div(
            ui.h1("Who Is Winning on Intensity?"),
            ui.p("Global stock share is unevenly distributed, with Nordic countries continuing to lead the transition."),
            ui.div(
                ui.div(
                    ui.HTML(""),
                    class_="chart-panel"
                ),
                ui.div(
                    ui.div(
                        ui.HTML("""
                        <div class="hl-label">HIGHLIGHT</div>
                        <div class="hl-value">Norway: 1 in 4 cars is electric.</div>
                        """),
                        class_="highlight-card", style="margin-bottom:20px;"
                    ),
                    ui.HTML('<div style="font-size:0.7rem;letter-spacing:2px;color:var(--muted);margin-bottom:12px;">TOP 3 BY EV SHARE (2024)</div>'),
                    ui.HTML("""
                    <div class="rank-item"><span class="rank-num">1</span><span class="rank-name">Norway<br><small style="color:var(--muted);font-weight:400;">Nordic Region</small></span><span class="rank-val">32.0%</span></div>
                    <div class="rank-item"><span class="rank-num">2</span><span class="rank-name">Iceland<br><small style="color:var(--muted);font-weight:400;">Nordic Region</small></span><span class="rank-val">18.0%</span></div>
                    <div class="rank-item"><span class="rank-num">3</span><span class="rank-name">Denmark<br><small style="color:var(--muted);font-weight:400;">Nordic Region</small></span><span class="rank-val">17.0%</span></div>
                    """),
                    ui.HTML("""
                    <hr style="border-color:rgba(255,255,255,0.07);margin:16px 0;">
                    <div style="font-size:0.75rem;color:var(--muted);">GLOBAL AVERAGE</div>
                    <div style="font-family:Inter,sans-serif;font-size:2rem;font-weight:700;letter-spacing:0;">2.8%</div>
                    <div style="font-size:0.8rem;color:var(--teal);">↑ +0.5% YoY</div>
                    """),
                    class_="grid-right-panel"
                ),
                class_="grid-left"
            ),
        ),
        id="duplicate_adoption", class_="section", style="display:none;"
    ),

    # ── SECTION 10: Powertrain Mix
    ui.div(
        ui.div(
            ui.div("SUSTAINABILITY", class_="section-label"),
            ui.h2("Composition: The Powertrain Mix"),
            ui.p("Does wealth dictate the shift to pure electric?"),
            ui.div(
                ui.div(
                    ui.HTML('<div class="chart-title">TOP 12 MARKETS: BEV VS PHEV RATIO</div>'),
                    ui.HTML(""),
                    class_="chart-panel"
                ),
                ui.div(
                    ui.HTML('<div class="chart-title">EV STOCK SHARE BY COUNTRY (2024)</div>'),
                    ui.HTML(""),
                    class_="chart-panel"
                ),
                class_="grid-2"
            ),
            ui.div(
                ui.HTML('<span style="color:var(--muted);">ℹ "Most lower-middle income countries maintain a higher PHEV proportion as a stepping stone to full electrification."</span>'),
                class_="insight-box"
            ),
        ),
        id="duplicate_powertrain", class_="section", style="display:none;"
    ),

    # ── SECTION 11: Fleet Turnover
    ui.div(
        ui.div(
            ui.div("ADOPTION TRENDS", class_="section-label"),
            ui.h2("Fleet Turnover: The Turnover Gap"),
            ui.p("Why replacing a 1B+ car fleet takes decades."),
            ui.div(
                ui.div(
                    output_widget("chart_fleet_turnover"),
                    class_="chart-panel"
                ),
                ui.div(
                    ui.div(
                        ui.HTML('<div class="kpi-label">GAP IN 2024</div><div class="kpi-value" style="color:var(--teal);">14 pp</div>'),
                        class_="kpi-card", style="margin-bottom:16px;"
                    ),
                    ui.div(
                        ui.HTML('<div class="kpi-label">EST. FLEET AGE</div><div class="kpi-value" style="color:var(--orange);">12.5 Yrs</div><div style="font-size:0.8rem;color:var(--muted);margin-top:6px;">Average lifespan of an ICE vehicle before retirement delays full transition.</div>'),
                        class_="kpi-card", style="margin-bottom:16px;"
                    ),
                    ui.div(
                        ui.HTML("""
                        <div style="font-size:0.85rem;font-weight:700;color:var(--white);margin-bottom:8px;">Policy Intervention</div>
                        <p style="font-size:0.83rem;max-width:none;color:var(--muted);">Cash-for-clunkers and accelerated scrappage schemes are required to close the stock gap.</p>
                        """),
                        class_="chart-panel"
                    ),
                    style="display:flex;flex-direction:column;"
                ),
                class_="grid-left"
            ),
        ),
        id="s11", class_="section"
    ),

    # ── SECTION 12: Equity
    ui.div(
        ui.div(
            ui.div("SUSTAINABILITY", class_="section-label"),
            ui.h2("Composition: The Powertrain Mix"),
            ui.p("Does wealth dictate the shift to pure electric?"),
            ui.div(
                ui.div(
                    ui.HTML('<div class="chart-title">TOP 12 MARKETS: BEV VS PHEV RATIO</div>'),
                    output_widget("chart_bev_phev"),
                    class_="chart-panel"
                ),
                ui.div(
                    ui.HTML('<div class="chart-title">EV STOCK SHARE BY COUNTRY (2024)</div>'),
                    output_widget("chart_stock_share_bar"),
                    class_="chart-panel"
                ),
                class_="grid-2"
            ),
            ui.div(
                ui.HTML('<span style="color:var(--muted);">"Most lower-middle income countries maintain a higher PHEV proportion as a stepping stone to full electrification."</span>'),
                class_="insight-box"
            ),
        ),
        id="s12", class_="section", style=f"background:{BG2};"
    ),

    ui.div(
        ui.div(
            ui.div("ADOPTION TRENDS", class_="section-label"),
            ui.h2("Equity: Who Gets Left Behind?"),
            ui.p("How national income shapes charging infrastructure and adoption."),
            ui.div(
                ui.div(
                    output_widget("chart_equity"),
                    class_="chart-panel"
                ),
                ui.div(
                    ui.div(
                        ui.HTML("""
                        <div class="hl-label">OUTLIER FOCUS</div>
                        <div class="hl-value">China</div>
                        <p style="font-size:0.83rem;max-width:none;margin-top:8px;">Defying the upper-middle income average through aggressive state subsidies and localized manufacturing ecosystems.</p>
                        """),
                        class_="highlight-card"
                    ),
                    style="display:flex;flex-direction:column;justify-content:center;"
                ),
                class_="grid-left"
            ),
            ui.p("High-income countries dominate, but outliers like China show that policy can beat income expectations. "
                 "The cluster in the bottom-left reveals the steep infrastructure barrier for lower-middle income nations."),
        ),
        id="s13", class_="section", style=f"background:{BG2};"
    ),

    # ── SECTION 13: ARIMA Projection
    ui.div(
        ui.div(
            ui.h2("Forecasting the Global EV Stock"),
            ui.p("Comparing statistical ARIMA projections with the IEA Stated Policies Scenario (STEPS) through 2030."),
            ui.div(
                ui.div(
                    output_widget("chart_projection"),
                    class_="chart-panel"
                ),
                ui.div(
                    ui.div(
                        ui.HTML('<div class="kpi-label">ARIMA PROJECTED MEAN (2030)</div><div class="kpi-value" style="color:var(--orange);">246 M</div><div style="font-size:0.8rem;color:var(--muted);margin-top:6px;">Statistical baseline derived from historical growth patterns.</div>'),
                        class_="kpi-card", style="margin-bottom:16px;"
                    ),
                    ui.div(
                        ui.HTML('<div class="kpi-label">IEA STEPS TARGET (2030)</div><div class="kpi-value" style="color:var(--teal);">232 M</div><div style="font-size:0.8rem;color:var(--muted);margin-top:6px;">Stated Policies Scenario. Falls comfortably within the 80% confidence interval of the ARIMA model.</div>'),
                        class_="kpi-card highlight"
                    ),
                    style="display:flex;flex-direction:column;"
                ),
                class_="grid-left"
            ),
            ui.HTML("""
            <div class="chart-panel" style="margin-top:16px;">
              <div class="chart-title">PROJECTED 2030 STOCK SHARE BY MAJOR MARKETS</div>
              <div style="display:flex;height:40px;border-radius:6px;overflow:hidden;margin-top:12px;">
                <div style="flex:45;background:var(--teal);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;color:#0a0f1e;">CN 45%</div>
                <div style="flex:20;background:rgba(45,212,191,0.5);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:0.82rem;">EU 20%</div>
                <div style="flex:15;background:rgba(45,212,191,0.3);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:0.82rem;">US 15%</div>
                <div style="flex:5;background:rgba(45,212,191,0.15);display:flex;align-items:center;justify-content:center;font-size:0.8rem;">IN 5%</div>
                <div style="flex:15;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;font-size:0.75rem;color:var(--muted);">Rest</div>
              </div>
              <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:0.72rem;color:var(--muted);">
                <span>Major Markets Dominating Adoption</span><span>Rest of World represents ~15%</span>
              </div>
            </div>
            """),
        ),
        id="s14", class_="section"
    ),

    # ── SECTION 14: Conclusion
    ui.div(
        ui.div(
            ui.h1("The hockey stick is real - but the fleet lags the market.", style="max-width:600px;"),
            ui.HTML('<h2 style="color:var(--teal);font-size:1.5rem;margin-bottom:24px;">Two winning playbooks, not one.</h2>'),
            ui.div(
                ui.p("While global EV sales share approaches a pivotal 20% threshold, the actual stock of "
                     "vehicles on the road remains anchored at merely 5-6%. This structural lag dictates "
                     "the pace of true emission reductions."),
                ui.p("Success is not monolithic. Norway demonstrates the ceiling of adoption intensity "
                     "through comprehensive policy, while China executes flawlessly on sheer manufacturing volume."),
                ui.p("The critical bottleneck remaining in 2024 is the supporting physical network: charging "
                     "infrastructure continues to globally underperform relative to vehicle deployment rates."),
                style="flex:1;"
            ),
            ui.div(
                ui.div(
                    ui.HTML('<div class="chart-title">PROJECTED FLEET EVOLUTION - EV STOCK SHARE</div>'),
                    output_widget("chart_conclusion"),
                    class_="chart-panel"
                ),
                style="flex:1;"
            ),
            style="display:flex;gap:48px;align-items:flex-start;flex-wrap:wrap;"
        ),
        ui.HTML("""
        <div style="display:flex;gap:12px;margin-top:40px;justify-content:flex-start;padding:0 40px;">
          <a href="#s5" class="begin-btn" style="font-size:0.85rem;">Explore the data →</a>
          <a href="#s0" class="begin-btn" style="background:transparent;border:1px solid rgba(255,255,255,0.2);color:var(--muted);">Back to top ↑</a>
        </div>
        """),
        id="s15", class_="section"
    ),

    # ── FOOTER
    ui.div(
        ui.HTML("© 2025 Global EV Data Narrative. Data: IEA Global EV Outlook 2025."),
        ui.HTML('<div><a href="#">Methodology</a> &nbsp; <a href="#">Data Sources</a> &nbsp; <a href="#">Privacy Policy</a></div>'),
        class_="footer"
    ),
)


# ─────────────────────────────────────────────
#  SERVER
# ─────────────────────────────────────────────
def server(input, output, session):

    # ── KPI: EV Stock Bar
    @render_widget
    def chart_stock_bar():
        fig = go.Figure()
        years = sorted(world_stock["year"].tolist())
        vals = world_stock.set_index("year")["value"]

        colors = [TEAL if y == 2024 else "rgba(45,212,191,0.45)" for y in years]
        fig.add_bar(
            x=[str(y) for y in years],
            y=[vals[y] / 1e6 for y in years],
            marker_color=colors,
            marker_line_width=0,
            hovertemplate="%{x}: %{y:.1f}M vehicles<extra></extra>",
        )
        fig.add_scatter(
            x=["2030"], y=[232],
            mode="markers+text",
            marker=dict(symbol="star", size=16, color=ORANGE),
            text=["232M STEPS"], textposition="top center",
            textfont=dict(color=ORANGE, size=10), name="IEA STEPS 2030"
        )
        apply_theme(fig, height=280, showlegend=False,
                    yaxis_title="Millions of Vehicles",
                    xaxis_tickangle=-45)
        return fig

    # ── KPI: Sales Share Line
    @render_widget
    def chart_sales_share():
        fig = go.Figure()
        fig.add_scatter(
            x=world_sales_share["year"].tolist(),
            y=world_sales_share["value"].tolist(),
            mode="lines+markers",
            line=dict(color=TEAL, width=3),
            marker=dict(size=6, color=TEAL),
            fill="tozeroy",
            fillcolor="rgba(45,212,191,0.08)",
            hovertemplate="%{x}: %{y:.1f}%<extra></extra>",
            name="Sales Share"
        )
        fig.add_hline(y=20, line_dash="dot", line_color=ORANGE,
                      annotation_text="20% milestone", annotation_font_color=ORANGE)
        apply_theme(fig, height=280, yaxis_ticksuffix="%")
        return fig

    # ── Growth Curve (dual axis)
    @render_widget
    def chart_growth_curve():
        fig = make_subplots(specs=[[{"secondary_y": True}]])

        # Stock
        fig.add_scatter(
            x=world_stock["year"].tolist(),
            y=[v / 1e6 for v in world_stock["value"].tolist()],
            mode="lines", name="EV Stock (M)", secondary_y=False,
            line=dict(color=TEAL, width=3),
            fill="tozeroy", fillcolor="rgba(45,212,191,0.1)",
        )
        # Sales share
        fig.add_scatter(
            x=world_sales_share["year"].tolist(),
            y=world_sales_share["value"].tolist(),
            mode="lines", name="EV Sales Share (%)", secondary_y=True,
            line=dict(color=ORANGE, width=2.5, dash="dot"),
        )

        # Milestone annotations
        for yr, label in [(2015, "Paris Agreement"), (2017, "China NEV Mandate"),
                          (2020, "Stimulus"), (2022, "EU ICE Ban")]:
            fig.add_vline(x=yr, line_dash="dot", line_color="rgba(255,255,255,0.15)",
                          annotation_text=label,
                          annotation_font_size=10, annotation_font_color=MUTED)

        apply_theme(fig, height=380,
                    yaxis_title="EV Stock (Millions)", yaxis2_title="Sales Share (%)",
                    yaxis2=dict(gridcolor="rgba(0,0,0,0)", ticksuffix="%", color=ORANGE))
        fig.update_yaxes(secondary_y=True, showgrid=False)
        return fig

    # ── Race for Volume
    @render_widget
    def chart_race():
        yr = input.race_year()
        data_yr = country_stock_pivot[country_stock_pivot["year"] == yr].copy()
        data_yr = data_yr.sort_values("value", ascending=True).tail(10)
        countries = data_yr["region_country"].tolist()
        values = [v / 1e6 for v in data_yr["value"].tolist()]
        colors = [TEAL if countries[i] == "China" else "rgba(45,212,191,0.4)" for i in range(len(countries))]
        max_axis = country_stock_pivot.groupby("year")["value"].nlargest(10).max() / 1e6

        fig = go.Figure()
        fig.add_bar(
            x=values, y=countries, orientation="h",
            marker_color=colors, marker_line_width=0,
            text=[f"{v:.1f}M" for v in values],
            textposition="outside", textfont=dict(color=WHITE, size=14, family="Inter"),
            hovertemplate="%{y}: %{x:.2f}M EVs<extra></extra>",
        )
        max_v = max(values) if values else 1
        if countries and "China" in countries[-3:]:
            fig.add_annotation(
                x=max_v * 0.62, y=countries[-1],
                text="China takes the lead - and never looks back.",
                showarrow=True, arrowhead=1, arrowcolor=TEAL,
                font=dict(size=12, color=WHITE, family="Inter"),
                bgcolor=PANEL, bordercolor=TEAL, borderwidth=1
            )
        apply_theme(fig, height=520, xaxis_title="EV Stock (Millions)",
                    xaxis_range=[0, max_axis * 1.18],
                    yaxis=dict(categoryorder="array", categoryarray=countries),
                    transition=dict(duration=450, easing="cubic-in-out"),
                    bargap=0.28)
        fig.update_layout(
            title=dict(text=f"<b style='color:{TEAL};font-size:72px;'>{yr}</b>",
                       x=0.98, xanchor="right", y=0.98, yanchor="top",
                       font=dict(family="Inter", size=72, color=TEAL)),
            uirevision="race",
        )
        fig.update_xaxes(showgrid=False, zeroline=False)
        fig.update_yaxes(tickfont=dict(size=14, color=WHITE, family="Inter"))
        return fig

    # ── EV Fleet stacked area
    @render_widget
    def chart_ev_fleet():
        fig = go.Figure()
        yrs = sorted(world_stock_pt.index.tolist())
        for pt, color, name in [("BEV", TEAL, "BEV"), ("PHEV", ORANGE, "PHEV"), ("FCEV", "#a855f7", "FCEV")]:
            if pt in world_stock_pt.columns:
                fig.add_scatter(
                    x=yrs, y=[world_stock_pt.loc[y, pt] / 1e6 if y in world_stock_pt.index else 0 for y in yrs],
                    mode="lines", name=name, stackgroup="one",
                    line=dict(color=color, width=0),
                    fillcolor=color.replace(")", ",0.7)").replace("rgb", "rgba") if "rgb" in color else hex_to_rgba(color, 0.7),
                    hovertemplate=f"{name} %{{x}}: %{{y:.2f}}M<extra></extra>",
                )
        fig.add_vline(x=2022, line_color=RED, line_width=1.5,
                      annotation_text="2022 INFLECTION", annotation_font_color=RED, annotation_font_size=10)
        apply_theme(fig, height=220, yaxis_title="M Vehicles", showlegend=True,
                    legend=dict(orientation="h", x=1, xanchor="right", y=1.15))
        return fig

    # ── Charging points stacked area
    @render_widget
    def chart_charging():
        fig = go.Figure()
        yrs = sorted(charging_pt.index.tolist())
        for col, color, name in [("Fast", ORANGE, "Fast"), ("Slow", "#64748b", "Slow")]:
            if col in charging_pt.columns:
                fig.add_scatter(
                    x=yrs, y=[charging_pt.loc[y, col] / 1e6 if y in charging_pt.index else 0 for y in yrs],
                    mode="lines", name=name, stackgroup="one",
                    line=dict(color=color, width=0),
                    hovertemplate=f"{name} %{{x}}: %{{y:.2f}}M<extra></extra>",
                )
        apply_theme(fig, height=220, yaxis_title="M Points", showlegend=True,
                    legend=dict(orientation="h", x=1, xanchor="right", y=1.15))
        return fig

    # ── Charger Stress Scatter
    @render_widget
    def chart_charger_stress():
        plot_df = ratio_df.dropna().copy()
        plot_df = plot_df[plot_df["chargers"] > 0]

        colors = []
        for r in plot_df["ratio"]:
            if r > 30: colors.append(RED)
            elif r > 15: colors.append(ORANGE)
            else: colors.append(TEAL)

        fig = go.Figure()
        fig.add_scatter(
            x=plot_df["stock"].tolist(),
            y=plot_df["ratio"].tolist(),
            mode="markers",
            marker=dict(
                size=[max(10, min(40, s / 1e5)) for s in plot_df["stock"]],
                color=colors, opacity=0.8, line=dict(width=0)
            ),
            text=plot_df.index.tolist(),
            hovertemplate="<b>%{text}</b><br>EV Stock: %{x:,.0f}<br>EVs/Charger: %{y:.1f}<extra></extra>",
        )
        fig.add_hline(y=30, line_dash="dot", line_color=RED,
                      annotation_text="Stress Threshold (30)", annotation_font_color=RED)
        fig.add_hline(y=10, line_dash="dot", line_color=TEAL,
                      annotation_text="Comfort Threshold (10)", annotation_font_color=TEAL)
        apply_theme(fig, height=380, xaxis_type="log",
                    xaxis_title="Total EV Stock (log scale)", yaxis_title="EVs per Public Charger")
        return fig

    # ── Adoption Map (choropleth)
    @render_widget
    def chart_adoption_map():
        fig = go.Figure(go.Choropleth(
            locations=stock_share_2024["region_country"].tolist(),
            z=stock_share_2024["value"].tolist(),
            locationmode="country names",
            colorscale=[[0, BG2], [0.2, "#0d4a4a"], [0.5, TEAL2], [1.0, TEAL]],
            colorbar=dict(
                title=dict(text="EV Stock Share (%)", font=dict(color=MUTED)),
                tickfont=dict(color=MUTED),
                bgcolor="rgba(0,0,0,0)"
            ),
            hovertemplate="<b>%{location}</b><br>EV Stock Share: %{z:.1f}%<extra></extra>",
        ))
        fig.update_geos(
            showframe=False, showcoastlines=False,
            bgcolor="rgba(0,0,0,0)",
            landcolor="#0f1d30", oceancolor="#050c1a",
            projection_type="natural earth",
        )
        apply_theme(fig, height=360, geo=dict(bgcolor="rgba(0,0,0,0)"))
        fig.update_layout(margin=dict(l=0, r=0, t=20, b=0))
        return fig

    # ── BEV vs PHEV horizontal stacked
    @render_widget
    def chart_bev_phev():
        countries = bev_phev_top.index.tolist()
        bev_pct = bev_phev_top["bev_pct"].tolist()
        phev_pct = [100 - v for v in bev_pct]

        fig = go.Figure()
        fig.add_bar(y=countries, x=bev_pct, name="BEV", orientation="h",
                    marker_color="rgba(147,197,253,0.8)", marker_line_width=0,
                    text=[f"{v:.0f}%" for v in bev_pct], textposition="inside",
                    textfont=dict(color="#0f172a", size=11),
                    hovertemplate="%{y} BEV: %{x:.1f}%<extra></extra>")
        fig.add_bar(y=countries, x=phev_pct, name="PHEV", orientation="h",
                    marker_color="rgba(251,146,60,0.7)", marker_line_width=0,
                    text=[f"{v:.0f}%" if v > 8 else "" for v in phev_pct], textposition="inside",
                    textfont=dict(color="#0f172a", size=11),
                    hovertemplate="%{y} PHEV: %{x:.1f}%<extra></extra>")
        apply_theme(fig, height=360, barmode="stack",
                    xaxis=dict(range=[0, 100], ticksuffix="%"),
                    showlegend=True,
                    legend=dict(orientation="h", y=1.08, x=1, xanchor="right"))
        return fig

    # ── Stock share horizontal bar
    @render_widget
    def chart_stock_share_bar():
        df_sorted = stock_share_2024.sort_values("value")
        colors = [TEAL if v > 15 else (TEAL2 if v > 8 else "rgba(45,212,191,0.4)")
                  for v in df_sorted["value"]]
        fig = go.Figure(go.Bar(
            x=df_sorted["value"].tolist(),
            y=df_sorted["region_country"].tolist(),
            orientation="h",
            marker_color=colors, marker_line_width=0,
            text=[f"{v:.1f}%" for v in df_sorted["value"]],
            textposition="outside", textfont=dict(color=WHITE, size=10),
            hovertemplate="%{y}: %{x:.1f}%<extra></extra>",
        ))
        apply_theme(fig, height=360, xaxis_ticksuffix="%",
                    xaxis_range=[0, df_sorted["value"].max() * 1.25])
        return fig

    # ── Fleet Turnover dual line
    @render_widget
    def chart_fleet_turnover():
        fig = go.Figure()
        # Historical
        fig.add_scatter(
            x=sales_share_world["year"].tolist(),
            y=sales_share_world["value"].tolist(),
            mode="lines", name="EV Sales Share (Historical)",
            line=dict(color=TEAL, width=2.5),
        )
        fig.add_scatter(
            x=stock_share_world["year"].tolist(),
            y=stock_share_world["value"].tolist(),
            mode="lines", name="EV Stock Share (Historical)",
            line=dict(color=ORANGE, width=2.5),
        )
        # Projections dotted
        all_proj_sales = pd.concat([
            sales_share_world[sales_share_world["year"] == 2024],
            sales_share_proj
        ]).drop_duplicates("year").sort_values("year")
        all_proj_stock = pd.concat([
            stock_share_world[stock_share_world["year"] == 2024],
            stock_share_proj
        ]).drop_duplicates("year").sort_values("year")

        fig.add_scatter(
            x=all_proj_sales["year"].tolist(),
            y=all_proj_sales["value"].tolist(),
            mode="lines", name="Sales Share (STEPS)",
            line=dict(color=TEAL, width=2, dash="dot"),
        )
        fig.add_scatter(
            x=all_proj_stock["year"].tolist(),
            y=all_proj_stock["value"].tolist(),
            mode="lines", name="Stock Share (STEPS)",
            line=dict(color=ORANGE, width=2, dash="dot"),
        )
        fig.add_hline(y=30, line_dash="dot", line_color="rgba(255,255,255,0.2)",
                      annotation_text="IEA 2030 Target", annotation_font_color=ORANGE)
        # Gap annotation at 2024
        ss_2024 = float(sales_share_world[sales_share_world["year"] == 2024]["value"].values[0]) if len(sales_share_world[sales_share_world["year"] == 2024]) else 22
        st_2024 = float(stock_share_world[stock_share_world["year"] == 2024]["value"].values[0]) if len(stock_share_world[stock_share_world["year"] == 2024]) else 5.5
        fig.add_annotation(x=2024, y=(ss_2024 + st_2024) / 2,
                           text="14pp Replacement Lag",
                           showarrow=True, arrowhead=1, arrowcolor=MUTED,
                           font=dict(size=11, color=WHITE),
                           bgcolor=PANEL, bordercolor=MUTED)
        apply_theme(fig, height=380, yaxis_ticksuffix="%",
                    yaxis_title="Share (%)", xaxis_range=[2010, 2030])
        return fig

    # ── Equity bubble chart
    @render_widget
    def chart_equity():
        # Build charger density vs EV sales share
        sales_share_country = df[
            (df["parameter"] == "EV sales share") & (df["mode"] == "Cars") &
            (df["category"] == "Historical") & (df["year"] == 2023) &
            (df["powertrain"] == "EV") & (~df["region_country"].isin(EXCLUDE_REGIONS))
        ].set_index("region_country")["value"]

        charger_density_df = pd.DataFrame({
            "sales_share": sales_share_country,
            "chargers": charger_by_country,
        }).dropna()
        charger_density_df = charger_density_df[charger_density_df["chargers"] > 500]

        # Approximate population for bubble size
        pop_approx = {
            "China": 1400, "USA": 330, "India": 1380, "Germany": 83,
            "United Kingdom": 67, "France": 67, "Norway": 5, "Sweden": 10,
            "Netherlands": 17, "Canada": 38, "Japan": 125, "Korea": 52,
            "Australia": 26, "Brazil": 213, "Indonesia": 273
        }
        sizes = [max(15, min(60, pop_approx.get(c, 20) / 5)) for c in charger_density_df.index]

        income_group = {
            "Norway": "High Income", "Sweden": "High Income", "Netherlands": "High Income",
            "Germany": "High Income", "USA": "High Income", "Japan": "High Income",
            "Korea": "High Income", "United Kingdom": "High Income", "France": "High Income",
            "Australia": "High Income", "Canada": "High Income",
            "China": "Upper-Mid Income", "Brazil": "Upper-Mid Income",
            "Indonesia": "Upper-Mid Income", "India": "Lower-Mid Income",
        }
        color_map = {"High Income": TEAL, "Upper-Mid Income": ORANGE, "Lower-Mid Income": "#f43f5e"}
        c_colors = [color_map.get(income_group.get(c, "High Income"), MUTED) for c in charger_density_df.index]

        fig = go.Figure()
        for grp, clr in [("High Income", TEAL), ("Upper-Mid Income", ORANGE), ("Lower-Mid Income", "#f43f5e")]:
            mask = [income_group.get(c, "High Income") == grp for c in charger_density_df.index]
            sub = charger_density_df[mask]
            if len(sub):
                fig.add_scatter(
                    x=sub["chargers"].tolist(),
                    y=sub["sales_share"].tolist(),
                    mode="markers+text",
                    name=grp,
                    marker=dict(size=[sizes[i] for i, m in enumerate(mask) if m],
                                color=clr, opacity=0.85, line=dict(width=0)),
                    text=sub.index.tolist(),
                    textposition="top center",
                    textfont=dict(size=9, color=WHITE),
                    hovertemplate="<b>%{text}</b><br>Chargers: %{x:,.0f}<br>EV Sales Share: %{y:.1f}%<extra></extra>",
                )
        apply_theme(fig, height=380, xaxis_type="log",
                    xaxis_title="Public Chargers (log scale)", yaxis_title="EV Sales Share (%)",
                    yaxis_ticksuffix="%")
        return fig

    # ── ARIMA Projection
    @render_widget
    def chart_projection():
        ts = hist_world.set_index("year")["value"] / 1e6
        ts.index = pd.PeriodIndex([pd.Period(y, "Y") for y in ts.index])

        try:
            from statsmodels.tsa.arima.model import ARIMA

            model = ARIMA(
                ts,
                order=(2, 2, 1),
                enforce_stationarity=False,
                enforce_invertibility=False,
            )
            res = model.fit()
            forecast = res.get_forecast(steps=6)
            fc_mean = forecast.predicted_mean
            ci = forecast.conf_int(alpha=0.2)
            ci95 = forecast.conf_int(alpha=0.05)
            fc_years = list(range(2025, 2031))
        except Exception:
            fc_years = list(range(2025, 2031))
            last = float(ts.iloc[-1])
            fc_mean = pd.Series([last * (1.25 ** i) for i in range(1, 7)], index=fc_years)
            ci = pd.DataFrame({"lower value": fc_mean * 0.85, "upper value": fc_mean * 1.15})
            ci95 = pd.DataFrame({"lower value": fc_mean * 0.75, "upper value": fc_mean * 1.25})

        fig = go.Figure()

        # Historical
        fig.add_scatter(
            x=hist_world["year"].tolist(),
            y=(hist_world["value"] / 1e6).tolist(),
            mode="lines", name="Historical (2010-2024)",
            line=dict(color=TEAL, width=3),
        )
        # CI bands
        try:
            fig.add_scatter(
                x=fc_years + fc_years[::-1],
                y=list(ci95.iloc[:, 1]) + list(ci95.iloc[:, 0])[::-1],
                fill="toself", fillcolor="rgba(45,212,191,0.06)",
                line=dict(width=0), name="95% CI", showlegend=True
            )
            fig.add_scatter(
                x=fc_years + fc_years[::-1],
                y=list(ci.iloc[:, 1]) + list(ci.iloc[:, 0])[::-1],
                fill="toself", fillcolor="rgba(45,212,191,0.13)",
                line=dict(width=0), name="80% CI", showlegend=True
            )
        except Exception:
            pass

        # Forecast
        fig.add_scatter(
            x=fc_years, y=list(fc_mean),
            mode="lines", name="ARIMA Forecast",
            line=dict(color=ORANGE, width=2.5, dash="dot"),
        )
        # IEA STEPS
        fig.add_scatter(
            x=[2024, 2030], y=[58, 232],
            mode="lines+markers", name="IEA STEPS",
            line=dict(color=TEAL, width=1.5, dash="longdash"),
            marker=dict(symbol="star", size=12, color=RED),
        )
        fig.add_annotation(x=2030, y=232, text="232M IEA STEPS",
                           font=dict(color=RED, size=11), showarrow=False,
                           xanchor="right", yanchor="bottom")

        apply_theme(fig, height=360, yaxis_title="EV Stock (Millions)",
                    xaxis_range=[2010, 2031])
        return fig

    # ── Conclusion: projected stock share dumbbell
    @render_widget
    def chart_conclusion():
        countries = ["Norway", "China", "Netherlands", "Germany", "United Kingdom", "France", "United States"]
        share_2024 = {
            "Norway": 32.0, "China": 11.0, "Netherlands": 11.0, "Germany": 6.5,
            "United Kingdom": 6.4, "France": 5.9, "United States": 4.1
        }
        share_2030 = {
            "Norway": 85, "China": 36, "Netherlands": 30, "Germany": 20,
            "United Kingdom": 18, "France": 16, "United States": 8
        }
        fig = go.Figure()
        for c in countries:
            v24 = share_2024.get(c, 5)
            v30 = share_2030.get(c, 10)
            fig.add_shape(type="line", x0=v24, x1=v30, y0=c, y1=c,
                          line=dict(color="rgba(255,255,255,0.15)", width=2))
        fig.add_scatter(
            x=[share_2024[c] for c in countries],
            y=countries, mode="markers", name="2024",
            marker=dict(size=12, color=MUTED, symbol="circle"),
            hovertemplate="%{y} 2024: %{x:.1f}%<extra></extra>",
        )
        fig.add_scatter(
            x=[share_2030[c] for c in countries],
            y=countries, mode="markers", name="2030",
            marker=dict(size=14, color=TEAL, symbol="circle"),
            hovertemplate="%{y} 2030: %{x:.1f}%<extra></extra>",
        )
        apply_theme(fig, height=340, xaxis_ticksuffix="%",
                    xaxis_title="EV Stock Share (%)",
                    xaxis_range=[0, 100])
        return fig


# ─────────────────────────────────────────────
app = App(
    app_ui,
    server,
    static_assets=Path(__file__).parent / "www"
)
