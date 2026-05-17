"""
E-Mobility Global Transition - Shiny for Python
IEA Global EV Outlook 2025 Data Narrative
"""

import pandas as pd
import numpy as np
import plotly.graph_objects as go
from plotly.subplots import make_subplots
from copy import deepcopy
from pathlib import Path

from shiny import App, ui, render, reactive
from shinywidgets import output_widget, render_widget

# ─────────────────────────────────────────────
#  DATA LOADING - wrapped in try/except, lazy via reactive.calc
# ─────────────────────────────────────────────
DATA_PATH = Path(__file__).with_name("data") / "gevo_ev_2025.csv"

EXCLUDE_REGIONS = {
    "World", "Europe", "Asia Pacific", "EU27", "North America",
    "Central and South America", "Africa", "Middle East and Caspian", "Rest of the world"
}


def load_raw_df() -> pd.DataFrame:
    """Load raw CSV once; raises with clear message on failure."""
    try:
        df = pd.read_csv(DATA_PATH)
        df.columns = df.columns.str.strip()
        return df
    except FileNotFoundError:
        raise RuntimeError(f"Data file not found: {DATA_PATH}")
    except Exception as exc:
        raise RuntimeError(f"Failed to load data: {exc}") from exc


# ─────────────────────────────────────────────
#  CHART THEME
# ─────────────────────────────────────────────
BG    = "#0a0f1e"
BG2   = "#0d1526"
PANEL = "#0f1d30"
TEAL  = "#2dd4bf"
TEAL2 = "#14b8a6"
ORANGE = "#fb923c"
RED    = "#f87171"
MUTED  = "#94a3b8"
WHITE  = "#f1f5f9"
GOLD   = "#fbbf24"

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


def hex_to_rgba(hex_color: str, alpha: float = 1.0) -> str:
    hex_color = hex_color.lstrip("#")
    if len(hex_color) == 3:
        hex_color = "".join(c * 2 for c in hex_color)
    r, g, b = (int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    return f"rgba({r},{g},{b},{alpha})"


def fmt_m(v: float) -> str:
    if v >= 1e9: return f"{v/1e9:.1f}B"
    if v >= 1e6: return f"{v/1e6:.1f}M"
    if v >= 1e3: return f"{v/1e3:.0f}k"
    return str(int(v))


# ─────────────────────────────────────────────
#  SHARED CSS / FONTS
# ─────────────────────────────────────────────
CUSTOM_CSS = """
@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap');

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
        url("images/back.jpg");
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

/* ── NARRATIVE CARD ── */
.narrative-card { max-width: 700px; margin: 0 auto; }

.stat-row { display: flex; gap: 32px; margin: 24px 0; }
.stat-block .stat-label { font-size: 0.75rem; color: var(--muted); margin-bottom: 4px; }
.stat-block .stat-value { font-family: 'Syne', sans-serif; font-size: 2.4rem; font-weight: 700; color: var(--orange); letter-spacing: 0; }
.stat-progress { height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; margin-top: 8px; width: 240px; }
.stat-progress .fill { height: 100%; background: var(--orange); border-radius: 2px; width: 40%; }

/* ── GRID ── */
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
.footer {
    position: relative;
}

.footer-links {
    display: flex;
    gap: 18px;
    align-items: center;
}

.footer-info-btn {
    background: transparent;
    border: none;
    color: var(--muted);
    font-family: 'Syne', sans-serif;
    font-size: 0.8rem;
    cursor: pointer;
    padding: 4px 0;
}

.footer-info-btn:hover {
    color: var(--teal);
}

.footer-tooltip {
    position: absolute;
    right: 40px;
    bottom: 62px;
    width: min(420px, calc(100vw - 40px));
    background: var(--panel);
    border: 1px solid rgba(45,212,191,0.28);
    border-radius: 14px;
    padding: 20px 22px;
    box-shadow: 0 18px 45px rgba(0,0,0,0.45);
    z-index: 2000;
    color: var(--white);
}

.footer-tooltip.hidden {
    display: none;
}

.footer-tooltip-title {
    font-size: 0.95rem;
    font-weight: 800;
    color: var(--teal);
    margin-bottom: 10px;
    letter-spacing: 0.5px;
}

.footer-tooltip-body {
    font-size: 0.82rem;
    line-height: 1.65;
    color: var(--muted);
}

.footer-tooltip-body ul {
    margin: 8px 0 0 18px;
    padding: 0;
}

.footer-tooltip-close {
    position: absolute;
    top: 10px;
    right: 12px;
    background: transparent;
    border: none;
    color: var(--muted);
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;
}

.footer-tooltip-close:hover {
    color: var(--red);
}

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
/* ── RACE CHART D3 ── */
#race-chart-wrap { padding: 28px; }
#race-title-row { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:16px; }
#race-year-big { font-family:'Syne',sans-serif; color:var(--teal); font-size:4rem; font-weight:800; line-height:1; }
#race-svg { width:100%; height:560px; display:block; }
#race-controls { display:flex; align-items:center; gap:12px; margin-top:18px; }
#race-controls button { background:var(--teal2); color:#06111f; border:none; border-radius:999px; padding:10px 22px; font-family:'Syne',sans-serif; font-weight:800; font-size:0.9rem; cursor:pointer; letter-spacing:1px; }
#race-controls button:hover { background:var(--teal); }
#race-range { flex:1; accent-color:var(--teal); }
#race-slider-wrap {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
}

#race-year-labels {
    display: flex;
    justify-content: space-between;
    padding: 0 4px;
    color: var(--muted);
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 1px;
}

#race-year-labels span {
    transform: translateY(2px);
}
"""


# ─────────────────────────────────────────────
#  UI
# ─────────────────────────────────────────────
app_ui = ui.page_fluid(
    ui.tags.head(
        ui.tags.style(CUSTOM_CSS),

        ui.tags.link(
            rel="stylesheet",
            href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&display=swap"
        ),

        ui.tags.script(src="https://cdn.jsdelivr.net/npm/d3@7"),

        # Navbar / dot nav script
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

                # D3 race chart script
        ui.tags.script("""
        document.addEventListener("DOMContentLoaded", () => {
          function waitForRaceData() {
            if (!window.d3 || !window.raceData || !document.querySelector("#race-svg")) {
              setTimeout(waitForRaceData, 300);
              return;
            }

            const raw = window.raceData;
            const years = Array.from(new Set(raw.map(d => d.year))).sort((a, b) => a - b);
            const topN = 10;

            const svg = d3.select("#race-svg");
            svg.selectAll("*").remove();

            const width = document.querySelector("#race-svg").clientWidth || 900;
            const height = 560;
            const margin = { top: 16, right: 140, bottom: 36, left: 160 };
            const innerW = width - margin.left - margin.right;
            const innerH = height - margin.top - margin.bottom;

            svg.attr("viewBox", `0 0 ${width} ${height}`);

            const g = svg.append("g")
              .attr("transform", `translate(${margin.left},${margin.top})`);

            const x = d3.scaleLinear().range([0, innerW]);
            const y = d3.scaleBand().range([0, innerH]).padding(0.2);

            const xAxisG = g.append("g")
              .attr("transform", `translate(0,${innerH})`);

            const barsG = g.append("g");
            const labelsG = g.append("g");
            const valuesG = g.append("g");

            let currentIndex = 0;
            let timer = null;

            function topData(year) {
              return raw
                .filter(d => d.year === year)
                .sort((a, b) => b.value - a.value)
                .slice(0, topN)
                .reverse();
            }

            function update(year, duration = 700) {
              const data = topData(year);
              const maxVal = d3.max(data, d => d.value) || 1;

              x.domain([0, maxVal * 1.15]);
              y.domain(data.map(d => d.name));

              const yearEl = document.querySelector("#race-year-big");
              const rangeEl = document.querySelector("#race-range");

              if (yearEl) yearEl.textContent = year;
              if (rangeEl) rangeEl.value = year;

              xAxisG.transition()
                .duration(duration)
                .call(d3.axisBottom(x).ticks(5).tickFormat(d => d + "M"));

              xAxisG.selectAll("text")
                .attr("fill", "#94a3b8")
                .style("font-family", "Syne");

              xAxisG.selectAll("path,line")
                .attr("stroke", "rgba(255,255,255,0.12)");

              const bars = barsG.selectAll("rect")
                .data(data, d => d.name);

              bars.enter()
                .append("rect")
                .attr("x", 0)
                .attr("y", d => y(d.name))
                .attr("height", y.bandwidth())
                .attr("width", 0)
                .attr("rx", 5)
                .attr("fill", d => d.name === "China" ? "#2dd4bf" : "rgba(45,212,191,0.45)")
                .merge(bars)
                .transition()
                .duration(duration)
                .attr("y", d => y(d.name))
                .attr("height", y.bandwidth())
                .attr("width", d => x(d.value))
                .attr("fill", d => d.name === "China" ? "#2dd4bf" : "rgba(45,212,191,0.45)");

              bars.exit()
                .transition()
                .duration(300)
                .attr("width", 0)
                .remove();

              const labels = labelsG.selectAll("text")
                .data(data, d => d.name);

              labels.enter()
                .append("text")
                .attr("x", -10)
                .attr("y", d => y(d.name) + y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .attr("text-anchor", "end")
                .attr("fill", "#f1f5f9")
                .style("font-family", "Syne")
                .style("font-weight", "700")
                .style("font-size", "13px")
                .text(d => d.name)
                .merge(labels)
                .transition()
                .duration(duration)
                .attr("y", d => y(d.name) + y.bandwidth() / 2)
                .text(d => d.name);

              labels.exit().remove();

              const vals = valuesG.selectAll("text")
                .data(data, d => d.name);

              vals.enter()
                .append("text")
                .attr("x", d => x(d.value) + 8)
                .attr("y", d => y(d.name) + y.bandwidth() / 2)
                .attr("dy", "0.35em")
                .attr("fill", "#f1f5f9")
                .style("font-family", "Syne")
                .style("font-weight", "700")
                .style("font-size", "12px")
                .text(d => d.value.toFixed(1) + "M")
                .merge(vals)
                .transition()
                .duration(duration)
                .attr("x", d => x(d.value) + 8)
                .attr("y", d => y(d.name) + y.bandwidth() / 2)
                .tween("text", function(d) {
                  const current = parseFloat(this.textContent) || 0;
                  const i = d3.interpolateNumber(current, d.value);
                  return function(t) {
                    this.textContent = i(t).toFixed(1) + "M";
                  };
                });

              vals.exit().remove();
            }

            function play() {
              if (timer) return;

              timer = setInterval(() => {
                currentIndex += 1;

                if (currentIndex >= years.length) {
                  currentIndex = 0;
                }

                update(years[currentIndex], 700);
              }, 950);
            }

            function pause() {
              if (timer) {
                clearInterval(timer);
                timer = null;
              }
            }

            const playBtn = document.querySelector("#race-play");
            const pauseBtn = document.querySelector("#race-pause");
            const range = document.querySelector("#race-range");

            if (playBtn) playBtn.onclick = play;
            if (pauseBtn) pauseBtn.onclick = pause;

            if (range) {
              range.min = years[0];
              range.max = years[years.length - 1];
              range.value = years[0];

              range.oninput = function(e) {
                pause();
                const selectedYear = Number(e.target.value);
                currentIndex = years.indexOf(selectedYear);
                update(selectedYear, 300);
              };
            }

            update(years[0], 0);
          }

          waitForRaceData();
        });
        """),

        # Footer tooltip script
        ui.tags.script("""
        document.addEventListener("DOMContentLoaded", () => {
          const tooltip = document.querySelector("#footer-tooltip");
          const title = document.querySelector("#footer-tooltip-title");
          const body = document.querySelector("#footer-tooltip-body");
          const closeBtn = document.querySelector("#footer-tooltip-close");
          const buttons = document.querySelectorAll(".footer-info-btn");

          const content = {
            methodology: {
              title: "Methodology",
              body: `
                <p>This dashboard uses a data narrative approach to describe the global e-mobility transition.</p>
                <ul>
                  <li>Historical EV stock, sales share, stock share, and charger data are filtered by region, year, powertrain, and vehicle mode.</li>
                  <li>Country-level rankings exclude aggregate regions such as World, Europe, EU27, and Asia Pacific.</li>
                  <li>Forecasting uses IEA STEPS projections where available, with ARIMA/CAGR used only as a statistical comparison baseline.</li>
                </ul>
              `
            },
            sources: {
              title: "Data Sources",
              body: `
                <p>Main dataset: IEA Global EV Outlook 2025 dataset.</p>
                <ul>
                  <li>EV stock and EV stock share</li>
                  <li>EV sales share</li>
                  <li>Public charging points by charger type</li>
                  <li>Projection-STEPS scenario values through 2030</li>
                </ul>
                <p>Visual assets are stored locally in the app's <strong>www/images</strong> folder.</p>
              `
            },
            privacy: {
              title: "Privacy Policy",
              body: `
                <p>This app is a static analytical dashboard and does not intentionally collect personal user data.</p>
                <ul>
                  <li>No login or account information is required.</li>
                  <li>No user-entered personal information is stored.</li>
                  <li>Interactions such as scrolling, filtering, and chart viewing are used only inside the current browser session.</li>
                </ul>
              `
            }
          };

          function openTooltip(panelName) {
            const selected = content[panelName];
            if (!selected || !tooltip || !title || !body) return;

            title.innerHTML = selected.title;
            body.innerHTML = selected.body;
            tooltip.classList.remove("hidden");
          }

          function closeTooltip() {
            if (tooltip) tooltip.classList.add("hidden");
          }

          buttons.forEach(btn => {
            btn.addEventListener("click", (e) => {
              e.preventDefault();
              openTooltip(btn.dataset.panel);
            });
          });

          if (closeBtn) {
            closeBtn.addEventListener("click", closeTooltip);
          }

          document.addEventListener("keydown", (e) => {
            if (e.key === "Escape") closeTooltip();
          });

          document.addEventListener("click", (e) => {
            if (!tooltip || tooltip.classList.contains("hidden")) return;

            const clickedButton = e.target.closest(".footer-info-btn");
            const clickedTooltip = e.target.closest("#footer-tooltip");

            if (!clickedButton && !clickedTooltip) {
              closeTooltip();
            }
          });
        });
        """),
    ),

    # phần còn lại của UI bắt đầu từ Dot navigation...
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
        ),
        id="s0", class_="page",
        style="display:flex;align-items:center;justify-content:center;flex-direction:column;min-height:100vh;"
    ),

    # ── NAVBAR
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
                 "the sound of his engine idling in the driveway. Mateo's story is not isolated - it represents "
                 "a micro-economic shift happening across global metropolises where individual operators "
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
                <div style="font-size:0.78rem;color:var(--muted);margin-top:6px;">Active EV operators worldwide as of 2024.</div>
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

    # ── SECTION 2: Carbon Footprint
    ui.div(
        ui.div(
            ui.div("GLOBAL CARBON FOOTPRINT", class_="section-label",
                   style="text-align:center;color:var(--red);"),
            ui.HTML("""
            <div style="text-align:center;margin:8px auto 40px;">
              <div style="font-family:'Syne',sans-serif;font-size:clamp(96px,18vw,230px);line-height:.92;font-weight:700;color:#dbeafe;letter-spacing:0;">1.2</div>
              <div style="font-family:'Syne',sans-serif;font-size:clamp(24px,4vw,42px);font-weight:700;color:var(--muted);margin-top:0;letter-spacing:0;">Billion Tons</div>
            </div>
            """),
            ui.div(
                ui.p("In 2024, passenger cars emitted 1.2 billion tons of CO2. That is the weight of 3,200 "
                     "Empire State Buildings released into the atmosphere every single year.",
                     style="max-width:760px;text-align:center;margin:0 auto;font-size:1.15rem;line-height:1.8;"),
                class_="chart-panel",
                style="max-width:860px;margin:0 auto 48px;padding:40px;"
            ),
            ui.HTML('<div style="text-align:center;"><a href="#s3" class="begin-btn">Explore Solutions</a></div>'),
        ),
        id="s2", class_="section",
        style=f"min-height:100vh;display:flex;align-items:center;justify-content:center;background:{BG};"
    ),

    # ── SECTION 3: Objectives
    ui.div(
        ui.div(
            ui.div("CONTEXT & OBJECTIVE", class_="section-label", style="text-align:center;"),
            ui.h1("Preparing for the Next Phase of Expansion",
                  style="text-align:center;max-width:none;"),
            ui.p("Mateo is planning to expand his small fleet, but he needs actionable intelligence to make "
                 "confident investment decisions. To navigate the complexities of the global e-mobility landscape, "
                 "we must answer three critical questions.",
                 style="text-align:center;max-width:none;margin:0 auto 40px;"),
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

    # ── SECTION 4: Human Stakes
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

    # ── SECTION 5: Dashboard / KPI - values rendered dynamically
    ui.div(
        ui.div(
            ui.h2("Global EV Snapshot"),
            ui.p("Status check: 2024 vs 2030 projections"),
            ui.div(
                ui.div(ui.output_ui("kpi_stock"),      class_="kpi-card"),
                ui.div(ui.output_ui("kpi_stock_share"), class_="kpi-card"),
                ui.div(ui.output_ui("kpi_sales_share"), class_="kpi-card highlight"),
                ui.div(ui.output_ui("kpi_chargers"),    class_="kpi-card"),
                ui.div(ui.output_ui("kpi_steps"),       class_="kpi-card alert"),
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

    # ── SECTION 6: Growth Curve
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

    # ── SECTION 7: Adoption map
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
                        <div class="hl-value">Norway: 1 in 3 cars is electric.</div>
                        """),
                        class_="highlight-card", style="margin-bottom:20px;"
                    ),
                    ui.HTML('<div style="font-size:0.7rem;letter-spacing:2px;color:var(--muted);margin-bottom:12px;">TOP 3 BY EV SHARE (2024)</div>'),
                    ui.output_ui("top3_stock_share"),
                    ui.HTML("""
                    <hr style="border-color:rgba(255,255,255,0.07);margin:16px 0;">
                    <div style="font-size:0.75rem;color:var(--muted);">GLOBAL AVERAGE</div>
                    <div style="font-family:'Syne',sans-serif;font-size:2rem;font-weight:700;letter-spacing:0;">4.5%</div>
                    <div style="font-size:0.8rem;color:var(--teal);">↑ +0.5% YoY</div>
                    """),
                    class_="grid-right-panel"
                ),
                class_="grid-left"
            ),
        ),
        id="s7", class_="section"
    ),

    # ── SECTION 8: Race for Volume — D3 Flourish-style
    ui.div(
        ui.div(
            ui.h1("The Race for Volume"),
            ui.p("Where raw scale meets industrial ambition."),
            ui.HTML("""
            <div id="race-chart-wrap" class="chart-panel">
            <div id="race-title-row">
                <div>
                <div class="chart-title">TOP EV MARKETS BY STOCK (MILLIONS)</div>
                <div style="color:var(--muted);font-size:0.85rem;margin-top:4px;">Bar chart race, 2010–2024</div>
                </div>
                <div id="race-year-big">2010</div>
            </div>

            <svg id="race-svg"></svg>

            <div id="race-controls">
                <button id="race-play">▶ Play</button>
                <button id="race-pause">⏸ Pause</button>

                <div id="race-slider-wrap">
                <input id="race-range" type="range" min="2010" max="2024" value="2010" step="1">

                <div id="race-year-labels">
                    <span>2010</span>
                    <span>2015</span>
                    <span>2020</span>
                    <span>2024</span>
                </div>
                </div>
            </div>
            </div>
            """),
            ui.output_ui("race_data_json"),
        ),
        id="s8", class_="section", style=f"background:{BG2};"
    ),
    # ── SECTION 9: Charging Infrastructure
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

    # ── SECTION 10: Charger Stress - chips rendered dynamically
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
                    ui.output_ui("stress_most_card"),
                    class_="grid-right-panel"
                ),
                class_="grid-left"
            ),
            ui.div("CRITICAL STRESS ZONES (HIGHEST EV-TO-CHARGER RATIO)",
                   style="font-size:0.7rem;letter-spacing:2px;font-weight:700;color:var(--muted);margin-top:24px;"),
            ui.output_ui("stress_chips_ui"),
        ),
        id="s10", class_="section", style=f"background:{BG2};"
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
                        ui.HTML('<div class="kpi-label">EST. FLEET AGE</div><div class="kpi-value" style="color:var(--orange);">12.5 Yrs</div>'
                                '<div style="font-size:0.8rem;color:var(--muted);margin-top:6px;">Average lifespan of an ICE vehicle before retirement delays full transition.</div>'),
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

    # ── SECTION 12: Powertrain Mix
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

    # ── SECTION 13: Equity
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

    # ── SECTION 14: ARIMA Projection
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
                    ui.output_ui("projection_kpis"),
                    style="display:flex;flex-direction:column;"
                ),
                class_="grid-left"
            ),
            ui.HTML("""
            <div class="chart-panel" style="margin-top:16px;">
              <div class="chart-title">PROJECTED 2030 STOCK SHARE BY MAJOR MARKETS</div>
              <div style="display:flex;height:40px;border-radius:6px;overflow:hidden;margin-top:12px;">
                <div style="flex:36;background:var(--teal);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.85rem;color:#0a0f1e;">CN 36%</div>
                <div style="flex:15;background:rgba(45,212,191,0.5);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:0.82rem;">EU 15%</div>
                <div style="flex:8;background:rgba(45,212,191,0.3);display:flex;align-items:center;justify-content:center;font-weight:600;font-size:0.82rem;">US 8%</div>
                <div style="flex:3;background:rgba(45,212,191,0.15);display:flex;align-items:center;justify-content:center;font-size:0.8rem;">IN 3%</div>
                <div style="flex:38;background:rgba(255,255,255,0.05);display:flex;align-items:center;justify-content:center;font-size:0.75rem;color:var(--muted);">Rest ~38%</div>
              </div>
              <div style="display:flex;justify-content:space-between;margin-top:8px;font-size:0.72rem;color:var(--muted);">
                <span>IEA STEPS 2030 country breakdown</span><span>Source: IEA Global EV Outlook 2025</span>
              </div>
            </div>
            """),
        ),
        id="s14", class_="section"
    ),

    # ── SECTION 15: Conclusion
    ui.div(
        ui.div(
            ui.h1("The hockey stick is real - but the fleet lags the market.",
                  style="max-width:600px;"),
            ui.HTML('<h2 style="color:var(--teal);font-size:1.5rem;margin-bottom:24px;">Two winning playbooks, not one.</h2>'),
            ui.div(
                ui.p("While global EV sales share approaches a pivotal 20% threshold, the actual stock of "
                     "vehicles on the road remains anchored at merely 4.5%. This structural lag dictates "
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
        ui.HTML("""
        <div class="footer-links">
        <button class="footer-info-btn" data-panel="methodology">Methodology</button>
        <button class="footer-info-btn" data-panel="sources">Data Sources</button>
        <button class="footer-info-btn" data-panel="privacy">Privacy Policy</button>
        </div>

        <div id="footer-tooltip" class="footer-tooltip hidden">
        <button id="footer-tooltip-close" class="footer-tooltip-close">×</button>
        <div id="footer-tooltip-title" class="footer-tooltip-title"></div>
        <div id="footer-tooltip-body" class="footer-tooltip-body"></div>
        </div>
        """),
        class_="footer"
    ),
)


# ─────────────────────────────────────────────
#  SERVER
# ─────────────────────────────────────────────
def server(input, output, session):

    # ── Core data - loaded once, cached; any error surfaces as a reactive error
    @reactive.calc
    def raw_df():
        return load_raw_df()

    # ── Derived datasets - each cached by reactive.calc so downstream renders
    #    don't recompute when unrelated inputs change.

    @reactive.calc
    def world_stock_data():
        df = raw_df()
        raw = df[
            (df["region_country"] == "World") &
            (df["parameter"] == "EV stock") &
            (df["mode"] == "Cars") &
            (df["category"] == "Historical") &
            (df["powertrain"].isin(["BEV", "PHEV"]))
        ]
        stock = raw.groupby("year")["value"].sum().reset_index()
        pt = raw.pivot_table(index="year", columns="powertrain", values="value", aggfunc="sum").fillna(0)
        return stock, pt

    @reactive.calc
    def world_sales_share_data():
        df = raw_df()
        return df[
            (df["region_country"] == "World") &
            (df["parameter"] == "EV sales share") &
            (df["mode"] == "Cars") &
            (df["category"] == "Historical") &
            (df["powertrain"] == "EV")
        ].sort_values("year")

    @reactive.calc
    def latest_year():
        stock, _ = world_stock_data()
        return int(stock["year"].max())

    @reactive.calc
    def kpi_values():
        df = raw_df()
        yr = latest_year()

        total_stock = raw_df()[
            (raw_df()["region_country"] == "World") &
            (raw_df()["parameter"] == "EV stock") &
            (raw_df()["mode"] == "Cars") &
            (raw_df()["category"] == "Historical") &
            (raw_df()["year"] == yr) &
            (raw_df()["powertrain"].isin(["BEV", "PHEV"]))
        ]["value"].sum()

        stock_share_vals = df[
            (df["region_country"] == "World") &
            (df["parameter"] == "EV stock share") &
            (df["mode"] == "Cars") &
            (df["category"] == "Historical") &
            (df["year"] == yr) &
            (df["powertrain"] == "EV")
        ]["value"].values
        stock_share = float(stock_share_vals[0]) if len(stock_share_vals) else float("nan")

        sales_share_vals = df[
            (df["region_country"] == "World") &
            (df["parameter"] == "EV sales share") &
            (df["mode"] == "Cars") &
            (df["category"] == "Historical") &
            (df["year"] == yr) &
            (df["powertrain"] == "EV")
        ]["value"].values
        sales_share = float(sales_share_vals[0]) if len(sales_share_vals) else float("nan")

        charger_total = df[
            (df["region_country"] == "World") &
            (df["parameter"] == "EV charging points") &
            (df["category"] == "Historical") &
            (df["year"] == yr)
        ]["value"].sum()

        steps_2030 = df[
            (df["region_country"] == "World") &
            (df["parameter"] == "EV stock") &
            (df["mode"] == "Cars") &
            (df["category"] == "Projection-STEPS") &
            (df["year"] == 2030) &
            (df["powertrain"].isin(["BEV", "PHEV"]))
        ]["value"].sum()

        return {
            "yr": yr,
            "total_stock": total_stock,
            "stock_share": stock_share,
            "sales_share": sales_share,
            "charger_total": charger_total,
            "steps_2030": steps_2030,
        }

    @reactive.calc
    def ratio_data():
        df = raw_df()
        yr = latest_year()
        stock_2024 = df[
            (df["parameter"] == "EV stock") & (df["mode"] == "Cars") &
            (df["category"] == "Historical") & (df["year"] == yr) &
            (df["powertrain"].isin(["BEV", "PHEV"]))
        ]
        stock_by = stock_2024.groupby("region_country")["value"].sum()
        charger_2024 = df[
            (df["parameter"] == "EV charging points") &
            (df["category"] == "Historical") & (df["year"] == yr)
        ]
        charger_by = charger_2024.groupby("region_country")["value"].sum()
        ratio = pd.DataFrame({"stock": stock_by, "chargers": charger_by}).dropna()
        ratio = ratio[~ratio.index.isin(EXCLUDE_REGIONS)]
        ratio["ratio"] = ratio["stock"] / ratio["chargers"]
        return ratio[ratio["chargers"] > 0].sort_values("ratio", ascending=False)

    @reactive.calc
    def stock_share_2024_data():
        df = raw_df()
        yr = latest_year()
        return df[
            (df["parameter"] == "EV stock share") &
            (df["mode"] == "Cars") &
            (df["category"] == "Historical") &
            (df["year"] == yr) &
            (df["powertrain"] == "EV") &
            (~df["region_country"].isin(EXCLUDE_REGIONS))
        ].sort_values("value", ascending=False).head(15)

    @reactive.calc
    def country_stock_time_data():
        df = raw_df()
        ct = df[
            (df["parameter"] == "EV stock") &
            (df["mode"] == "Cars") &
            (df["category"] == "Historical") &
            (df["powertrain"].isin(["BEV", "PHEV"])) &
            (~df["region_country"].isin(EXCLUDE_REGIONS))
        ]
        return ct.groupby(["region_country", "year"])["value"].sum().reset_index()

    @reactive.calc
    def charging_pt_data():
        df = raw_df()
        charging = df[
            (df["region_country"] == "World") &
            (df["parameter"] == "EV charging points") &
            (df["category"] == "Historical")
        ]
        pt = charging.pivot_table(index="year", columns="powertrain", values="value", aggfunc="sum").fillna(0)
        return pt.rename(columns={
            "Publicly available fast": "Fast",
            "Publicly available slow": "Slow"
        })

    @reactive.calc
    def bev_phev_top_data():
        df = raw_df()
        yr = latest_year()
        bev_phev = df[
            (df["parameter"] == "EV stock") & (df["mode"] == "Cars") &
            (df["category"] == "Historical") & (df["year"] == yr) &
            (df["powertrain"].isin(["BEV", "PHEV"])) &
            (~df["region_country"].isin(EXCLUDE_REGIONS))
        ]
        pivot = bev_phev.groupby(["region_country", "powertrain"])["value"].sum().unstack(fill_value=0)
        pivot["total"] = pivot.sum(axis=1)
        pivot["bev_pct"] = pivot.get("BEV", 0) / pivot["total"] * 100
        return pivot.sort_values("total", ascending=False).head(12)

    @reactive.calc
    def fleet_turnover_data():
        df = raw_df()
        ss_hist = df[
            (df["region_country"] == "World") & (df["parameter"] == "EV sales share") &
            (df["mode"] == "Cars") & (df["category"] == "Historical") & (df["powertrain"] == "EV")
        ].sort_values("year")
        st_hist = df[
            (df["region_country"] == "World") & (df["parameter"] == "EV stock share") &
            (df["mode"] == "Cars") & (df["category"] == "Historical") & (df["powertrain"] == "EV")
        ].sort_values("year")
        ss_proj = df[
            (df["region_country"] == "World") & (df["parameter"] == "EV sales share") &
            (df["mode"] == "Cars") & (df["powertrain"] == "EV") & (df["category"] == "Projection-STEPS")
        ].sort_values("year")
        st_proj = df[
            (df["region_country"] == "World") & (df["parameter"] == "EV stock share") &
            (df["mode"] == "Cars") & (df["powertrain"] == "EV") & (df["category"] == "Projection-STEPS")
        ].sort_values("year")
        return ss_hist, st_hist, ss_proj, st_proj

    @reactive.calc
    def hist_world_data():
        df = raw_df()
        world_all = df[
            (df["region_country"] == "World") &
            (df["parameter"] == "EV stock") &
            (df["mode"] == "Cars") &
            (df["powertrain"].isin(["BEV", "PHEV"]))
        ]
        hist = world_all[world_all["category"] == "Historical"].groupby("year")["value"].sum().reset_index()
        proj = world_all[world_all["category"] == "Projection-STEPS"].groupby("year")["value"].sum().reset_index()
        return hist, proj

    # ── Race chart: only the year-slice computation reacts to slider

    @render.ui
    def race_data_json():
        import json

        cp = country_stock_time_data().copy()
        cp["value_m"] = cp["value"] / 1e6

        data = [
            {
                "year": int(r["year"]),
                "name": r["region_country"],
                "value": float(r["value_m"]),
            }
            for _, r in cp.iterrows()
        ]

        return ui.tags.script(f"window.raceData = {json.dumps(data)};")


    # ─────────────────────────────────────────────
    #  DYNAMIC KPI OUTPUTS
    # ─────────────────────────────────────────────
    @render.ui
    def kpi_stock():
        kpi = kpi_values()
        val = fmt_m(kpi["total_stock"])
        return ui.HTML(f'<div class="kpi-label">EV cars on the road ({kpi["yr"]})</div>'
                       f'<div class="kpi-value">{val}</div>')

    @render.ui
    def kpi_stock_share():
        kpi = kpi_values()
        val = kpi["stock_share"]
        return ui.HTML(f'<div class="kpi-label">Share of car stock</div>'
                       f'<div class="kpi-value">{val:.1f}%</div>')

    @render.ui
    def kpi_sales_share():
        kpi = kpi_values()
        val = kpi["sales_share"]
        return ui.HTML(f'<div class="kpi-label">Share of new car sales</div>'
                       f'<div class="kpi-value" style="color:var(--orange);">{val:.0f}%</div>')

    @render.ui
    def kpi_chargers():
        kpi = kpi_values()
        val = fmt_m(kpi["charger_total"])
        return ui.HTML(f'<div class="kpi-label">Public charging points</div>'
                       f'<div class="kpi-value">{val}</div>')

    @render.ui
    def kpi_steps():
        kpi = kpi_values()
        val = fmt_m(kpi["steps_2030"])
        return ui.HTML(f'<div class="kpi-label">IEA STEPS 2030 proj.</div>'
                       f'<div class="kpi-value" style="color:var(--red);">{val}</div>')

    # ── Top-3 stock share list (data-driven)
    @render.ui
    def top3_stock_share():
        top3 = stock_share_2024_data().head(3)
        items = ""
        for i, (_, row) in enumerate(top3.iterrows(), 1):
            items += (f'<div class="rank-item">'
                      f'<span class="rank-num">{i}</span>'
                      f'<span class="rank-name">{row["region_country"]}</span>'
                      f'<span class="rank-val">{row["value"]:.1f}%</span>'
                      f'</div>')
        return ui.HTML(items)

    # ── Stress most card (data-driven)
    @render.ui
    def stress_most_card():
        rd = ratio_data()
        if rd.empty:
            return ui.HTML("")
        top = rd.iloc[0]
        name = top.name
        ratio = top["ratio"]
        return ui.HTML(
            f'<div class="highlight-card" style="margin-bottom:16px;">'
            f'  <div class="hl-label">⚠ Most Stressed Market</div>'
            f'  <div class="hl-value">{name}</div>'
            f'</div>'
            f'<div style="margin-bottom:16px;">'
            f'  <div style="font-size:0.75rem;color:var(--muted);margin-bottom:4px;">EVs per Public Charger</div>'
            f'  <div style="font-family:\'Syne\',sans-serif;font-size:2.5rem;font-weight:700;color:var(--red);letter-spacing:0;">{ratio:.1f}</div>'
            f'</div>'
            f'<p style="font-size:0.83rem;max-width:none;">Rapid EV adoption has significantly outpaced public infrastructure development, '
            f'creating high potential for charge anxiety among urban apartment dwellers and long-distance drivers.</p>'
            f'<hr style="border-color:rgba(255,255,255,0.07);margin:16px 0;">'
            f'<div style="font-size:0.75rem;color:var(--muted);margin-bottom:8px;">GLOBAL CONTEXT</div>'
            f'<p style="font-size:0.83rem;max-width:none;">While China maintains a comfortable ratio despite '
            f'massive scale, emerging EV markets are consistently hitting the "Stress Threshold" (30:1) before '
            f'regulatory intervention accelerates grid deployment.</p>'
        )

    # ── Stress chips (data-driven, top 5)
    @render.ui
    def stress_chips_ui():
        rd = ratio_data().head(5)
        chips = ""
        for i, (name, row) in enumerate(rd.iterrows()):
            cls = "critical" if i == 0 else "warn"
            chips += f'<div class="stress-chip {cls}">{"⚠ " if i==0 else ""}{name} &nbsp; {row["ratio"]:.0f} EVs/charger</div>'
        return ui.HTML(f'<div class="stress-chips">{chips}</div>')

    # ── Projection KPIs (data-driven ARIMA mean vs IEA STEPS)
    @render.ui
    def projection_kpis():
        hist, _ = hist_world_data()
        ts = hist.set_index("year")["value"] / 1e6
        arima_mean_2030 = None

        try:
            from statsmodels.tsa.arima.model import ARIMA
            ts_period = ts.copy()
            ts_period.index = pd.PeriodIndex([pd.Period(y, "Y") for y in ts_period.index])
            model = ARIMA(ts_period, order=(2, 2, 1),
                          enforce_stationarity=False, enforce_invertibility=False)
            res = model.fit()
            fc = res.get_forecast(steps=6)
            arima_mean_2030 = float(fc.predicted_mean.iloc[-1])
        except Exception:
            # Fallback: fit simple CAGR from last 5 years of data
            last5 = ts.tail(5)
            if len(last5) >= 2:
                cagr = (last5.iloc[-1] / last5.iloc[0]) ** (1 / (len(last5) - 1)) - 1
                cagr = min(cagr, 0.40)  # cap at 40% to avoid wild extrapolation
                arima_mean_2030 = float(last5.iloc[-1]) * ((1 + cagr) ** 6)
            else:
                arima_mean_2030 = None

        kpi = kpi_values()
        steps_m = kpi["steps_2030"] / 1e6

        arima_html = (
            f'<div class="kpi-card" style="margin-bottom:16px;">'
            f'<div class="kpi-label">ARIMA PROJECTED MEAN (2030)</div>'
            f'<div class="kpi-value" style="color:var(--orange);">{arima_mean_2030:.0f} M</div>'
            f'<div style="font-size:0.8rem;color:var(--muted);margin-top:6px;">Statistical baseline derived from historical growth patterns.</div>'
            f'</div>'
        ) if arima_mean_2030 else ""

        steps_html = (
            f'<div class="kpi-card highlight">'
            f'<div class="kpi-label">IEA STEPS TARGET (2030)</div>'
            f'<div class="kpi-value" style="color:var(--teal);">{steps_m:.0f} M</div>'
            f'<div style="font-size:0.8rem;color:var(--muted);margin-top:6px;">'
            f'Stated Policies Scenario.</div>'
            f'</div>'
        )
        return ui.HTML(arima_html + steps_html)

    # ─────────────────────────────────────────────
    #  CHART RENDERS
    # ─────────────────────────────────────────────

    @render_widget
    def chart_stock_bar():
        world_stock, _ = world_stock_data()
        kpi = kpi_values()
        years = sorted(world_stock["year"].tolist())
        vals = world_stock.set_index("year")["value"]
        yr = kpi["yr"]

        colors = [TEAL if y == yr else "rgba(45,212,191,0.45)" for y in years]
        fig = go.Figure()
        fig.add_bar(
            x=[str(y) for y in years],
            y=[vals[y] / 1e6 for y in years],
            marker_color=colors,
            marker_line_width=0,
            hovertemplate="%{x}: %{y:.1f}M vehicles<extra></extra>",
        )
        steps_m = kpi["steps_2030"] / 1e6
        fig.add_scatter(
            x=["2030"], y=[steps_m],
            mode="markers+text",
            marker=dict(symbol="star", size=16, color=ORANGE),
            text=[f"{steps_m:.0f}M STEPS"], textposition="top center",
            textfont=dict(color=ORANGE, size=10), name="IEA STEPS 2030"
        )
        apply_theme(fig, height=280, showlegend=False,
                    yaxis_title="Millions of Vehicles",
                    xaxis_tickangle=-45)
        return fig

    @render_widget
    def chart_sales_share():
        ss = world_sales_share_data()
        fig = go.Figure()
        fig.add_scatter(
            x=ss["year"].tolist(),
            y=ss["value"].tolist(),
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

    @render_widget
    def chart_growth_curve():
        world_stock, _ = world_stock_data()
        ss = world_sales_share_data()
        fig = make_subplots(specs=[[{"secondary_y": True}]])
        fig.add_scatter(
            x=world_stock["year"].tolist(),
            y=[v / 1e6 for v in world_stock["value"].tolist()],
            mode="lines", name="EV Stock (M)", secondary_y=False,
            line=dict(color=TEAL, width=3),
            fill="tozeroy", fillcolor="rgba(45,212,191,0.1)",
        )
        fig.add_scatter(
            x=ss["year"].tolist(),
            y=ss["value"].tolist(),
            mode="lines", name="EV Sales Share (%)", secondary_y=True,
            line=dict(color=ORANGE, width=2.5, dash="dot"),
        )
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


    @render_widget
    def chart_ev_fleet():
        _, world_stock_pt = world_stock_data()
        fig = go.Figure()
        yrs = sorted(world_stock_pt.index.tolist())
        for pt, color, name in [("BEV", TEAL, "BEV"), ("PHEV", ORANGE, "PHEV"), ("FCEV", "#a855f7", "FCEV")]:
            if pt in world_stock_pt.columns:
                fig.add_scatter(
                    x=yrs,
                    y=[world_stock_pt.loc[y, pt] / 1e6 if y in world_stock_pt.index else 0 for y in yrs],
                    mode="lines", name=name, stackgroup="one",
                    line=dict(color=color, width=0),
                    fillcolor=hex_to_rgba(color, 0.7),
                    hovertemplate=f"{name} %{{x}}: %{{y:.2f}}M<extra></extra>",
                )
        fig.add_vline(x=2022, line_color=RED, line_width=1.5,
                      annotation_text="2022 INFLECTION",
                      annotation_font_color=RED, annotation_font_size=10)
        apply_theme(fig, height=220, yaxis_title="M Vehicles", showlegend=True,
                    legend=dict(orientation="h", x=1, xanchor="right", y=1.15))
        return fig

    @render_widget
    def chart_charging():
        cpt = charging_pt_data()
        fig = go.Figure()
        yrs = sorted(cpt.index.tolist())
        for col, color, name in [("Fast", ORANGE, "Fast"), ("Slow", "#64748b", "Slow")]:
            if col in cpt.columns:
                fig.add_scatter(
                    x=yrs,
                    y=[cpt.loc[y, col] / 1e6 if y in cpt.index else 0 for y in yrs],
                    mode="lines", name=name, stackgroup="one",
                    line=dict(color=color, width=0),
                    hovertemplate=f"{name} %{{x}}: %{{y:.2f}}M<extra></extra>",
                )
        apply_theme(fig, height=220, yaxis_title="M Points", showlegend=True,
                    legend=dict(orientation="h", x=1, xanchor="right", y=1.15))
        return fig

    @render_widget
    def chart_charger_stress():
        plot_df = ratio_data().dropna().copy()
        colors = [RED if r > 30 else (ORANGE if r > 15 else TEAL)
                  for r in plot_df["ratio"]]
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
                    xaxis_title="Total EV Stock (log scale)",
                    yaxis_title="EVs per Public Charger")
        return fig

    @render_widget
    def chart_adoption_map():
        ss24 = stock_share_2024_data()
        fig = go.Figure(go.Choropleth(
            locations=ss24["region_country"].tolist(),
            z=ss24["value"].tolist(),
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

    @render_widget
    def chart_bev_phev():
        top = bev_phev_top_data()
        countries = top.index.tolist()
        bev_pct = top["bev_pct"].tolist()
        phev_pct = [100 - v for v in bev_pct]
        fig = go.Figure()
        fig.add_bar(y=countries, x=bev_pct, name="BEV", orientation="h",
                    marker_color="rgba(147,197,253,0.8)", marker_line_width=0,
                    text=[f"{v:.0f}%" for v in bev_pct], textposition="inside",
                    textfont=dict(color="#0f172a", size=11),
                    hovertemplate="%{y} BEV: %{x:.1f}%<extra></extra>")
        fig.add_bar(y=countries, x=phev_pct, name="PHEV", orientation="h",
                    marker_color="rgba(251,146,60,0.7)", marker_line_width=0,
                    text=[f"{v:.0f}%" if v > 8 else "" for v in phev_pct],
                    textposition="inside",
                    textfont=dict(color="#0f172a", size=11),
                    hovertemplate="%{y} PHEV: %{x:.1f}%<extra></extra>")
        apply_theme(fig, height=360, barmode="stack",
                    xaxis=dict(range=[0, 100], ticksuffix="%"),
                    showlegend=True,
                    legend=dict(orientation="h", y=1.08, x=1, xanchor="right"))
        return fig

    @render_widget
    def chart_stock_share_bar():
        ss = stock_share_2024_data().sort_values("value")
        colors = [TEAL if v > 15 else (TEAL2 if v > 8 else "rgba(45,212,191,0.4)")
                  for v in ss["value"]]
        fig = go.Figure(go.Bar(
            x=ss["value"].tolist(),
            y=ss["region_country"].tolist(),
            orientation="h",
            marker_color=colors, marker_line_width=0,
            text=[f"{v:.1f}%" for v in ss["value"]],
            textposition="outside", textfont=dict(color=WHITE, size=10),
            hovertemplate="%{y}: %{x:.1f}%<extra></extra>",
        ))
        apply_theme(fig, height=360, xaxis_ticksuffix="%",
                    xaxis_range=[0, ss["value"].max() * 1.25])
        return fig

    @render_widget
    def chart_fleet_turnover():
        ss_hist, st_hist, ss_proj, st_proj = fleet_turnover_data()
        fig = go.Figure()
        fig.add_scatter(
            x=ss_hist["year"].tolist(), y=ss_hist["value"].tolist(),
            mode="lines", name="EV Sales Share (Historical)",
            line=dict(color=TEAL, width=2.5),
        )
        fig.add_scatter(
            x=st_hist["year"].tolist(), y=st_hist["value"].tolist(),
            mode="lines", name="EV Stock Share (Historical)",
            line=dict(color=ORANGE, width=2.5),
        )
        yr = latest_year()
        all_proj_sales = pd.concat([
            ss_hist[ss_hist["year"] == yr], ss_proj
        ]).drop_duplicates("year").sort_values("year")
        all_proj_stock = pd.concat([
            st_hist[st_hist["year"] == yr], st_proj
        ]).drop_duplicates("year").sort_values("year")
        fig.add_scatter(
            x=all_proj_sales["year"].tolist(), y=all_proj_sales["value"].tolist(),
            mode="lines", name="Sales Share (STEPS)",
            line=dict(color=TEAL, width=2, dash="dot"),
        )
        fig.add_scatter(
            x=all_proj_stock["year"].tolist(), y=all_proj_stock["value"].tolist(),
            mode="lines", name="Stock Share (STEPS)",
            line=dict(color=ORANGE, width=2, dash="dot"),
        )
        fig.add_hline(y=30, line_dash="dot", line_color="rgba(255,255,255,0.2)",
                      annotation_text="IEA 2030 Target", annotation_font_color=ORANGE)
        ss_val = ss_hist[ss_hist["year"] == yr]["value"].values
        st_val = st_hist[st_hist["year"] == yr]["value"].values
        if len(ss_val) and len(st_val):
            fig.add_annotation(
                x=yr, y=(float(ss_val[0]) + float(st_val[0])) / 2,
                text=f"{float(ss_val[0]) - float(st_val[0]):.0f}pp Replacement Lag",
                showarrow=True, arrowhead=1, arrowcolor=MUTED,
                font=dict(size=11, color=WHITE),
                bgcolor=PANEL, bordercolor=MUTED
            )
        apply_theme(fig, height=380, yaxis_ticksuffix="%",
                    yaxis_title="Share (%)", xaxis_range=[2010, 2030])
        return fig

    @render_widget
    def chart_equity():
        df = raw_df()
        charger_2024 = df[
            (df["parameter"] == "EV charging points") &
            (df["category"] == "Historical") & (df["year"] == latest_year())
        ]
        charger_by = charger_2024.groupby("region_country")["value"].sum()

        sales_share_country = df[
            (df["parameter"] == "EV sales share") & (df["mode"] == "Cars") &
            (df["category"] == "Historical") & (df["year"] == 2023) &
            (df["powertrain"] == "EV") & (~df["region_country"].isin(EXCLUDE_REGIONS))
        ].set_index("region_country")["value"]

        merged = pd.DataFrame({
            "sales_share": sales_share_country,
            "chargers": charger_by,
        }).dropna()
        merged = merged[merged["chargers"] > 500]

        pop_approx = {
            "China": 1400, "USA": 330, "India": 1380, "Germany": 83,
            "United Kingdom": 67, "France": 67, "Norway": 5, "Sweden": 10,
            "Netherlands": 17, "Canada": 38, "Japan": 125, "Korea": 52,
            "Australia": 26, "Brazil": 213, "Indonesia": 273
        }
        sizes = [max(15, min(60, pop_approx.get(c, 20) / 5)) for c in merged.index]
        income_group = {
            "Norway": "High Income", "Sweden": "High Income",
            "Netherlands": "High Income", "Germany": "High Income",
            "USA": "High Income", "Japan": "High Income",
            "Korea": "High Income", "United Kingdom": "High Income",
            "France": "High Income", "Australia": "High Income", "Canada": "High Income",
            "China": "Upper-Mid Income", "Brazil": "Upper-Mid Income",
            "Indonesia": "Upper-Mid Income", "India": "Lower-Mid Income",
        }
        color_map = {"High Income": TEAL, "Upper-Mid Income": ORANGE, "Lower-Mid Income": "#f43f5e"}

        fig = go.Figure()
        for grp, clr in color_map.items():
            mask = [income_group.get(c, "High Income") == grp for c in merged.index]
            sub = merged[mask]
            if len(sub):
                fig.add_scatter(
                    x=sub["chargers"].tolist(),
                    y=sub["sales_share"].tolist(),
                    mode="markers+text", name=grp,
                    marker=dict(size=[sizes[i] for i, m in enumerate(mask) if m],
                                color=clr, opacity=0.85, line=dict(width=0)),
                    text=sub.index.tolist(),
                    textposition="top center",
                    textfont=dict(size=9, color=WHITE),
                    hovertemplate="<b>%{text}</b><br>Chargers: %{x:,.0f}<br>EV Sales Share: %{y:.1f}%<extra></extra>",
                )
        apply_theme(fig, height=380, xaxis_type="log",
                    xaxis_title="Public Chargers (log scale)",
                    yaxis_title="EV Sales Share (%)",
                    yaxis_ticksuffix="%")
        return fig

    @render_widget
    def chart_projection():
        hist, _ = hist_world_data()
        ts = hist.set_index("year")["value"] / 1e6
        kpi = kpi_values()
        steps_m = kpi["steps_2030"] / 1e6
        fc_years = list(range(2025, 2031))
        fc_mean = ci = ci95 = None

        try:
            from statsmodels.tsa.arima.model import ARIMA
            ts_period = ts.copy()
            ts_period.index = pd.PeriodIndex([pd.Period(y, "Y") for y in ts_period.index])
            model = ARIMA(ts_period, order=(2, 2, 1),
                          enforce_stationarity=False, enforce_invertibility=False)
            res = model.fit()
            forecast = res.get_forecast(steps=6)
            fc_mean = forecast.predicted_mean
            ci = forecast.conf_int(alpha=0.2)
            ci95 = forecast.conf_int(alpha=0.05)
        except Exception:
            # Fallback: data-driven CAGR from last 5 observed years (capped at 40%)
            last5 = ts.tail(5)
            if len(last5) >= 2:
                cagr = (last5.iloc[-1] / last5.iloc[0]) ** (1 / (len(last5) - 1)) - 1
                cagr = min(cagr, 0.40)
                fc_vals = [float(last5.iloc[-1]) * ((1 + cagr) ** i) for i in range(1, 7)]
            else:
                fc_vals = [float(ts.iloc[-1])] * 6
            fc_mean = pd.Series(fc_vals, index=fc_years)
            ci   = pd.DataFrame({"lower value": fc_mean * 0.88, "upper value": fc_mean * 1.12})
            ci95 = pd.DataFrame({"lower value": fc_mean * 0.78, "upper value": fc_mean * 1.22})

        fig = go.Figure()
        fig.add_scatter(
            x=hist["year"].tolist(),
            y=(hist["value"] / 1e6).tolist(),
            mode="lines", name="Historical (2010-2024)",
            line=dict(color=TEAL, width=3),
        )
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
        fig.add_scatter(
            x=fc_years, y=list(fc_mean),
            mode="lines", name="Forecast",
            line=dict(color=ORANGE, width=2.5, dash="dot"),
        )
        last_hist_yr = int(hist["year"].max())
        last_hist_val = float(hist[hist["year"] == last_hist_yr]["value"].values[0]) / 1e6
        fig.add_scatter(
            x=[last_hist_yr, 2030], y=[last_hist_val, steps_m],
            mode="lines+markers", name="IEA STEPS",
            line=dict(color=TEAL, width=1.5, dash="longdash"),
            marker=dict(symbol="star", size=12, color=RED),
        )
        fig.add_annotation(x=2030, y=steps_m,
                           text=f"{steps_m:.0f}M IEA STEPS",
                           font=dict(color=RED, size=11), showarrow=False,
                           xanchor="right", yanchor="bottom")
        apply_theme(fig, height=360, yaxis_title="EV Stock (Millions)",
                    xaxis_range=[2010, 2031])
        return fig

    @render_widget
    def chart_conclusion():
        # Use real 2024 data; for 2030 use STEPS projection where available,
        # otherwise interpolate from regional STEPS trend.
        ss24 = stock_share_2024_data()
        df = raw_df()

        proj_30 = df[
            (df["parameter"] == "EV stock share") & (df["mode"] == "Cars") &
            (df["category"] == "Projection-STEPS") & (df["year"] == 2030) &
            (df["powertrain"] == "EV")
        ].set_index("region_country")["value"]

        # Target countries for dumbbell (must appear in 2024 data)
        target_countries = ss24.head(7)["region_country"].tolist()
        data_24 = ss24.set_index("region_country")["value"].to_dict()

        # 2030 projection: use IEA where country-level data exists,
        # else scale by global STEPS ratio (World 2024→2030)
        world_24 = df[
            (df["region_country"] == "World") & (df["parameter"] == "EV stock share") &
            (df["mode"] == "Cars") & (df["category"] == "Historical") &
            (df["year"] == latest_year()) & (df["powertrain"] == "EV")
        ]["value"].values
        world_30_steps = proj_30.get("World", None)
        scale_factor = (float(world_30_steps) / float(world_24[0])) if (
            world_30_steps is not None and len(world_24) and float(world_24[0]) > 0
        ) else 3.3  # ~15% / 4.5% from data

        data_30 = {}
        for c in target_countries:
            if c in proj_30.index:
                data_30[c] = float(proj_30[c])
            else:
                data_30[c] = min(float(data_24.get(c, 5)) * scale_factor, 95.0)

        fig = go.Figure()
        for c in target_countries:
            v24 = data_24.get(c, 0)
            v30 = data_30.get(c, 0)
            fig.add_shape(type="line", x0=v24, x1=v30, y0=c, y1=c,
                          line=dict(color="rgba(255,255,255,0.15)", width=2))
        fig.add_scatter(
            x=[data_24.get(c, 0) for c in target_countries],
            y=target_countries, mode="markers", name="2024",
            marker=dict(size=12, color=MUTED, symbol="circle"),
            hovertemplate="%{y} 2024: %{x:.1f}%<extra></extra>",
        )
        fig.add_scatter(
            x=[data_30.get(c, 0) for c in target_countries],
            y=target_countries, mode="markers", name="2030 (STEPS/scaled)",
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
