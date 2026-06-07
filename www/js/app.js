function _extends() { return _extends = Object.assign ? Object.assign.bind() : function (n) { for (var e = 1; e < arguments.length; e++) { var t = arguments[e]; for (var r in t) ({}).hasOwnProperty.call(t, r) && (n[r] = t[r]); } return n; }, _extends.apply(null, arguments); }
// =====================================================================
// E-Mobility Dashboard - top-level React app
// =====================================================================

const {
  useState,
  useEffect,
  useRef,
  useMemo,
  createContext,
  useContext
} = React;

// -------- Icons (inline strokes; original artwork) --------
const I = {
  globe: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: "16",
    height: "16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6"
  }, p), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"
  })),
  trend: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: "16",
    height: "16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M3 17l6-6 4 4 8-9"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M14 6h7v7"
  })),
  plug: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: "16",
    height: "16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M12 17v4"
  })),
  bolt: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: "16",
    height: "16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6",
    strokeLinejoin: "round"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M13 2L4 14h7l-1 8 9-12h-7l1-8z"
  })),
  city: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: "16",
    height: "16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M3 21h18M5 21V7l5-3v17M14 21V10l5-2v13"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M7 9h1M7 12h1M7 15h1M16 13h1M16 16h1"
  })),
  target: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: "16",
    height: "16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6"
  }, p), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "9"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "5"
  }), /*#__PURE__*/React.createElement("circle", {
    cx: "12",
    cy: "12",
    r: "1.5",
    fill: "currentColor"
  })),
  brain: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: "16",
    height: "16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5 3 3 0 0 0 2 5v1a3 3 0 0 0 6 0V3a3 3 0 0 0-3 0z"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M15 3a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-2 5v1a3 3 0 0 1-6 0"
  })),
  download: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: "14",
    height: "14",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"
  })),
  copy: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: "14",
    height: "14",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7"
  }, p), /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "9",
    width: "11",
    height: "11",
    rx: "2"
  }), /*#__PURE__*/React.createElement("path", {
    d: "M5 15V5a2 2 0 0 1 2-2h10"
  })),
  expand: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: "14",
    height: "14",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.7"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M4 10V4h6M20 14v6h-6M4 4l7 7M20 20l-7-7"
  })),
  play: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 16 16",
    width: "14",
    height: "14",
    fill: "currentColor"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M4 3l9 5-9 5z"
  })),
  pause: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 16 16",
    width: "14",
    height: "14",
    fill: "currentColor"
  }, p), /*#__PURE__*/React.createElement("rect", {
    x: "4",
    y: "3",
    width: "3",
    height: "10"
  }), /*#__PURE__*/React.createElement("rect", {
    x: "9",
    y: "3",
    width: "3",
    height: "10"
  })),
  chev: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: "14",
    height: "14",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "2"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M9 6l6 6-6 6"
  })),
  filter: p => /*#__PURE__*/React.createElement("svg", _extends({
    viewBox: "0 0 24 24",
    width: "16",
    height: "16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.6"
  }, p), /*#__PURE__*/React.createElement("path", {
    d: "M3 5h18l-7 9v6l-4-2v-4z"
  }))
};

// ----- Tab manifest (Forecasting tab removed per request; its forecast story is now part of the ML tab) -----
const TABS = [{
  id: 0,
  label: 'Overview',
  icon: I.globe,
  key: 'overview'
}, {
  id: 1,
  label: 'Adoption Trends',
  icon: I.trend,
  key: 'adoption'
}, {
  id: 2,
  label: 'Infrastructure & Demand',
  icon: I.plug,
  key: 'infra'
}, {
  id: 3,
  label: 'Market Composition',
  icon: I.bolt,
  key: 'market'
}, {
  id: 4,
  label: 'Socioeconomic & Policy',
  icon: I.city,
  key: 'socio'
}, {
  id: 5,
  label: 'ML / Causality',
  icon: I.brain,
  key: 'ml'
}];

// =====================================================================
// Filter context - for cross-chart filtering
// =====================================================================
const FilterCtx = createContext(null);
const useFilters = () => useContext(FilterCtx);
const DEFAULT_FILTERS = {
  yearMin: 2010,
  yearMax: 2024,
  country: 'ALL',
  income: 'ALL',
  ev: 'ALL'
};
function FilterStatusBar() {
  const f = useFilters();
  if (!f) return null;
  const {
    state,
    set,
    reset
  } = f;
  const chips = [];
  if (state.yearMin !== DEFAULT_FILTERS.yearMin || state.yearMax !== DEFAULT_FILTERS.yearMax) {
    chips.push({
      k: 'years',
      label: `Years ${state.yearMin}-${state.yearMax}`,
      clear: () => set({
        yearMin: DEFAULT_FILTERS.yearMin,
        yearMax: DEFAULT_FILTERS.yearMax
      })
    });
  }
  if (state.country !== 'ALL') chips.push({
    k: 'country',
    label: `Country: ${state.country}`,
    clear: () => set({
      country: 'ALL'
    })
  });
  if (state.income !== 'ALL') chips.push({
    k: 'income',
    label: `Development: ${state.income}`,
    clear: () => set({
      income: 'ALL'
    })
  });
  if (state.ev !== 'ALL') chips.push({
    k: 'ev',
    label: `Powertrain: ${state.ev}`,
    clear: () => set({
      ev: 'ALL'
    })
  });
  if (!chips.length) return null;
  return /*#__PURE__*/React.createElement("div", {
    className: "filter-status"
  }, /*#__PURE__*/React.createElement("span", {
    className: "filter-status-label"
  }, "Active filters"), chips.map(c => /*#__PURE__*/React.createElement("button", {
    key: c.k,
    className: "filter-status-chip",
    onClick: c.clear,
    title: "Click to clear"
  }, c.label, " ", /*#__PURE__*/React.createElement("span", {
    className: "filter-status-x"
  }, "\xD7"))), /*#__PURE__*/React.createElement("button", {
    className: "filter-status-reset",
    onClick: reset
  }, "Reset all"));
}

// =====================================================================
// Reusable bits
// =====================================================================
function ChartCard({
  title,
  sub,
  callout,
  children,
  mount,
  deps = []
}) {
  const cardRef = useRef(null);
  const hostRef = useRef(null);
  const filters = useFilters();
  const fState = filters && filters.state;
  const safeName = (title || 'chart').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'chart';
  const getPlot = () => {
    const host = hostRef.current;
    if (!host) return null;
    return host.classList && host.classList.contains('js-plotly-plot') ? host : host.querySelector('.js-plotly-plot');
  };
  const copyText = async text => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.left = '-9999px';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
  };
  const handleDownload = () => {
    const plot = getPlot();
    if (!plot || !window.Plotly) return;
    Plotly.toImage(plot, {
      format: 'png',
      width: Math.max(1200, Math.round(plot.clientWidth || 1200)),
      height: Math.max(700, Math.round(plot.clientHeight || 700)),
      scale: 2
    }).then(url => {
      const a = document.createElement('a');
      a.href = url;
      a.download = safeName + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }).catch(err => {
      console.error('Download PNG failed', err);
      window.alert('Could not download this chart as PNG.');
    });
  };
  const handleCopyData = async () => {
    const plot = getPlot();
    if (!plot) return;
    const rows = (plot.data || []).map((trace, i) => ({
      trace: i,
      name: trace.name || '',
      type: trace.type || '',
      x: trace.x || null,
      y: trace.y || null,
      labels: trace.labels || null,
      values: trace.values || null,
      text: trace.text || null,
      customdata: trace.customdata || null
    }));
    try {
      await copyText(JSON.stringify(rows, null, 2));
      window.alert('Chart data copied to clipboard.');
    } catch (err) {
      console.error('Copy data failed', err);
      window.alert('Could not copy chart data.');
    }
  };
  const handleFullscreen = async () => {
    const target = cardRef.current || hostRef.current;
    if (!target) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
    } else if (target.requestFullscreen) {
      await target.requestFullscreen();
    }
    setTimeout(() => {
      try {
        Plotly.Plots.resize(hostRef.current);
      } catch (e) {}
    }, 120);
  };
  // Pass the full filter state to mount() so charts can react to year-range, country,
  // income tier and EV-type changes without each chart having to grab the context itself.
  useEffect(() => {
    if (mount && hostRef.current) {
      mount(hostRef.current, fState || {});
      const handle = () => Plotly.Plots.resize(hostRef.current);
      window.addEventListener('resize', handle);
      // Nudge Plotly to recompute size once the fl/grid layout has settled.
      // Without this, charts that mount into not-yet-measured flex/grid
      // children collapse and visually overlap.
      const raf1 = requestAnimationFrame(() => {
        try {
          Plotly.Plots.resize(hostRef.current);
        } catch (e) {}
        const raf2 = requestAnimationFrame(() => {
          try {
            Plotly.Plots.resize(hostRef.current);
          } catch (e) {}
        });
        hostRef.current && (hostRef.current.__raf2 = raf2);
      });
      const t = setTimeout(() => {
        try {
          Plotly.Plots.resize(hostRef.current);
        } catch (e) {}
      }, 250);
      return () => {
        window.removeEventListener('resize', handle);
        cancelAnimationFrame(raf1);
        if (hostRef.current && hostRef.current.__raf2) cancelAnimationFrame(hostRef.current.__raf2);
        clearTimeout(t);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fState && fState.country, fState && fState.income, fState && fState.ev, fState && fState.yearMin, fState && fState.yearMax, ...deps]);
  return /*#__PURE__*/React.createElement("div", {
    className: "card",
    ref: cardRef
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "chart-title"
  }, title), sub && /*#__PURE__*/React.createElement("div", {
    className: "chart-sub"
  }, sub)), /*#__PURE__*/React.createElement("div", {
    className: "chart-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    title: "Download PNG",
    onClick: handleDownload
  }, /*#__PURE__*/React.createElement(I.download, null)), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    title: "Copy data",
    onClick: handleCopyData
  }, /*#__PURE__*/React.createElement(I.copy, null)), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    title: "Fullscreen",
    onClick: handleFullscreen
  }, /*#__PURE__*/React.createElement(I.expand, null)))), /*#__PURE__*/React.createElement("div", {
    className: "chart-host",
    ref: hostRef
  }, children), callout && /*#__PURE__*/React.createElement("div", {
    className: "chart-callout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-callout-tag"
  }, "Takeaway"), /*#__PURE__*/React.createElement("div", {
    className: "chart-callout-body"
  }, callout)));
}
function SectionHeader({
  eyebrow,
  title,
  sub
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "section-band"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container has-filter"
  }, /*#__PURE__*/React.createElement("h1", {
    className: "section-title"
  }, title), /*#__PURE__*/React.createElement("div", {
    className: "section-sub"
  }, sub)));
}
function Insight({
  tagLabel,
  children,
  chips
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "insight"
  }, /*#__PURE__*/React.createElement("div", {
    className: "insight-tag"
  }, tagLabel || 'Policy brief'), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "insight-body"
  }, children), /*#__PURE__*/React.createElement("div", {
    className: "chips"
  }, chips.map((c, i) => /*#__PURE__*/React.createElement("span", {
    key: i,
    className: "chip " + (c.tone || 'slate')
  }, c.label)))));
}
function Kpi({
  label,
  value,
  sub,
  accent
}) {
  const style = accent ? {
    borderLeftColor: accent
  } : {};
  const valStyle = accent ? {
    color: accent
  } : {};
  return /*#__PURE__*/React.createElement("div", {
    className: "kpi",
    style: style
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpi-label"
  }, label), /*#__PURE__*/React.createElement("div", {
    className: "kpi-val",
    style: valStyle
  }, value), /*#__PURE__*/React.createElement("div", {
    className: "kpi-sub"
  }, sub));
}

// =====================================================================
// Left filter panel
// =====================================================================
function FilterPanel({
  open,
  onToggle
}) {
  const f = useFilters();
  if (!f) return null;
  const {
    state,
    set,
    reset
  } = f;
  const countries = ['ALL', ...Array.from(new Set([...Object.keys(window.COUNTRY_STOCK_M || {}), ...(window.SOCIO_2024 || []).map(r => r.country), ...(window.CHOROPLETH_2024 || []).map(r => r.name), ...(window.STRESS_2024 || []).map(r => r.country), ...(window.TOP20_MIX || []).map(r => r.country)].filter(c => c && c !== 'Rest of the world'))).sort((a, b) => a.localeCompare(b))];
  return /*#__PURE__*/React.createElement("aside", {
    className: "filter-panel " + (open ? 'open' : 'closed'),
    "aria-label": "Filters"
  }, /*#__PURE__*/React.createElement("button", {
    type: "button",
    className: "filter-toggle",
    "aria-label": open ? 'Close filters' : 'Open filters',
    "aria-expanded": open,
    onClick: onToggle
  }, /*#__PURE__*/React.createElement(I.chev, null)), /*#__PURE__*/React.createElement("div", {
    className: "filter-panel-body"
  }, /*#__PURE__*/React.createElement("div", {
    className: "fp-title"
  }, /*#__PURE__*/React.createElement(I.filter, null), " Filters"), /*#__PURE__*/React.createElement("h4", null, "Year range"), /*#__PURE__*/React.createElement("div", {
    className: "fp-year"
  }, /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: 2010,
    max: 2024,
    value: state.yearMin,
    onChange: e => set({
      yearMin: Math.min(parseInt(e.target.value || 2010, 10), state.yearMax)
    })
  }), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)'
    }
  }, "\u2192"), /*#__PURE__*/React.createElement("input", {
    type: "number",
    min: 2010,
    max: 2024,
    value: state.yearMax,
    onChange: e => set({
      yearMax: Math.max(parseInt(e.target.value || 2024, 10), state.yearMin)
    })
  })), /*#__PURE__*/React.createElement("h4", null, "Development Groups"), /*#__PURE__*/React.createElement("div", {
    className: "fp-segments"
  }, [{
    v: 'ALL',
    label: 'All development groups'
  }, {
    v: 'High',
    label: 'Developed'
  }, {
    v: 'Upper-middle',
    label: 'Developing'
  }, {
    v: 'Lower-middle',
    label: 'Developing, lower income'
  }].map(opt => /*#__PURE__*/React.createElement("button", {
    key: opt.v,
    className: "fp-seg " + (state.income === opt.v ? 'active' : ''),
    onClick: () => set({
      income: opt.v
    })
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), " ", opt.label))), /*#__PURE__*/React.createElement("h4", null, "Country"), /*#__PURE__*/React.createElement("select", {
    value: state.country,
    onChange: e => set({
      country: e.target.value
    })
  }, countries.map(c => /*#__PURE__*/React.createElement("option", {
    key: c,
    value: c
  }, c === 'ALL' ? '- All countries -' : c))), /*#__PURE__*/React.createElement("div", {
    className: "fp-meta"
  }, "When set, country-level charts highlight or filter to this market."), /*#__PURE__*/React.createElement("h4", null, "EV type"), /*#__PURE__*/React.createElement("div", {
    className: "fp-segments"
  }, ['ALL', 'BEV', 'PHEV', 'FCEV'].map(t => /*#__PURE__*/React.createElement("button", {
    key: t,
    className: "fp-seg " + (state.ev === t ? 'active' : ''),
    onClick: () => set({
      ev: t
    })
  }, /*#__PURE__*/React.createElement("span", {
    className: "dot"
  }), " ", t === 'ALL' ? 'All powertrains' : t))), /*#__PURE__*/React.createElement("button", {
    className: "fp-clear",
    onClick: reset
  }, "Reset all filters"), /*#__PURE__*/React.createElement("div", {
    className: "fp-meta",
    style: {
      marginTop: 18,
      paddingTop: 14,
      borderTop: '1px solid var(--border)'
    }
  }, /*#__PURE__*/React.createElement("strong", {
    style: {
      color: 'var(--ink-2)'
    }
  }, "Cross-chart filtering."), ' ', "Filters apply to country/income-aware charts (bubble, stress test, socio, choropleth). Time-series charts respect the year range.")));
}

// =====================================================================
// Tab 0 - Overview
// =====================================================================
function TabOverview() {
  return /*#__PURE__*/React.createElement("div", {
    className: "tab-body"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    eyebrow: "GLOBAL SNAPSHOT",
    title: "The Global EV Transition, at a Glance",
    sub: "Where the world stands in 2024 - and where it's headed by 2030."
  }), /*#__PURE__*/React.createElement("div", {
    className: "container has-filter",
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "kpi-row"
  }, /*#__PURE__*/React.createElement(Kpi, {
  label: "EV cars on the road, 2024",
  value: "58.1 M",
  sub: "All powertrains \xB7 global"
}), /*#__PURE__*/React.createElement(Kpi, {
  label: "Share of car stock, 2024",
  value: "4.5 %",
  sub: "Of all cars on the road \xB7 global"
}), /*#__PURE__*/React.createElement(Kpi, {
  label: "Share of new car sales, 2024",
  value: "22 %",
  sub: "global"
}), /*#__PURE__*/React.createElement(Kpi, {
  label: "Public charging points, 2024",
  value: "5.40 M",
  sub: "Million individual connectors of fast and slow chargers \xB7 global"
  })), /*#__PURE__*/React.createElement("div", {
    className: "grid-stack"
  }, /*#__PURE__*/React.createElement(ChartCard, {
    title: "Current and projected trends of EV Car Fleet & Sales Share",
    sub: "IEA STEPS (Stated Policies Scenario) is the trajectory implied by today's announced policies - not an aspiration. Bars: EV stock (M, left axis). Markers: sales share (%, right axis).",
    mount: mountFleetSalesShare,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, /*#__PURE__*/React.createElement("strong", null, "Stock and sales diverged"), " - sales share already at 22%, but only 4.5% of the on-road fleet is electric. The 2030s will be the fleet-turnover decade.")
  }), /*#__PURE__*/React.createElement("div", {
    className: "grid-2"
  }, /*#__PURE__*/React.createElement(ChartCard, {
    title: "World EV car stocks by powertrain over time",
    sub: "BEV and PHEV dominate the global EV powertrain mix; FCEV remains a sliver. Stacked area shows the relative scale of each.",
    mount: mountStockByPowertrain,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "BEVs make up ", /*#__PURE__*/React.createElement("strong", null, "~68% of the global EV fleet"), " by 2024 and the gap with PHEV is widening.")
  }), /*#__PURE__*/React.createElement(ChartCard, {
    title: "World charging points over time",
    sub: "Slow public chargers (Level 1/2, AC) lead in count and have stayed ahead of fast DC chargers throughout - Slow makes up ~58% of the stack in 2024.",
    mount: mountChargersWorld,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "Slow chargers carry the network; fast chargers are growing faster on a percentage basis (3.5\xD7 since 2020) but still only ", /*#__PURE__*/React.createElement("strong", null, "44.2%"), " of public points.")
  })), /*#__PURE__*/React.createElement(ChartCard, {
    title: "EV stock proportion by mode and powertrain, 2024",
    sub: "Within each powertrain, which vehicle modes dominate.",
    mount: mountModeMixPies,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "BEV span all three modes -> BEV predominantly deployed in 2-and-3 wheelers, while also maintaining a presence in passenger car.")
  })), /*#__PURE__*/React.createElement(Insight, {
    tagLabel: "Hook",
    chips: [{
      label: '58.1 M EVs (2024)',
      tone: 'teal'
    }, {
      label: '22% sales share',
      tone: 'amber'
    }, {
      label: '232 M projected (STEPS 2030)',
      tone: 'coral'
    }]
  }, /*#__PURE__*/React.createElement("p", null, "From 2010 to 2024, the global EV fleet grew from ", /*#__PURE__*/React.createElement("strong", null, "~20,000 cars to 58.1 million"), " - a compound annual growth rate of approximately ", /*#__PURE__*/React.createElement("strong", null, "67%"), ". Sales share of new cars now stands at ", /*#__PURE__*/React.createElement("strong", null, "22%"), ", while stock share lags at ", /*#__PURE__*/React.createElement("strong", null, "4.5%"), ", indicating the world is mid-transition: the ", /*#__PURE__*/React.createElement("em", null, "sales"), " shift has happened, the ", /*#__PURE__*/React.createElement("em", null, "fleet"), " turnover is still ahead. The IEA STEPS scenario projects ", /*#__PURE__*/React.createElement("strong", null, "232 M EVs and a 42% sales share by 2030"), ". BEVs dominate the global Cars segment, with China alone accounting for roughly ", /*#__PURE__*/React.createElement("strong", null, "59%"), " of the world EV fleet."))));
}

// =====================================================================
// Tab 1 - Adoption Trends
// =====================================================================
function TabAdoption() {
  const raceRef = useRef(null);
  const raceCtrl = useRef(null);
  const [year, setYear] = useState(2024);
  const [playing, setPlaying] = useState(false);
  const playRef = useRef(null);
  useEffect(() => {
    if (raceRef.current) {
      raceCtrl.current = mountBarRace(raceRef.current, year);
    }
    return () => {
      if (playRef.current) clearInterval(playRef.current);
      if (raceCtrl.current && raceCtrl.current.destroy) raceCtrl.current.destroy();
    };
    // eslint-disable-next-line
  }, []);
  useEffect(() => {
    if (raceCtrl.current) raceCtrl.current.update(year);
  }, [year]);
  function togglePlay() {
    if (playing) {
      clearInterval(playRef.current);
      setPlaying(false);
    } else {
      setPlaying(true);
      if (year >= 2024) setYear(2010);
      playRef.current = setInterval(() => {
        setYear(y => {
          if (y >= 2024) {
            clearInterval(playRef.current);
            setPlaying(false);
            return 2024;
          }
          return y + 1;
        });
      }, 900);
    }
  }

  // Track the year-on-year leader to subtitle the race
  const leaders = {
    2010: 'USA',
    2011: 'USA',
    2012: 'USA',
    2013: 'USA',
    2014: 'USA',
    2015: 'USA',
    2016: 'China',
    2017: 'China',
    2018: 'China',
    2019: 'China',
    2020: 'China',
    2021: 'China',
    2022: 'China',
    2023: 'China',
    2024: 'China'
  };
  return /*#__PURE__*/React.createElement("div", {
    className: "tab-body"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    eyebrow: "ADOPTION TRENDS",
    title: "Who is winning the EV race?",
    sub: "Three big players, one inflection point, and the moment growth went exponential."
  }), /*#__PURE__*/React.createElement("div", {
    className: "container has-filter",
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-stack"
  }, /*#__PURE__*/React.createElement(ChartCard, {
    title: "EV sales and on-the-road vehicles by country and region",
    sub: "Bubble = EV stock (millions). Aggregates (CHN, APAC, EUR\u2026) plotted alongside countries.",
    mount: mountSalesStockBubbles,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "China (34M stock, 11.2M sales) dwarfs every other single market - its bubble is ", /*#__PURE__*/React.createElement("strong", null, "~5\xD7 larger"), " than the USA's.")
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "chart-title"
  }, "Top-12 EV car stock by country - ", year), /*#__PURE__*/React.createElement("div", {
    className: "chart-sub"
  }, "Sorted by rank each year. Leader in ", /*#__PURE__*/React.createElement("strong", null, year), ": ", /*#__PURE__*/React.createElement("strong", {
    style: {
      color: leaders[year] === 'China' ? '#D62828' : '#1D4E89'
    }
  }, leaders[year]), ". \xA0\xB7\xA0 USA led 2010-2015; ", /*#__PURE__*/React.createElement("strong", null, "China overtook in 2016"), " and has held the lead since.")), /*#__PURE__*/React.createElement("div", {
    className: "chart-actions"
  }, /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    title: "Download PNG"
  }, /*#__PURE__*/React.createElement(I.download, null)), /*#__PURE__*/React.createElement("button", {
    className: "icon-btn",
    title: "Fullscreen"
  }, /*#__PURE__*/React.createElement(I.expand, null)))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '6px 20px 0',
      display: 'flex',
      flexWrap: 'wrap',
      gap: 10
    }
  }, [['China', '#D62828'], ['USA', '#1D4E89'], ['Germany', '#FFB703'], ['France', '#7209B7'], ['UK', '#9D0208'], ['Norway', '#0077B6'], ['Netherlands', '#118AB2'], ['Sweden', '#06A77D'], ['Japan', '#BC4749'], ['Korea', '#FF006E'], ['Italy', '#D62246'], ['Canada', '#9B2226']].map(([c, col]) => /*#__PURE__*/React.createElement("span", {
    key: c,
    style: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: 6,
      fontSize: 11,
      color: 'var(--ink-2)',
      fontFamily: 'var(--font-mono)'
    }
  }, /*#__PURE__*/React.createElement("span", {
    style: {
      width: 10,
      height: 10,
      borderRadius: 2,
      background: col
    }
  }), c))), /*#__PURE__*/React.createElement("div", {
    ref: raceRef,
    className: "chart-host"
  }), /*#__PURE__*/React.createElement("div", {
    className: "scrubber"
  }, /*#__PURE__*/React.createElement("button", {
    className: "play",
    onClick: togglePlay,
    "aria-label": playing ? 'Pause' : 'Play'
  }, playing ? /*#__PURE__*/React.createElement(I.pause, null) : /*#__PURE__*/React.createElement(I.play, null)), /*#__PURE__*/React.createElement("div", {
    className: "yr-label"
  }, "Year: ", year), /*#__PURE__*/React.createElement("input", {
    type: "range",
    min: 2010,
    max: 2024,
    step: 1,
    value: year,
    onChange: e => {
      if (playing) togglePlay();
      setYear(parseInt(e.target.value, 10));
    }
  })), /*#__PURE__*/React.createElement("div", {
    className: "chart-callout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-callout-tag"
  }, "Takeaway"), /*#__PURE__*/React.createElement("div", {
    className: "chart-callout-body"
  }, "Bars re-rank every year, so you can watch position changes directly. Notable: Norway briefly entered the top-5 in 2017-2019, then dropped as China/Europe scaled."))), /*#__PURE__*/React.createElement(ChartCard, {
    title: "EV Growth Comparison: China, USA, Europe (2016-2024)",
    sub: "Stacked stock bars (left axis) + dashed sales-share line (right axis), one panel per region - same scales for direct comparison.",
    mount: mountGrowthCompare,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "China hit a ", /*#__PURE__*/React.createElement("strong", null, "48% sales share"), " in 2024; Europe is at 24% and the USA at 10.5% - three speeds, same direction.")
  }), /*#__PURE__*/React.createElement(ChartCard, {
    title: "When did exponential growth start?",
    sub: "China vs USA EV sales with policy event annotations and inflection markers. Shaded bands mark synchronized global anomalies (COVID-19, post-COVID rebound, 2022 oil-price spike).",
    mount: mountInflection,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "China's curve bends sharply around ", /*#__PURE__*/React.createElement("strong", null, "2015"), " (post-NEV-credit-mandate); the USA's inflection comes ~3 years later in ", /*#__PURE__*/React.createElement("strong", null, "2018"), ".")
  })), /*#__PURE__*/React.createElement(Insight, {
    tagLabel: "Race",
    chips: [{
      label: 'China overtook USA: 2016',
      tone: 'teal'
    }, {
      label: 'Policy precedes inflection by ~1-2 yrs',
      tone: 'amber'
    }, {
      label: 'Top 3: China · USA · Europe',
      tone: 'slate'
    }]
  }, /*#__PURE__*/React.createElement("p", null, "China and the USA dominate EV sales in absolute terms (", /*#__PURE__*/React.createElement("strong", null, "CHN 11.2M"), " sales in 2024, ", /*#__PURE__*/React.createElement("strong", null, "USA ~1.6M"), "), with Europe collectively rivalling the USA. China started the race behind the USA in 2012, drew level around 2015, and decisively overtook the USA in ", /*#__PURE__*/React.createElement("strong", null, "2016"), " - a lead that has compounded ever since. The ", /*#__PURE__*/React.createElement("strong", null, "2017 China NEV credit mandate"), " and the ", /*#__PURE__*/React.createElement("strong", null, "2020 charging infrastructure rollout"), " map directly to the inflection points where China's curve bent upward most sharply. The synchronized COVID-19 dip (2020) and post-COVID rebound (2021) appear in nearly every country's series, suggesting global shocks dominate idiosyncratic policy in their year of impact."))));
}

// =====================================================================
// Tab 2 - Infrastructure & Demand
// =====================================================================
function TabInfra() {
  return /*#__PURE__*/React.createElement("div", {
    className: "tab-body"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    eyebrow: "INFRASTRUCTURE & DEMAND",
    title: "Chicken or Egg?",
    sub: "Do chargers lead EVs, or follow them?"
  }), /*#__PURE__*/React.createElement("div", {
    className: "container has-filter",
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-stack"
  }, /*#__PURE__*/React.createElement(ChartCard, {
    title: "Chargers vs EVs: do they grow together?",
    sub: "World, historical. Top: EVs (M). Bottom: chargers (M), Fast + Slow stacked. Compare shapes, not magnitudes. Synced reference line at 2020.",
    mount: mountInfraVsEvs,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "EV stock and charger count grow in lockstep until ~2020, then EVs ", /*#__PURE__*/React.createElement("strong", null, "pull ahead"), " - adoption is outpacing infrastructure.")
  }), /*#__PURE__*/React.createElement(ChartCard, {
    title: "Adoption trend with urbanization overlay",
    sub: "World EV sales share (bars, left axis) against urbanization rate (line, right axis, full 0-100% scale). Both rise - but is urbanization a leading signal, or just a parallel trend?",
    mount: mountAdoptionUrban,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "The two curves move together: every 1pp rise in urban share since 2015 has coincided with roughly ", /*#__PURE__*/React.createElement("strong", null, "3pp"), " of EV sales-share gain. Association, not causation - see the Granger test below.")
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "chart-title"
  }, "Granger causality \xB7 Urbanization \u2192 EV sales share"), /*#__PURE__*/React.createElement("div", {
    className: "chart-sub"
  }, "Cross-reference for the Infrastructure \u2194 adoption question above."))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '4px 20px 16px'
    }
  }, /*#__PURE__*/React.createElement("p", {
    style: {
      fontSize: 14,
      color: 'var(--ink-2)',
      lineHeight: 1.65,
      marginTop: 4,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("strong", null, "What this tests."), " Granger causality asks a forecasting question: ", /*#__PURE__*/React.createElement("em", null, "does knowing past urbanization values help predict future EV sales share, beyond what EV sales share's own past values already tell you?"), " If yes (low p-value), urbanization is said to ", /*#__PURE__*/React.createElement("em", null, "Granger-cause"), " EV adoption. If no, the two are correlated but neither is provably leading the other in time."), /*#__PURE__*/React.createElement("div", {
    className: "granger-verdict"
  }, /*#__PURE__*/React.createElement("div", {
    className: "granger-verdict-tag"
  }, "Verdict"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("strong", null, "No Granger causality at either lag tested (\u03B1 = 0.05)."), " F-tests on lag-1 and lag-2 both produce p > 0.33. Urbanization and EV adoption co-move on China's series, but on this data urbanization does not provably ", /*#__PURE__*/React.createElement("em", null, "lead"), " EV adoption in time.")), /*#__PURE__*/React.createElement("table", {
    className: "data"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Lag (years)"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "SSR F-stat"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "F p-value"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "\u03C7\xB2 p-value"), /*#__PURE__*/React.createElement("th", null, "Reject H\u2080?"))), /*#__PURE__*/React.createElement("tbody", null, [{
    lag: 1,
    F: 1.021,
    p: 0.334,
    chi: 0.254
  }, {
    lag: 2,
    F: 1.208,
    p: 0.348,
    chi: 0.140
  }].map(g => /*#__PURE__*/React.createElement("tr", {
    key: g.lag
  }, /*#__PURE__*/React.createElement("td", null, g.lag), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, g.F.toFixed(3)), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, g.p.toFixed(3)), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, g.chi.toFixed(3)), /*#__PURE__*/React.createElement("td", {
    style: {
      color: 'var(--ink-2)'
    }
  }, "No - fail to reject"))))), /*#__PURE__*/React.createElement("div", {
    style: {
      marginTop: 12,
      fontSize: 11,
      color: 'var(--muted)',
      fontFamily: 'var(--font-mono)'
    }
  }, "Source: ", /*#__PURE__*/React.createElement("code", {
    style: {
      background: 'var(--surface)',
      padding: '0 4px',
      borderRadius: 3
    }
  }, "granger_china_results.csv"), " \xB7 Method: statsmodels' ", /*#__PURE__*/React.createElement("code", {
    style: {
      background: 'var(--surface)',
      padding: '0 4px',
      borderRadius: 3
    }
  }, "grangercausalitytests"), " on China's annual urban-pct \u2192 EV-share series (2010-2024, n = 15).")), /*#__PURE__*/React.createElement("div", {
    className: "chart-callout"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-callout-tag"
  }, "Takeaway"), /*#__PURE__*/React.createElement("div", {
    className: "chart-callout-body"
  }, "No statistically detectable lead-lag between urbanization and EV adoption at \u03B1 = 0.05. Chickens AND eggs - they emerge together. The full ML evidence (pooled OLS and the EV adoption gap) lives in the ML / Causality tab."))), /*#__PURE__*/React.createElement("div", {
    className: "grid-2-wide-left"
  }, /*#__PURE__*/React.createElement(ChartCard, {
    title: "Charger-to-EV stress test, 2024",
    sub: "X = EV stock (log, M). Y = EVs per public charger (higher = worse). Bubble = \u221D\u221Astock.",
    mount: mountStressTest,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "The ", /*#__PURE__*/React.createElement("strong", null, "1:12 global average"), " hides huge dispersion - Korea sits at 1:2, New Zealand at 1:78.")
  }), /*#__PURE__*/React.createElement("div", {
    className: "card"
  }, /*#__PURE__*/React.createElement("div", {
    className: "chart-head"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    className: "chart-title"
  }, "Worst charger-to-EV ratios"), /*#__PURE__*/React.createElement("div", {
    className: "chart-sub"
  }, "Top 5 markets where drivers compete hardest for plugs."))), /*#__PURE__*/React.createElement("div", {
    style: {
      padding: '0 16px 16px'
    }
  }, /*#__PURE__*/React.createElement("table", {
    className: "data"
  }, /*#__PURE__*/React.createElement("thead", null, /*#__PURE__*/React.createElement("tr", null, /*#__PURE__*/React.createElement("th", null, "Country"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "EV stock (M)"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "Chargers"), /*#__PURE__*/React.createElement("th", {
    className: "num"
  }, "EVs / charger"))), /*#__PURE__*/React.createElement("tbody", null, [{
    c: 'New Zealand',
    s: 0.113,
    ch: 1440,
    r: 78.5,
    sev: 1
  }, {
    c: 'Australia',
    s: 0.302,
    ch: 6700,
    r: 45.1,
    sev: .74
  }, {
    c: 'Mexico',
    s: 0.068,
    ch: 1850,
    r: 36.8,
    sev: .55
  }, {
    c: 'USA',
    s: 6.319,
    ch: 193000,
    r: 32.7,
    sev: .45
  }, {
    c: 'Norway',
    s: 0.960,
    ch: 31000,
    r: 31.0,
    sev: .40
  }].map(row => /*#__PURE__*/React.createElement("tr", {
    key: row.c
  }, /*#__PURE__*/React.createElement("td", null, row.c), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, row.s.toFixed(3)), /*#__PURE__*/React.createElement("td", {
    className: "num"
  }, row.ch.toLocaleString()), /*#__PURE__*/React.createElement("td", {
    className: "heat",
    style: {
      background: `rgba(231,111,81,${0.10 + row.sev * 0.45})`,
      color: '#7C2B17'
    }
  }, row.r.toFixed(1)))))), /*#__PURE__*/React.createElement("div", {
    style: {
      fontSize: 12,
      color: 'var(--muted)',
      marginTop: 10
    }
  }, "Best in class: Netherlands ~ ", /*#__PURE__*/React.createElement("strong", null, "1 : 5"), ", Korea ~ ", /*#__PURE__*/React.createElement("strong", null, "1 : 2"), "."))))), /*#__PURE__*/React.createElement(Insight, {
    tagLabel: "Stress",
    chips: [{
      label: 'Global ratio: 1:12 (2024)',
      tone: 'amber'
    }, {
      label: 'Worst: New Zealand 1:78',
      tone: 'coral'
    }, {
      label: 'Best: Netherlands & dense EU',
      tone: 'teal'
    }]
  }, /*#__PURE__*/React.createElement("p", null, "At the global level, EV deployment and public charging have grown together - chargers slightly led in absolute terms during the 2010s, but EV stock has been ", /*#__PURE__*/React.createElement("strong", null, "outpacing charger growth since around 2020"), ". By 2024, the world adds roughly ", /*#__PURE__*/React.createElement("strong", null, "12 EVs for every new public charger"), ". Per-country stress varies enormously: New Zealand (1:78), Australia (1:45), and Mexico (1:37) face the most acute charging deficits, while the USA - despite having the fourth-largest charger fleet (193,000 points) - still has ", /*#__PURE__*/React.createElement("strong", null, "33 EVs per charger"), " because adoption scaled faster than infrastructure. European countries with dense public networks (Netherlands, France, Germany) sit at the favorable end of the spectrum."))));
}

// =====================================================================
// Tab 3 - Market Composition (now includes choropleth)
// =====================================================================
function TabMarket() {
  return /*#__PURE__*/React.createElement("div", {
    className: "tab-body"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    eyebrow: "MARKET COMPOSITION",
    title: "What kind of EV, and where?",
    sub: "BEV vs PHEV split, the global geography of adoption, and whether the fleet is turning over fast enough for 2030."
  }), /*#__PURE__*/React.createElement("div", {
    className: "container has-filter",
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-stack"
  }, /*#__PURE__*/React.createElement(ChartCard, {
    title: "EV sales share by country, 2024 - world map",
    sub: "Choropleth of EV share of new car sales. Darker = higher share. Scale capped at 60% so country variation is visible. Gray = no data reported.",
    mount: mountChoropleth,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "Norway (92%) and the Nordics lead by a wide margin; the Americas (ex-Canada) and most of Asia outside China lag below 10%.")
  }), /*#__PURE__*/React.createElement(ChartCard, {
    title: "The turnover gap: sales share vs stock share",
    sub: "World, cars. Solid = historical. Dashed + diamond = STEPS projection. The widening gap is the single most important slide for 2030 planning.",
    mount: mountTurnoverGap,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "By 2030, sales hit 42% but stock only reaches ~15%: ", /*#__PURE__*/React.createElement("strong", null, "27pp gap"), " = unfinished fleet turnover. The 2030s will be the fleet-turnover decade.")
  }), /*#__PURE__*/React.createElement(ChartCard, {
    title: "Top 10 EV markets proportion, 2024",
    sub: "BEV vs PHEV share of EV car stock, per country. PHEV-dominant rows are highlighted. FCEV is <1% in every market and is excluded for clarity.",
    mount: mountTop20Mix,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "7 out of 10 markets are ", /*#__PURE__*/React.createElement("strong", null, "BEV-dominant"), "; PHEV holdouts (Finland, Italy, Spain) cluster in countries with weaker fast-charging networks.")
  })), /*#__PURE__*/React.createElement(Insight, {
    tagLabel: "Composition",
    chips: [{
      label: 'BEV-dominant in 7/10 top markets',
      tone: 'teal'
    }, {
      label: 'Sales-stock gap: 27 pp by 2030',
      tone: 'amber'
    }, {
      label: 'Fleet turnover = the 2030s story',
      tone: 'slate'
    }]
  }, /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "BEVs dominate"), " the top 10 EV markets, accounting for 60%+ of EV stock in ", /*#__PURE__*/React.createElement("strong", null, "7 of them"), ". China (68% BEV), USA (75%), and Norway (78%) are clearly BEV-led, while markets like Finland (42% BEV) and Spain (47%) still rely heavily on PHEVs. PHEVs remain a meaningful transitional technology in markets with weaker fast-charging networks or stronger PHEV-favorable subsidies. The ", /*#__PURE__*/React.createElement("strong", null, "fleet turnover gap"), " is the central tension of the next decade: by 2030, sales share is projected to reach ", /*#__PURE__*/React.createElement("strong", null, "42%"), " while stock share only catches up to ", /*#__PURE__*/React.createElement("strong", null, "~15%"), " - meaning the 2020s are the ", /*#__PURE__*/React.createElement("em", null, "sales"), " transition and the 2030s will be the ", /*#__PURE__*/React.createElement("em", null, "fleet"), " transition."))));
}

// =====================================================================
// Tab 4 - Socioeconomic & Policy (with gas + emissions overlay)
// =====================================================================
function TabSocio() {
  return /*#__PURE__*/React.createElement("div", {
    className: "tab-body"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    eyebrow: "SOCIOECONOMIC & POLICY",
    title: "Is EV adoption equitable?",
    sub: "EV penetration vs charging infrastructure density, gas prices, and transport emissions."
  }), /*#__PURE__*/React.createElement("div", {
    className: "container has-filter",
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "grid-stack"
  }, /*#__PURE__*/React.createElement(ChartCard, {
    title: "Adoption vs infrastructure density, 2024",
    sub: "X = public chargers per million (log scale). Y = EV sales share %. Bubble size \u221D \u221A(EV stock). Color = income group. Outliers and big markets are labeled by default; hover any bubble for full detail.",
    mount: mountSocio,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "A near-linear ladder on log-scale chargers: every ", /*#__PURE__*/React.createElement("strong", null, "10\xD7"), " in charger density predicts ~25pp more sales share.")
  }), /*#__PURE__*/React.createElement(ChartCard, {
    title: "Gas prices, transport emissions, and EV adoption",
    sub: "Bars: world transport CO\u2082 (Gt, left). Solid line: average gas price (USD/L, right). Dotted: EV sales share (%). Are EVs co-moving with the external pressure to electrify?",
    mount: mountGasEmissions,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "Per-capita CO\u2082 emissions rose through 2019 before declining after 2020, while EV adoption accelerated. Gas-price spikes (2022) align with EV-share accelerations.")
  }), /*#__PURE__*/React.createElement("div", {
    className: "kpi-row",
    style: {
      marginTop: 4
    }
  }, /*#__PURE__*/React.createElement(Kpi, {
    label: "Median sales share \xB7 High income",
    value: "24.0 %",
    sub: "High-income median (Norway, Sweden, NL, UK\u2026)",
    accent: INCOME_COLORS.High
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Median sales share \xB7 Upper-middle",
    value: "7.4 %",
    sub: "China, Costa Rica, T\xFCrkiye, Brazil, Mexico",
    accent: INCOME_COLORS['Upper-middle']
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Median sales share \xB7 Lower-middle",
    value: "4.7 %",
    sub: "India, Indonesia, Ukraine, Philippines",
    accent: INCOME_COLORS['Lower-middle']
  }), /*#__PURE__*/React.createElement(Kpi, {
    label: "Outlier \xB7 China",
    value: "48 %",
    sub: "Behaves like high-income on adoption",
    accent: PALETTE.accent
  }))), /*#__PURE__*/React.createElement(Insight, {
    tagLabel: "Equity",
    chips: [{
      label: 'High income: 24%',
      tone: 'teal'
    }, {
      label: 'China is the outlier: 48%',
      tone: 'amber'
    }, {
      label: '5× gap between tiers',
      tone: 'coral'
    }]
  }, /*#__PURE__*/React.createElement("p", null, "EV adoption is sharply stratified by income. The median sales share is ", /*#__PURE__*/React.createElement("strong", null, "24% in high-income countries, 7.4% in upper-middle-income countries, and 4.7% in lower-middle-income countries"), " - a five-fold gap between the top and bottom tiers. Within the high-income group, Nordic countries (Norway 92%, Sweden 58%) lead by a wide margin, driven by aggressive tax incentives and dense charging networks. China is the standout exception in the upper-middle tier: at ", /*#__PURE__*/React.createElement("strong", null, "48% sales share and 2,481 chargers per million people"), ", it operates closer to high-income leaders than to its income peers. The lower-middle-income group remains pre-adoption in cars, but is leapfrogging into electric two- and three-wheelers (visible in the Overview tab's powertrain \xD7 mode breakdown)."))));
}

// =====================================================================
// Tab 5 - ML / Causality
// =====================================================================
function TabML() {
  return /*#__PURE__*/React.createElement("div", {
    className: "tab-body"
  }, /*#__PURE__*/React.createElement(SectionHeader, {
    eyebrow: "ML & ASSOCIATION",
    title: "What is associated with EV adoption?",
    sub: "A pooled OLS describes EV sales from country fundamentals; the adoption gap shows which countries beat or fall short of that benchmark - paired with the time-series Granger evidence from the Infrastructure tab."
  }), /*#__PURE__*/React.createElement("div", {
    className: "container has-filter",
    style: {
      marginTop: 24
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-intro"
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-intro-eyebrow"
  }, "In one paragraph"), /*#__PURE__*/React.createElement("p", null, "We fit a pooled OLS on ", /*#__PURE__*/React.createElement("strong", null, "651 country-year observations"), " (R\xB2 = 0.696, all p < 0.001) describing log(EV sales) from urbanization, population, electricity generation, and emissions. The model captures association, ", /*#__PURE__*/React.createElement("em", null, "not"), " causation. The interesting story is the residual - the ", /*#__PURE__*/React.createElement("strong", null, "adoption gap"), " between a country's actual EV sales and what the OLS expects. Countries above their expected level (China, UK, Portugal, Belgium, Denmark) likely benefit from policy, incentives, or charging ecosystems the model never sees; countries below it (Japan, Korea, Norway, South Africa) face barriers the fundamentals don't capture.")), /*#__PURE__*/React.createElement("div", {
    className: "section-divider"
  }, /*#__PURE__*/React.createElement("span", {
    className: "section-divider-label"
  }, "Pooled-panel analysis"), /*#__PURE__*/React.createElement("span", {
    className: "section-divider-meta"
  }, "n = 651 country-year observations \xB7 R\xB2 = 0.696 \xB7 OLS on log(EV sales)")), /*#__PURE__*/React.createElement("div", {
    className: "grid-stack"
  }, /*#__PURE__*/React.createElement(ChartCard, {
    title: "EV adoption gap, 2024 \xB7 top 10 over- vs top 10 under-performers",
    sub: /*#__PURE__*/React.createElement(React.Fragment, null, "Horizontal bars of the ", /*#__PURE__*/React.createElement("strong", null, "adoption gap"), " on the log(EV sales) scale. ", /*#__PURE__*/React.createElement("strong", null, "Positive"), " = actual EV sales above OLS-expected; ", /*#__PURE__*/React.createElement("strong", null, "negative"), " = below. ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted)'
      }
    }, "Source: adoption_gap_top_bottom_2024.csv.")),
    mount: mountAdoptionGapBar,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "Some countries outperform their socioeconomic fundamentals in EV adoption. ", /*#__PURE__*/React.createElement("strong", null, "China, UK, Portugal, Belgium, and Denmark"), " have actual EV sales above OLS-expected levels, suggesting that additional factors such as policy support, incentives, charging infrastructure, or market strategy may play an important role beyond the variables captured in the dataset.")
  }), /*#__PURE__*/React.createElement(ChartCard, {
    title: "Actual vs expected EV sales, 2024 (log\u2013log)",
    sub: /*#__PURE__*/React.createElement(React.Fragment, null, "Each dot = one country. The dashed diagonal is ", /*#__PURE__*/React.createElement("strong", null, "actual = expected"), "; points above it overperform the OLS benchmark, points below underperform. Highlighted: China, UK, Norway, Japan, South Africa. ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted)'
      }
    }, "Source: adoption_gap_2024.csv.")),
    mount: mountActualVsExpected,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "The gap between actual and expected EV sales shows that EV adoption cannot be fully explained by urbanization, population, electricity generation, and emissions alone. Markets above the diagonal likely reflect stronger policy or ecosystem effects, while markets below the line may face barriers not captured in the model.")
  }), /*#__PURE__*/React.createElement(ChartCard, {
    title: "OLS coefficients with 95% CI",
    sub: /*#__PURE__*/React.createElement(React.Fragment, null, "Pooled regression on log(EV sales) as the target. Bars are 95% confidence intervals. ", /*#__PURE__*/React.createElement("strong", null, "n = 651 country-year observations \xB7 R\xB2 = 0.696 \xB7 all p < 0.001"), ". ", /*#__PURE__*/React.createElement("span", {
      style: {
        color: 'var(--muted)'
      }
    }, "Source: ols_final_results.csv.")),
    mount: mountOlsCoefs,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "Strongest positive associations are ", /*#__PURE__*/React.createElement("strong", null, "electricity generation capacity"), " (\u03B2 = +2.20), ", /*#__PURE__*/React.createElement("strong", null, "year trend"), " (\u03B2 = +0.48/yr), and ", /*#__PURE__*/React.createElement("strong", null, "urbanization"), " (\u03B2 = +0.027/pp). Population is significantly ", /*#__PURE__*/React.createElement("em", null, "negative"), " after controls (\u03B2 = \u22121.28), which should be interpreted cautiously because population and electricity generation may overlap as market-scale indicators. Overall, the model supports ", /*#__PURE__*/React.createElement("strong", null, "association, not causation"), ".")
  })), /*#__PURE__*/React.createElement("div", {
    className: "ml-intro",
    style: {
      marginTop: 20
    }
  }, /*#__PURE__*/React.createElement("div", {
    className: "ml-intro-eyebrow"
  }, "Key result \xB7 2024 adoption gap"), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "Top overperformers:"), " Luxembourg, UK, Portugal, China, Belgium, Denmark, Costa Rica, Ireland, Uzbekistan, Indonesia."), /*#__PURE__*/React.createElement("p", null, /*#__PURE__*/React.createElement("strong", null, "Top underperformers:"), " Mexico, Sweden, Korea, Norway, Japan, Russia, Chile, Bulgaria, South Africa, Iceland."), /*#__PURE__*/React.createElement("p", {
    style: {
      marginBottom: 0
    }
  }, /*#__PURE__*/React.createElement("strong", null, "China"), " actual EV sales 2024: 11.3M, expected from OLS: 2.87M, gap: ", /*#__PURE__*/React.createElement("strong", {
    style: { color: 'var(--success, #06A77D)' }
  }, "+8.43M"), ". \u00A0", /*#__PURE__*/React.createElement("strong", null, "UK"), " actual: 550K, expected: 120K, gap: ", /*#__PURE__*/React.createElement("strong", {
    style: { color: 'var(--success, #06A77D)' }
  }, "+430K"), ". \u00A0", /*#__PURE__*/React.createElement("strong", null, "Japan"), " actual: 103K, expected: 970K, gap: ", /*#__PURE__*/React.createElement("strong", {
    style: { color: 'var(--danger, #D00000)' }
  }, "\u2212867K"), ".")), /*#__PURE__*/React.createElement("div", {
    className: "section-divider",
    style: {
      marginTop: 28
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "section-divider-label"
  }, "Time-series view"), /*#__PURE__*/React.createElement("span", {
    className: "section-divider-meta"
  }, "single country (China) \xB7 2010-2024 \xB7 Granger test cross-reference")), /*#__PURE__*/React.createElement("div", {
    className: "grid-stack"
  }, /*#__PURE__*/React.createElement(ChartCard, {
    title: "China \xB7 urbanization and EV sales share, 2010-2024",
    sub: "Both lines rise, but the EV sales share curve hockey-sticks around 2020 while urbanization climbs near-linearly. The two are co-moving, not synchronously. The Infrastructure tab's Granger test (no detectable lead at any lag) confirms this visual reading.",
    mount: mountChinaDual,
    callout: /*#__PURE__*/React.createElement(React.Fragment, null, "China's urban share went from 49% \u2192 67%; its EV sales share went from ", /*#__PURE__*/React.createElement("strong", null, "0.01% \u2192 48%"), ". Adoption accelerated ", /*#__PURE__*/React.createElement("em", null, "after"), " urbanization had already plateaued in growth rate.")
  })), /*#__PURE__*/React.createElement("details", {
    id: "methodology",
    className: "ml-notes methodology-box",
    open: true
  }, /*#__PURE__*/React.createElement("summary", null, /*#__PURE__*/React.createElement("span", {
    className: "ml-notes-tag"
  }, "Methodology"), /*#__PURE__*/React.createElement("span", {
    className: "methodology-close"
  }, "open / close")), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("div", {
    style: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: 8,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip teal"
  }, "IEA Global EV Outlook 2025 \xB7 2010-2024"), /*#__PURE__*/React.createElement("span", {
    className: "chip amber"
  }, "Country, development group, EV type, and year filters"), /*#__PURE__*/React.createElement("span", {
    className: "chip slate"
  }, "OLS, adoption gap, and Granger cross-check")), /*#__PURE__*/React.createElement("p", null, "This dashboard combines IEA Global EV Outlook 2025 series with cleaned socioeconomic, energy, emissions, and fuel-price indicators. Country-level charts apply the selected country and development-group filters directly; global trend charts keep the world aggregate unless a comparable country series is available. Shares, stocks, chargers, and sales are shown in their original reported units, while bubble areas use square-root scaling so large markets remain readable without hiding smaller markets."), /*#__PURE__*/React.createElement("p", null, "The modeling section is descriptive, not causal proof. The pooled OLS uses 651 country-year observations with log(EV sales) as the target (R\xB2 = 0.696, all p < 0.001). The adoption gap is the residual between a country's actual EV sales and the OLS-expected value; a positive gap means a country sells more EVs than its fundamentals predict. The China Granger test is included as a time-series check: it asks whether past urbanization improves forecasts of EV adoption, and it does not find a statistically useful lead at the tested lags. Results should be read as associations, not policy counterfactuals.")))));
}
// =====================================================================
// Footer
// =====================================================================
function Footer({
  onMethodology
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "footer"
  }, /*#__PURE__*/React.createElement("div", {
    className: "container"
  }, /*#__PURE__*/React.createElement("div", {
    className: "footer-inner"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Data sources"), /*#__PURE__*/React.createElement("div", {
    className: "source"
  }, /*#__PURE__*/React.createElement("strong", null, "IEA Global EV Outlook 2025"), /*#__PURE__*/React.createElement("br", null), "External: population, urbanization, gas price & emissions", /*#__PURE__*/React.createElement("br", null), /*#__PURE__*/React.createElement("span", {
    style: {
      color: 'var(--muted)'
    }
  }, "14,962 rows \xD7 10 cols \xB7 2010-2024 + 2030 STEPS"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Resources"), /*#__PURE__*/React.createElement("div", {
    className: "links"
  }, /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/mei-glow/data-visualization-shiny",
    target: "_blank",
    rel: "noreferrer"
  }, "GitHub repo"), /*#__PURE__*/React.createElement("a", {
    href: "#methodology",
    onClick: onMethodology
  }, "Methodology \xB7 ML / Causality"), /*#__PURE__*/React.createElement("a", {
    href: "https://github.com/mei-glow/data-visualization-shiny/tree/main/data",
    target: "_blank",
    rel: "noreferrer"
  }, "Download raw data"))), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("h5", null, "Team"), /*#__PURE__*/React.createElement("div", {
    className: "credits-list"
  }, /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "Pham Quynh Trang"), " \xB7 Lead, UI / UX"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "Nguyen Thi Bao Tien"), " \xB7 Data pipeline"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "Tran Phuong Mai"), " \xB7 Dashboard build"), /*#__PURE__*/React.createElement("div", null, /*#__PURE__*/React.createElement("b", null, "Nguyen Khanh Ngoc"), " \xB7 ML & forecasting"))))));
}
function MethodologyModal({
  onClose
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "method-modal",
    role: "dialog",
    "aria-modal": "true",
    "aria-labelledby": "method-title"
  }, /*#__PURE__*/React.createElement("div", {
    className: "method-modal-backdrop",
    onClick: onClose
  }), /*#__PURE__*/React.createElement("div", {
    className: "method-modal-panel"
  }, /*#__PURE__*/React.createElement("button", {
    className: "method-modal-close",
    onClick: onClose,
    "aria-label": "Close methodology"
  }, "\xD7"), /*#__PURE__*/React.createElement("div", {
    className: "ml-notes-tag"
  }, "Methodology"), /*#__PURE__*/React.createElement("h3", {
    id: "method-title"
  }, "How this dashboard was built"), /*#__PURE__*/React.createElement("div", {
    className: "chips",
    style: {
      marginTop: 8,
      marginBottom: 14
    }
  }, /*#__PURE__*/React.createElement("span", {
    className: "chip teal"
  }, "IEA Global EV Outlook 2025 \xB7 2010-2024"), /*#__PURE__*/React.createElement("span", {
    className: "chip amber"
  }, "Country, development group, EV type, and year filters"), /*#__PURE__*/React.createElement("span", {
    className: "chip slate"
  }, "OLS, adoption gap, and Granger cross-check")), /*#__PURE__*/React.createElement("p", null, "This dashboard combines IEA Global EV Outlook 2025 series with cleaned socioeconomic, energy, emissions, and fuel-price indicators. Country-level charts apply the selected country and development-group filters directly; global trend charts keep the world aggregate unless a comparable country series is available."), /*#__PURE__*/React.createElement("p", null, "Shares, stocks, chargers, and sales are shown in their original reported units. Bubble areas use square-root scaling so large markets remain readable without hiding smaller markets. Model outputs are descriptive: the OLS, EV adoption gap, and Granger tests should be read as associations, not policy counterfactuals.")));
}

// =====================================================================
// Top chrome - brand + nav
// =====================================================================
function TopBar() {
  return /*#__PURE__*/React.createElement("div", {
    className: "brandbar"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brandbar-inner"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand"
  }, /*#__PURE__*/React.createElement("div", {
    className: "brand-mark"
  }, "ev"), /*#__PURE__*/React.createElement("div", {
    className: "brand-title"
  }, "E-Mobility Global Transition", /*#__PURE__*/React.createElement("span", {
    className: "sep"
  }, "\xB7"), /*#__PURE__*/React.createElement("span", {
    className: "sub"
  }, "IEA Global EV Outlook 2025"))), /*#__PURE__*/React.createElement("div", {
    className: "brand-meta"
  }, /*#__PURE__*/React.createElement("span", null, "2010-2024 historical \xB7 2030 STEPS"))));
}
function TabNav({
  active,
  onChange
}) {
  return /*#__PURE__*/React.createElement("div", {
    className: "tabnav"
  }, /*#__PURE__*/React.createElement("div", {
    className: "tabs",
    role: "tablist"
  }, TABS.map(t => /*#__PURE__*/React.createElement("button", {
    key: t.id,
    role: "tab",
    "aria-selected": active === t.id,
    className: "tab " + (active === t.id ? 'active' : ''),
    onClick: () => onChange(t.id)
  }, /*#__PURE__*/React.createElement("span", {
    className: "tab-ico"
  }, t.icon({})), /*#__PURE__*/React.createElement("span", null, t.label)))));
}

// =====================================================================
// App
// =====================================================================
function App() {
  const [tab, setTab] = useState(0);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [methodologyOpen, setMethodologyOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(true);
  const [navDocked, setNavDocked] = useState(false);
  useEffect(() => {
    if (window.location.hash === '#methodology') {
      setTab(5);
      return;
    }
    const m = /^#tab=(\d)/.exec(window.location.hash);
    if (m) {
      const i = parseInt(m[1], 10);
      if (i >= 0 && i < TABS.length) setTab(i);
    }
  }, []);
  useEffect(() => {
    history.replaceState(null, '', '#tab=' + tab);
  }, [tab]);
  useEffect(() => {
    window.__DASH_FILTERS__ = filters;
    window.dispatchEvent(new CustomEvent('dashboard-filter-change', {
      detail: filters
    }));
  }, [filters]);
  useEffect(() => {
    const syncDocked = () => setNavDocked(window.scrollY > 54);
    syncDocked();
    window.addEventListener('scroll', syncDocked, {
      passive: true
    });
    return () => window.removeEventListener('scroll', syncDocked);
  }, []);
  useEffect(() => {
    const handleCountry = event => {
      const country = event && event.detail && event.detail.country;
      if (country) setFilters(f => ({
        ...f,
        country
      }));
    };
    window.addEventListener('dashboard-set-country', handleCountry);
    return () => window.removeEventListener('dashboard-set-country', handleCountry);
  }, []);
  const ctx = useMemo(() => ({
    state: filters,
    set: patch => setFilters(f => ({
      ...f,
      ...patch
    })),
    reset: () => setFilters(DEFAULT_FILTERS)
  }), [filters]);
  const openMethodology = event => {
    event.preventDefault();
    setMethodologyOpen(true);
  };
  return /*#__PURE__*/React.createElement(FilterCtx.Provider, {
    value: ctx
  }, /*#__PURE__*/React.createElement("div", {
    className: (filterOpen ? 'dashboard-shell filter-open' : 'dashboard-shell filter-closed') + (navDocked ? ' nav-docked' : '')
  }, /*#__PURE__*/React.createElement(TopBar, null), /*#__PURE__*/React.createElement(TabNav, {
    active: tab,
    onChange: setTab
  }), /*#__PURE__*/React.createElement(FilterPanel, {
    open: filterOpen,
    onToggle: () => setFilterOpen(v => !v)
  }), /*#__PURE__*/React.createElement(FilterStatusBar, null), /*#__PURE__*/React.createElement("div", {
    "data-screen-label": String(tab).padStart(2, '0') + ' ' + TABS[tab].label
  }, tab === 0 && /*#__PURE__*/React.createElement(TabOverview, null), tab === 1 && /*#__PURE__*/React.createElement(TabAdoption, null), tab === 2 && /*#__PURE__*/React.createElement(TabInfra, null), tab === 3 && /*#__PURE__*/React.createElement(TabMarket, null), tab === 4 && /*#__PURE__*/React.createElement(TabSocio, null), tab === 5 && /*#__PURE__*/React.createElement(TabML, null)), /*#__PURE__*/React.createElement(Footer, {
    onMethodology: openMethodology
  })), methodologyOpen && /*#__PURE__*/React.createElement(MethodologyModal, {
    onClose: () => setMethodologyOpen(false)
  }));
}

// Expose so print-app.jsx (loaded after) can override the render with an all-tabs stack
Object.assign(window, {
  App,
  TopBar,
  Footer,
  TABS,
  TabOverview,
  TabAdoption,
  TabInfra,
  TabMarket,
  TabSocio,
  TabML
});
if (!window.__SKIP_DEFAULT_RENDER__) {
  ReactDOM.createRoot(document.getElementById('root')).render(/*#__PURE__*/React.createElement(App, null));
}
