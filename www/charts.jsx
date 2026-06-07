// =====================================================================
// Plotly chart builders. Each `mountX(el)` clears and renders into el.
// =====================================================================

const FONT_FAMILY = 'Inter, Helvetica, Arial, sans-serif';
const FONT_MONO   = '"JetBrains Mono", ui-monospace, Menlo, monospace';
const AXIS_TITLE_FONT = { color: '#0F172A', size: 11 };

function fNormalizeAxis(axis = {}) {
  const out = { ...axis };
  if (typeof out.title === 'string') {
    out.title = { text: out.title, font: { ...AXIS_TITLE_FONT, ...(out.titlefont || {}), size: 11 } };
  } else if (out.title || out.titlefont) {
    const title = out.title || {};
    out.title = {
      ...title,
      font: { ...AXIS_TITLE_FONT, ...(out.titlefont || {}), ...(title.font || {}), size: 11 },
    };
  }
  delete out.titlefont;
  return out;
}

const baseLayout = (overrides = {}) => {
  const layout = {
    paper_bgcolor: '#FFFFFF',
    plot_bgcolor:  '#FFFFFF',
    font: { family: FONT_FAMILY, size: 13, color: '#334155' },
    margin: { l: 64, r: 28, t: 20, b: 56 },
    hoverlabel: {
      bgcolor: '#FFFFFF',
      bordercolor: '#E2E8F0',
      font: { family: FONT_FAMILY, color: '#0F172A', size: 12 },
    },
    xaxis: {
      gridcolor: '#EEF2F6', zerolinecolor: '#E2E8F0',
      tickfont: { color: '#475569', size: 11 },
      title: { font: { ...AXIS_TITLE_FONT } },
      linecolor: '#E2E8F0',
    },
    yaxis: {
      gridcolor: '#EEF2F6', zerolinecolor: '#E2E8F0',
      tickfont: { color: '#475569', size: 11 },
      title: { font: { ...AXIS_TITLE_FONT } },
      linecolor: '#E2E8F0',
    },
    legend: { font: { size: 12, color: '#334155' } },
    ...overrides,
  };
  ['xaxis','xaxis2','xaxis3','xaxis4','xaxis5','xaxis6','yaxis','yaxis2','yaxis3','yaxis4','yaxis5','yaxis6']
    .forEach(k => { if (layout[k]) layout[k] = fNormalizeAxis(layout[k]); });
  return layout;
};

// Toolbar disabled everywhere for visual consistency - our chart-action buttons in the header
// provide download/copy/fullscreen. This keeps the canvas clean across all charts.
const PLOT_CONFIG = {
  displaylogo: false,
  responsive: true,
  displayModeBar: false,
  staticPlot: false,
};

const fmt = {
  intCommas: n => Math.round(n).toLocaleString('en-US'),
  oneDec: n => n.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 }),
};

// ============================================================
// Filter helpers - every mount receives a filters object:
//   { yearMin, yearMax, country, income, ev }
// These utilities apply consistent slicing / highlighting.
// ============================================================

function fSliceYears(filters) {
  const yMin = filters && filters.yearMin ? filters.yearMin : YEARS[0];
  const yMax = filters && filters.yearMax ? filters.yearMax : YEARS[YEARS.length - 1];
  const idxStart = Math.max(0, YEARS.indexOf(yMin));
  const idxEnd   = Math.min(YEARS.length - 1, YEARS.indexOf(yMax));
  return {
    years: YEARS.slice(idxStart, idxEnd + 1),
    slice: arr => arr.slice(idxStart, idxEnd + 1),
    idxStart, idxEnd, yMin, yMax,
  };
}

function fIncomeKeep(filters, tier) {
  if (!filters || !filters.income || filters.income === "ALL") return true;
  return filters.income === tier;
}

const COUNTRY_ALIASES = {
  'united states': 'usa',
  'u.s.': 'usa',
  'u.s.a.': 'usa',
  'us': 'usa',
  'uk': 'united kingdom',
  'great britain': 'united kingdom',
  'south korea': 'korea',
  'republic of korea': 'korea',
  'turkey': 'turkiye',
  'türkiye': 'turkiye',
};

const fNormCountry = (country) => {
  const key = String(country || '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return COUNTRY_ALIASES[key] || key;
};
const COUNTRY_GEO_LABELS = {
  China: [35.9, 104.2], Norway: [61.0, 8.5], Sweden: [62.0, 15.0], Denmark: [56.2, 10.0],
  Finland: [64.0, 26.0], Netherlands: [52.1, 5.3], Belgium: [50.8, 4.5], Switzerland: [46.8, 8.2],
  'United Kingdom': [54.5, -2.5], France: [46.2, 2.2], Germany: [51.0, 10.4], Austria: [47.6, 14.0],
  Canada: [56.1, -106.3], 'Costa Rica': [9.7, -84.0], Thailand: [15.9, 101.0], Australia: [-25.3, 133.8],
  Spain: [40.4, -3.7], 'Türkiye': [39.0, 35.2], 'United States': [39.8, -98.6], USA: [39.8, -98.6],
  Korea: [36.3, 127.8], Italy: [42.8, 12.5], Indonesia: [-2.5, 118.0], Brazil: [-10.3, -53.2],
  Ukraine: [49.0, 31.4], Mexico: [23.6, -102.5], Japan: [36.2, 138.3], India: [22.9, 78.7],
  Philippines: [12.9, 121.8],
};

const fCountryMatches = (filters, country) => {
  if (!filters || !filters.country || filters.country === 'ALL') return true;
  return fNormCountry(filters.country) === fNormCountry(country);
};

const COUNTRY_INCOME_TIER = (() => {
  const out = {};
  if (typeof SOCIO_2024 !== 'undefined') {
    SOCIO_2024.forEach(r => { out[fNormCountry(r.country)] = r.income; });
  }
  return out;
})();

function fCountryIncome(filters, country) {
  if (!filters || !filters.income || filters.income === 'ALL') return true;
  return COUNTRY_INCOME_TIER[fNormCountry(country)] === filters.income;
}

function fCountryKeep(filters, country) {
  return fCountryMatches(filters, country) && fCountryIncome(filters, country);
}

function fCurrentFilters(filters) {
  return filters || window.__DASH_FILTERS__ || {};
}

function fHasMarketFilter(filters) {
  return !!(filters && ((filters.country && filters.country !== 'ALL') || (filters.income && filters.income !== 'ALL')));
}

function fCountryKey(country, source = COUNTRY_STOCK_M) {
  return Object.keys(source || {}).find(c => fNormCountry(c) === fNormCountry(country));
}

function fSelectedCountryKeys(filters) {
  return Object.keys(COUNTRY_STOCK_M)
    .filter(c => c !== 'Rest of the world' && fCountryKeep(filters, c));
}

function fSumStockSeries(countries) {
  return YEARS.map((_, i) => countries.reduce((sum, c) => sum + ((COUNTRY_STOCK_M[c] && COUNTRY_STOCK_M[c][i]) || 0), 0));
}

function fStockSeriesForFilters(filters) {
  if (!fHasMarketFilter(filters)) return { label: 'World', series: WORLD_EV_STOCK_M, isWorld: true };
  if (filters && filters.country && filters.country !== 'ALL') {
    const key = fCountryKey(filters.country, COUNTRY_STOCK_M);
    if (key && fCountryIncome(filters, key)) return { label: key, series: COUNTRY_STOCK_M[key], isWorld: false };
    return null;
  }
  const countries = fSelectedCountryKeys(filters);
  if (!countries.length) return null;
  return { label: filters.income + ' income countries', series: fSumStockSeries(countries), isWorld: false };
}

function fSalesShareSeriesForFilters(filters) {
  if (!fHasMarketFilter(filters)) return { label: 'World', series: WORLD_SALES_SHARE, isWorld: true };
  if (filters && filters.country && filters.country !== 'ALL') {
    const regionKey = fCountryKey(filters.country, REGION_BY_PT);
    if (!regionKey || !fCountryIncome(filters, regionKey)) return null;
    const d = REGION_BY_PT[regionKey];
    return {
      label: regionKey,
      series: YEARS.map(y => {
        const i = d.years.indexOf(y);
        return i >= 0 ? d.salesShare[i] : null;
      }),
      isWorld: false,
    };
  }
  return null;
}

function fPowertrainSeriesForFilters(filters) {
  if (!fHasMarketFilter(filters)) {
    return { label: 'World', data: WORLD_STOCK_BY_POWERTRAIN, projection: STEPS_STOCK_BY_POWERTRAIN_2030, isWorld: true };
  }
  if (filters && filters.country && filters.country !== 'ALL') {
    const regionKey = fCountryKey(filters.country, REGION_BY_PT);
    if (!regionKey || !fCountryIncome(filters, regionKey)) return null;
    const d = REGION_BY_PT[regionKey];
    return {
      label: regionKey,
      data: {
        BEV: YEARS.map(y => { const i = d.years.indexOf(y); return i >= 0 ? d.BEV[i] : null; }),
        PHEV: YEARS.map(y => { const i = d.years.indexOf(y); return i >= 0 ? d.PHEV[i] : null; }),
        FCEV: YEARS.map(y => { const i = d.years.indexOf(y); return i >= 0 ? d.FCEV[i] : null; }),
      },
      projection: null,
      isWorld: false,
    };
  }
  return null;
}

function fCountryOpacity(filters, country, baseOn = 0.85, baseOff = 0.18) {
  return fCountryKeep(filters, country) ? baseOn : baseOff;
}

function fEvKeep(filters, pt) {
  if (!filters || !filters.ev || filters.ev === "ALL") return true;
  return filters.ev === pt;
}

// Banner appended to a chart subtitle area is *not* available; instead we add a
// title-area note via baseLayout annotations when filters are active.
function fActiveNote(filters) {
  if (!filters) return null;
  const bits = [];
  const yMin = filters.yearMin, yMax = filters.yearMax;
  if (yMin && yMax && (yMin > YEARS[0] || yMax < YEARS[YEARS.length-1])) bits.push(yMin + "-" + yMax);
  if (filters.country && filters.country !== "ALL") bits.push("focus: " + filters.country);
  if (filters.income && filters.income !== "ALL") bits.push("tier: " + filters.income);
  if (filters.ev && filters.ev !== "ALL") bits.push("powertrain: " + filters.ev);
  return bits.length ? bits.join("  ·  ") : null;
}



// ---------------------------------------------------------------------
// Chart 0.A - EV Car Fleet & Sales Share (combined bars + scatter)
// ---------------------------------------------------------------------
function mountFleetSalesShare(el, filters) {
  // Year-range filter clips historical bars + scatter; the 2030 projection is left alone
  // because it's an external scenario value, not a slice of our series.
  const f = fSliceYears(filters);
  const stockInfo = fStockSeriesForFilters(filters);
  const shareInfo = fSalesShareSeriesForFilters(filters);
  if (!stockInfo) {
    Plotly.newPlot(el, [], baseLayout({
      height: 420,
      annotations: [{
        xref: 'paper', yref: 'paper', x: 0.5, y: 0.5, showarrow: false,
        text: 'No EV stock series for selected Overview filter.',
        font: { size: 13, color: '#64748B', family: FONT_FAMILY },
      }],
    }), PLOT_CONFIG);
    return;
  }
  const histYears = f.years;
  const lastYr = histYears[histYears.length - 1];
  const showProjection = stockInfo.isWorld;
  const allYears  = showProjection ? [...histYears, 2030] : histYears;
  const stockHist = f.slice(stockInfo.series);
  const stockProj = 232.2;
  const shareHist = shareInfo ? f.slice(shareInfo.series) : null;
  const shareProj = 42;

  const xCats = allYears.map(String);

  const bars = {
    type: 'bar', name: stockInfo.label + ' EV stock',
    x: histYears.map(String), y: stockHist,
    marker: { color: '#5AB9B5', opacity: 0.9, line: { width: 0 } },
    yaxis: 'y',
    text: stockHist.map(v => v >= 1 ? v.toFixed(1) : v.toFixed(2)),
    textposition: 'outside',
    textfont: { color: '#0F172A', size: 11, family: FONT_MONO },
    cliponaxis: false,
    hovertemplate: '<b>%{x}</b><br>' + stockInfo.label + ' EV stock: %{y:.2f} M<extra></extra>',
  };
  const projBar = {
    type: 'bar', name: 'EV car stock (2030 proj.)',
    x: ['2030'], y: [stockProj],
    marker: { color: '#5AB9B5', opacity: 0.42, line: { width: 1.5, color: '#2A9D8F' } },
    yaxis: 'y',
    text: [stockProj.toFixed(1)],
    textposition: 'outside',
    textfont: { color: PALETTE.primary, size: 12, family: FONT_MONO },
    cliponaxis: false,
    hovertemplate: '<b>2030 (STEPS)</b><br>EV stock: %{y:.1f} M<extra></extra>',
  };
  let share = null, shareBridge = null, shareProjPt = null;
  if (shareInfo && shareHist) {
    // Sales-share scatter - bigger, outlined markers so they read against white.
    share = {
      type: 'scatter', mode: 'lines+markers', name: shareInfo.label + ' sales share',
      x: histYears.map(String), y: shareHist,
      line: { color: PALETTE.warning, width: 2 },
      marker: { color: '#FFFFFF', size: 8, line: { color: PALETTE.warning, width: 2 } },
      yaxis: 'y2',
      hovertemplate: '<b>%{x}</b><br>Sales share: %{y:.1f}%<extra></extra>',
    };
    if (showProjection) {
      shareBridge = {
        type: 'scatter', mode: 'lines', name: '2030 projection',
        x: [String(lastYr),'2030'], y: [shareHist[shareHist.length-1], shareProj],
        line: { color: PALETTE.warning, width: 2, dash: 'dash' },
        yaxis: 'y2', showlegend: false, hoverinfo: 'skip',
      };
      shareProjPt = {
        type: 'scatter', mode: 'markers', name: 'EV sales share (2030 proj.)',
        x: ['2030'], y: [shareProj],
        marker: { color: '#fff', size: 18, symbol: 'diamond', line: { color: PALETTE.warning, width: 2.5 } },
        yaxis: 'y2',
        hovertemplate: '<b>2030 (STEPS)</b><br>Sales share: %{y:.0f}%<extra></extra>',
      };
    }
  }

  const layout = baseLayout({
    height: 420,
    margin: { l: 56, r: 82, t: 30, b: 74 },
    barmode: 'group', bargap: 0.18,
    xaxis: {
      type: 'category', categoryorder: 'array', categoryarray: xCats,
      tickangle: -45, gridcolor: 'transparent',
      tickfont: { color: '#64748B', size: 11 },
      linecolor: '#E2E8F0',
    },
    yaxis: {
      title: { text: 'EV cars on the road (millions)', standoff: 8 },
      range: [0, Math.max(...stockHist.filter(Number.isFinite), showProjection ? stockProj : 0.1) * 1.18],
      gridcolor: '#EEF2F6', linecolor: '#E2E8F0',
      tickfont: { color: '#64748B', size: 11 },
    },
    yaxis2: {
      title: { text: 'Share of new car sales (%)', standoff: 4 },
      overlaying: 'y', side: 'right',
      range: [0, 80], dtick: 20,
      gridcolor: 'transparent', linecolor: '#E2E8F0',
      tickfont: { color: '#64748B', size: 11 },
    },
    legend: {
      orientation: 'h', yanchor: 'top', y: 1.16, x: 0, xanchor: 'left',
      font: { size: 11 }, bgcolor: 'rgba(0,0,0,0)',
    },
    shapes: showProjection ? [
      {
        type: 'rect', xref: 'x', yref: 'paper',
        x0: 14.5, x1: 15.5, y0: 0, y1: 1,
        fillcolor: 'rgba(11,122,117,0.06)', line: { width: 0 },
      },
      {
        type: 'line', xref: 'x', yref: 'paper',
        x0: 14.5, x1: 14.5, y0: 0, y1: 1,
        line: { dash: 'dot', width: 1, color: '#94A3B8' },
      },
    ] : [],
    annotations: showProjection ? [{
      x: 14.5, y: 1.0, xref: 'x', yref: 'paper',
      text: 'STEPS 2030 →', showarrow: false,
      font: { size: 11, color: '#475569', family: FONT_MONO },
      bgcolor: 'rgba(255,255,255,0.95)', borderpad: 3,
      xanchor: 'left', yanchor: 'top', xshift: 4,
    }] : [{
      x: 0, y: 1.08, xref: 'paper', yref: 'paper', xanchor: 'left',
      text: shareInfo ? 'Overview filtered to ' + stockInfo.label + '.' : 'Overview stock filtered to ' + stockInfo.label + '; sales-share series is not available for this filter.',
      showarrow: false, font: { size: 11, color: '#64748B', family: FONT_FAMILY },
    }],
  });

  // Stock bridge - dashed connector + shaded projection-zone band so 2030 reads as part of the series.
  // 2024→2030 bridge - connects the last visible historical bar to the 2030 projection.
  const stockBridge = {
    type: 'scatter', mode: 'lines', name: '2030 stock projection',
    x: [String(lastYr),'2030'], y: [stockHist[stockHist.length-1], stockProj],
    line: { color: PALETTE.primary, width: 2, dash: 'dash' },
    yaxis: 'y', showlegend: false, hoverinfo: 'skip',
  };
  const traces = [bars];
  if (showProjection) traces.push(stockBridge, projBar);
  if (shareInfo) {
    traces.push(share);
    if (showProjection) traces.push(shareBridge, shareProjPt);
  }
  Plotly.newPlot(el, traces, layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// Chart 0.B - World EV Car Stock by Powertrain (stacked area)
// ---------------------------------------------------------------------
function mountStockByPowertrain(el, filters) {
  const f = fSliceYears(filters);
  const ptInfo = fPowertrainSeriesForFilters(filters);
  if (!ptInfo) {
    Plotly.newPlot(el, [], baseLayout({
      height: 380,
      annotations: [{
        xref: 'paper', yref: 'paper', x: 0.5, y: 0.5, showarrow: false,
        text: 'No powertrain split available for selected Overview filter.',
        font: { size: 13, color: '#64748B', family: FONT_FAMILY },
      }],
    }), PLOT_CONFIG);
    return;
  }
  const xs = ptInfo.projection ? [...f.years, 2030] : f.years;
  const proj = ptInfo.projection;
  // Dim non-matching powertrains when the EV-type filter is set so the user can isolate one stream.
  const ptOpacity = (pt) => fEvKeep(filters, pt) ? 0.92 : 0.18;
  const series = ['FCEV','PHEV','BEV'].map(pt => ({
    type: 'scatter', mode: 'lines', stackgroup: 'one',
    name: pt,
    x: xs,
    y: [...f.slice(ptInfo.data[pt]).map(v => v === null ? null : v * 1e6), ...(proj ? [proj[pt] * 1e6] : [])],
    line: { width: 0.5, color: pt==='BEV'?PALETTE.bev: pt==='PHEV'?PALETTE.phev: PALETTE.fcev },
    fillcolor: pt==='BEV'?'rgba(38,70,83,' + ptOpacity('BEV') + ')':
               pt==='PHEV'?'rgba(231,111,81,' + ptOpacity('PHEV') + ')':
                           'rgba(156,137,184,' + ptOpacity('FCEV') + ')',
    hovertemplate: '<b>'+pt+'</b><br>Year: %{x}<br>EV stock: %{y:,.0f}<extra></extra>',
  }));
  // Annotate the latest visible year (depends on year filter)
  const idx2024 = f.idxEnd;
  const bev24 = ptInfo.data.BEV[idx2024];
  const phev24 = ptInfo.data.PHEV[idx2024];
  const fcev24 = ptInfo.data.FCEV[idx2024];
  const total24 = bev24 + phev24 + fcev24;
  const hasLatest = Number.isFinite(total24) && total24 > 0;
  const layout = baseLayout({
    height: 380,
    margin: { l: 70, r: 36, t: 30, b: 74 },
    // Skip every other year on the X-axis to prevent crowding (only 15 ticks crowded at 11px before)
    xaxis: { title: { text: 'Year', standoff: 18 }, tickmode: 'array', tickvals: xs.filter((_,i) => i % 2 === 0).concat([2030]), tickfont: { size: 11 }, gridcolor: '#EEF2F6' },
    yaxis: { title: 'EV stock (vehicles)', gridcolor: '#EEF2F6', tickformat: '~s' },
    hovermode: 'x unified',
    legend: { orientation: 'h', x: 0, y: 1.14, xanchor: 'left', font: { size: 13 } },
    shapes: proj ? [{
      type: 'line', xref: 'x', yref: 'paper',
      x0: 2027, x1: 2027, y0: 0, y1: 1,
      line: { dash: 'dot', width: 1, color: '#94A3B8' },
    }] : [],
    annotations: [
      // Latest-visible-year marker - moves with the year-range filter
      ...(hasLatest ? [{
        x: YEARS[idx2024], y: total24 * 1e6, ax: 0, ay: -70,
        text: '<b>' + YEARS[idx2024] + '</b><br>BEV ' + Math.round(bev24/total24*100) + '% · PHEV ' + Math.round(phev24/total24*100) + '% · FCEV <1%',
        font: { size: 11, color: '#0F172A', family: FONT_FAMILY },
        bgcolor: 'rgba(255,255,255,0.97)', bordercolor: PALETTE.bev, borderwidth: 1.2, borderpad: 5,
        arrowhead: 2, arrowsize: 1, arrowwidth: 1, arrowcolor: PALETTE.bev,
      }] : []),
      ...(proj ? [{
        x: 2027, y: 1.02, xref: 'x', yref: 'paper', text: 'historical | STEPS', showarrow: false,
        font: { size: 10, color: '#94A3B8', family: FONT_MONO },
        bgcolor: 'rgba(255,255,255,0.85)', xanchor: 'center', borderpad: 2,
      }] : [{
        x: 0, y: 1.08, xref: 'paper', yref: 'paper', xanchor: 'left',
        text: 'Powertrain split filtered to ' + ptInfo.label + '.',
        showarrow: false, font: { size: 11, color: '#64748B', family: FONT_FAMILY },
      }]),
    ],
  });
  Plotly.newPlot(el, series, layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// Chart 0.C - World Charging Points by Type (stacked bars)
// ---------------------------------------------------------------------
function mountChargersWorld(el, filters) {
  const f = fSliceYears(filters);
  const xs = [...f.years, 2030].map(String);
  const slow = [...f.slice(WORLD_CHARGERS.Slow), STEPS_CHARGERS_2030.Slow];
  const fast = [...f.slice(WORLD_CHARGERS.Fast), STEPS_CHARGERS_2030.Fast];
  // Format as "x.xM" or "xxxk", horizontal, suppressed for very small bars.
  // Slow recoloured to amber so it doesn't clash with the BEV powertrain palette next to it.
  const SLOW_AMBER = '#F4A261';
  const fmtLabel = (vM) => {
    if (vM < 0.05) return '';
    if (vM >= 1)   return vM.toFixed(1) + 'M';
    return Math.round(vM * 1000) + 'k';
  };
  const traces = [
    { type:'bar', name:'Slow Charger (Level 1/2 AC)', x: xs, y: slow.map(v => v*1e6),
      marker: { color: SLOW_AMBER },
      text: slow.map(fmtLabel),
      textposition: 'inside', insidetextanchor: 'middle', textangle: 0,
      textfont: { color: '#5A2E0E', size: 12, family: FONT_MONO },
      hovertemplate: '<b>Slow Charger</b><br>%{x}: %{y:,.0f}<extra></extra>' },
    { type:'bar', name:'Fast Charger (DC)', x: xs, y: fast.map(v => v*1e6),
      marker: { color: PALETTE.fast },
      text: fast.map(fmtLabel),
      textposition: 'inside', insidetextanchor: 'middle', textangle: 0,
      textfont: { color: '#fff', size: 12, family: FONT_MONO },
      hovertemplate: '<b>Fast Charger</b><br>%{x}: %{y:,.0f}<extra></extra>' },
  ];
  const layout = baseLayout({
    barmode: 'stack', height: 380,
    margin: { l: 72, r: 24, t: 36, b: 70 },
    xaxis: { type: 'category', tickangle: -45 },
    yaxis: {
      title: 'Charging points (millions)',
      tickformat: '~s', gridcolor: '#EEF2F6',
    },
    legend: { orientation: 'h', x: 0, y: 1.14, xanchor: 'left', font: { size: 13 } },
    annotations: fHasMarketFilter(filters) ? [{
      x: 0, y: 1.08, xref: 'paper', yref: 'paper', xanchor: 'left',
      text: 'Country/development filter not applied: this chart only has world charger history.',
      showarrow: false, font: { size: 11, color: '#64748B', family: FONT_FAMILY },
    }] : [],
  });
  Plotly.newPlot(el, traces, layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// Chart 0.D - Three pies (BEV/PHEV/FCEV mode mix, 2024)
// ---------------------------------------------------------------------
function mountModeMixPies(el, filters) {
  // EV type filter: dim non-matching donuts to a faint state so the focus is obvious
  const ev = (filters && filters.ev && filters.ev !== 'ALL') ? filters.ev : null;
  const set3 = ['#8DD3C7','#FB8072','#BEBADA'];
  const modes = ['2 and 3 wheelers','Cars','Other (Trucks, Buses, Vans)'];
  // Explicit symmetric domains to avoid the grid-engine offset bug
  const slots = [
    { x: [0.02, 0.32], cx: 0.17 },
    { x: [0.35, 0.65], cx: 0.50 },
    { x: [0.68, 0.98], cx: 0.83 },
  ];
  const yDom = [0.10, 0.92];
  // Fleet sizes (millions, cars+2w/3w+other) from 2024 totals
  // Using IEA 2024 totals: BEV ~39.5M cars + 12M 2/3w + 1M other ≈ 52.5M
  // PHEV ~18.3M (mostly cars). FCEV ~0.3M.
  const FLEET_M = { BEV: 52.5, PHEV: 18.3, FCEV: 0.3 };
  const FLEET_LABEL = pt => FLEET_M[pt] >= 1 ? FLEET_M[pt].toFixed(1) + ' M' : Math.round(FLEET_M[pt]*1000) + 'k';
  const data = ['BEV','PHEV','FCEV'].map((pt, i) => {
    const dim = ev && ev !== pt;
    return {
    type: 'pie',
    name: pt,
    labels: modes,
    values: modes.map(m => MODE_SHARE_2024[pt][m]),
    marker: {
      colors: dim ? ['#EEF2F6','#E2E8F0','#CBD5E1'] : set3,
      line: { color: '#fff', width: 2 },
    },
    domain: { x: slots[i].x, y: yDom },
    textposition: 'outside',
    textinfo: 'percent',
    outsidetextfont: { color: '#0F172A', size: 13 },
    automargin: false,
    hovertemplate: '<b>%{label}</b><br>%{percent}<extra>'+pt+'</extra>',
    hole: 0.5,
    sort: false,
    direction: 'clockwise',
    rotation: 0,
  };
  });
  // FCEV color darkened (#6B5B95) so it meets contrast on white background
  const FCEV_DARK = '#6B5B95';
  const layout = baseLayout({
    height: 400,
    margin: { l: 12, r: 12, t: 30, b: 56 },
    annotations: [
      // Powertrain label
      { text: '<b>BEV</b>',  x: slots[0].cx, y: 0.51, xref: 'paper', yref: 'paper', xanchor: 'center', yanchor: 'middle', align: 'center', showarrow: false, font: { size: 17, color: PALETTE.bev,  family: FONT_FAMILY } },
      { text: '<b>PHEV</b>', x: slots[1].cx, y: 0.51, xref: 'paper', yref: 'paper', xanchor: 'center', yanchor: 'middle', align: 'center', showarrow: false, font: { size: 17, color: PALETTE.phev, family: FONT_FAMILY } },
      { text: '<b>FCEV</b>', x: slots[2].cx, y: 0.51, xref: 'paper', yref: 'paper', xanchor: 'center', yanchor: 'middle', align: 'center', showarrow: false, font: { size: 17, color: FCEV_DARK,    family: FONT_FAMILY } },
      // Fleet size (gives volume context the user asked for)
      { text: FLEET_LABEL('BEV'),  x: slots[0].cx, y: 0.42, xref: 'paper', yref: 'paper', xanchor: 'center', yanchor: 'middle', align: 'center', showarrow: false, font: { size: 12, color: '#64748B', family: FONT_MONO } },
      { text: FLEET_LABEL('PHEV'), x: slots[1].cx, y: 0.42, xref: 'paper', yref: 'paper', xanchor: 'center', yanchor: 'middle', align: 'center', showarrow: false, font: { size: 12, color: '#64748B', family: FONT_MONO } },
      { text: FLEET_LABEL('FCEV'), x: slots[2].cx, y: 0.42, xref: 'paper', yref: 'paper', xanchor: 'center', yanchor: 'middle', align: 'center', showarrow: false, font: { size: 12, color: '#64748B', family: FONT_MONO } },
      // Top "reading" hint
      { text: 'fleet size (2024)',
        x: 0.5, y: 1.01, xref: 'paper', yref: 'paper', xanchor: 'center',
        showarrow: false, font: { size: 10, color: '#94A3B8', family: FONT_MONO },
      },
    ],
    legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.02, font: { size: 13 } },
    showlegend: true,
  });
  Plotly.newPlot(el, data, layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// Chart 1.A - EV Sales vs Stock by Country (bubble scatter, 2024)
// ---------------------------------------------------------------------
function mountSalesStockBubbles(el, filters) {
  const focus = (filters && filters.country && filters.country !== 'ALL') ? filters.country : null;
  // Big region aggs as a group
  const aggs = Object.entries(REGION_AGGS_2024);
  const aggRows = aggs.filter(([iso, r]) => fCountryKeep(filters, r.name));
  const aggTraces = aggRows.map(([iso, r]) => {
    // APAC is rendered as a dashed outline ring - it visually signals
    // "this is a superset that contains China + Japan + Korea + India + …"
    // so the China/APAC overlap is no longer ambiguous.
    const isSuperset = iso === 'APAC';
    return {
      type: 'scatter', mode: 'markers', name: r.name,
      x: [r.stock_M], y: [r.sales_M],
      marker: {
        size: Math.sqrt(r.stock_M) * 16 + 14,
        color: isSuperset ? 'rgba(0,0,0,0)' : r.color,
        opacity: fCountryKeep(filters, r.name) ? 0.82 : 0.14,
        line: { color: fCountryMatches(filters, r.name) ? '#0F172A' : (isSuperset ? r.color : '#fff'), width: fCountryMatches(filters, r.name) ? 2.5 : 2, dash: isSuperset ? 'dash' : 'solid' },
        sizemode: 'diameter',
      },
      hovertemplate: '<b>'+r.name+'</b><br>Code: '+iso+'<br>EV stock: %{x:.2f} M<br>EV sales: %{y:.2f} M<extra></extra>',
      legendgroup: 'aggregates', legendgrouptitle: { text: 'Aggregates' },
    };
  });

  // Countries
  const countryRows = COUNTRY_SMALL_2024.filter(c => fCountryKeep(filters, c.name));
  const cT = {
    type: 'scatter', mode: 'markers+text', name: 'Country',
    x: countryRows.map(c => c.stock_M),
    y: countryRows.map(c => c.sales_M),
    text: countryRows.map(c => focus ? c.name : ''),
    textposition: 'top center',
    textfont: { color: '#0F172A', size: 12, family: FONT_FAMILY, weight: 700 },
    customdata: countryRows.map(c => c.iso),
    marker: {
      size: countryRows.map(c => Math.sqrt(c.stock_M) * 26 + 9),
      color: countryRows.map(c => c.color),
      opacity: 0.85,
      line: {
        color: countryRows.map(c => fCountryMatches(filters, c.name) ? '#0F172A' : '#fff'),
        width: countryRows.map(c => fCountryMatches(filters, c.name) ? 2.5 : 1.5),
      },
      sizemode: 'diameter',
    },
    hovertemplate: '<b>%{text}</b><br>Code: %{customdata}<br>EV stock: %{x:.2f} M<br>EV sales: %{y:.2f} M<extra></extra>',
  };

  const layout = baseLayout({
    height: 720,
    margin: { l: 78, r: 46, t: 72, b: 76 },
    xaxis: { title: { text: 'EV stock (millions)', standoff: 8 }, range: [-4, 48], gridcolor: '#EEF2F6', automargin: true },
    yaxis: { title: 'EV sales (millions)', range: [-1.2, 16.8], gridcolor: '#EEF2F6', automargin: true },
    showlegend: false,
    annotations: [
      // Year + APAC superset note in the corner so the chart is self-explanatory.
      { x: 0.01, y: 0.99, xref: 'paper', yref: 'paper', xanchor: 'left', yanchor: 'top',
        text: '<b>2024</b><br><span style="color:#64748B">dashed = regional superset (incl. China)</span>',
        showarrow: false, align: 'left',
        font: { size: 11, color: '#0F172A', family: FONT_MONO },
        bgcolor: 'rgba(255,255,255,0.96)', bordercolor: '#E2E8F0', borderwidth: 1, borderpad: 5 },
      { x: REGION_AGGS_2024.CHN.stock_M,  y: REGION_AGGS_2024.CHN.sales_M,  text: '<b>CHN</b>', showarrow: false, font: { color: '#fff', size: 12 } },
      { x: REGION_AGGS_2024.APAC.stock_M, y: REGION_AGGS_2024.APAC.sales_M, text: '<b>APAC</b>', showarrow: false, font: { color: '#9C89B8', size: 11 } },
      { x: REGION_AGGS_2024.EUR.stock_M,  y: REGION_AGGS_2024.EUR.sales_M,  text: '<b>EUR</b>', showarrow: false, font: { color: '#fff', size: 11 } },
      { x: REGION_AGGS_2024.USA.stock_M,  y: REGION_AGGS_2024.USA.sales_M,  text: '<b>USA</b>', showarrow: false, font: { color: '#fff', size: 11 } },
      { x: REGION_AGGS_2024.NAM.stock_M,  y: REGION_AGGS_2024.NAM.sales_M,  ax: 35, ay: 5, text: 'NAM', font: { color: '#9B2226', size: 11 }, arrowcolor: '#9B2226', arrowhead: 2, arrowsize: 1, bgcolor: 'rgba(255,255,255,0.92)' },
      { x: REGION_AGGS_2024.IND.stock_M,  y: REGION_AGGS_2024.IND.sales_M,  ax: 0,  ay: -28, text: 'IND', font: { color: '#F77F00', size: 11 }, arrowcolor: '#F77F00', arrowhead: 2, arrowsize: 1, bgcolor: 'rgba(255,255,255,0.92)' },
    ],
  });

  Plotly.newPlot(el, [...aggTraces, cT].filter(t => t.x.length), layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// Chart 1.B - Top-15 EV Car Stock animated horizontal bars
// Driven externally (year slider). `mountBarRace(el)` returns {update}.
// ---------------------------------------------------------------------
function mountBarRace(el, initialYear = 2024, filters) {
  // Pool of countries to consider
  const allCountries = () => Object.keys(COUNTRY_STOCK_M)
    .filter(c => c !== 'Rest of the world' && fCountryKeep(fCurrentFilters(filters), c));

  function topNFor(year, n = 12) {
    const idx = YEARS.indexOf(year);
    return allCountries()
      .map(c => ({ c, v: COUNTRY_STOCK_M[c][idx] || 0 }))
      .sort((a, b) => b.v - a.v)
      .slice(0, n);
  }

  function valuesFor(year, n = 12) {
    return topNFor(year, n).map(o => o.v).reverse(); // smallest at bottom of bar
  }
  function labelsFor(year, n = 12) {
    return topNFor(year, n).map(o => o.c).reverse();
  }
  function colorsFor(year, n = 12) {
    return labelsFor(year, n).map(c => REGION_COLORS[c] || PALETTE.primary);
  }

  const xMax = () => (Math.max(...topNFor(2024).map(o => o.v), 0.1) * 1.18);

  function layoutFor(year, maxX, labels) {
    return baseLayout({
      height: 540,
      margin: { l: 150, r: 90, t: 12, b: 50 },
      xaxis: {
        title: 'EV cars on the road (millions)',
        range: [0, maxX], gridcolor: '#EEF2F6', linecolor: '#E2E8F0',
        tickfont: { size: 13, color: '#475569' },
      },
      yaxis: {
        type: 'category', categoryorder: 'array', categoryarray: labels,
        tickfont: { color: '#0F172A', size: 13, family: FONT_FAMILY }, gridcolor: 'transparent',
        automargin: true,
      },
      showlegend: false,
      annotations: [{
        text: year,
        xref: 'paper', yref: 'paper', x: 0.99, y: 0.02,
        showarrow: false,
        font: { size: 28, color: 'rgba(148,163,184,0.55)', family: FONT_MONO, weight: 700 },
        xanchor: 'right', yanchor: 'bottom',
      }],
    });
  }

  function trace(year) {
    const values = valuesFor(year);
    const labels = labelsFor(year);
    return [{
      type: 'bar', orientation: 'h',
      x: values, y: labels,
      marker: { color: colorsFor(year), line: { width: 0 } },
      text: values.map(v => v >= 0.01 ? v.toFixed(2) + ' M' : ''),
      textposition: 'outside',
      textfont: { color: '#0F172A', size: 12, family: FONT_MONO },
      cliponaxis: false,
      hovertemplate: '<b>%{y}</b>: %{x:.2f} M EVs<extra></extra>',
    }];
  }

  let currentYear = initialYear;
  Plotly.newPlot(el, trace(initialYear), layoutFor(initialYear, xMax(), labelsFor(initialYear)), PLOT_CONFIG);

  const controller = {
    update(year) {
      currentYear = year;
      const values = valuesFor(year);
      const labels = labelsFor(year);
      const localMax = Math.max(...values) * 1.4 || 0.5;
      const useMax = Math.min(xMax(), Math.max(localMax, 0.5));
      Plotly.react(el, trace(year), layoutFor(year, useMax, labels), PLOT_CONFIG);
    }
  };
  const onFilters = (ev) => {
    filters = ev && ev.detail ? ev.detail : window.__DASH_FILTERS__;
    controller.update(currentYear);
  };
  window.addEventListener('dashboard-filter-change', onFilters);
  controller.destroy = () => window.removeEventListener('dashboard-filter-change', onFilters);
  return controller;
}

// ---------------------------------------------------------------------
// Chart 1.C - China / USA / Europe stack + share lines
// ---------------------------------------------------------------------
function mountGrowthCompare(el, filters) {
  const regions = ['China','USA','Europe'].filter(r => fCountryKeep(filters, r));
  if (!regions.length) {
    Plotly.newPlot(el, [], baseLayout({
      height: 440,
      annotations: [{
        xref: 'paper', yref: 'paper', x: 0.5, y: 0.5, showarrow: false,
        text: 'No China / USA / Europe panel for selected country filter.',
        font: { size: 13, color: '#64748B', family: FONT_FAMILY },
      }],
    }), PLOT_CONFIG);
    return;
  }

  // unified ranges
  let maxStock = 0, maxShare = 0;
  regions.forEach(r => {
    const d = REGION_BY_PT[r];
    d.years.forEach((_, i) => {
      const tot = (d.BEV[i] + d.PHEV[i] + d.FCEV[i]) * 1e6;
      if (tot > maxStock) maxStock = tot;
    });
    maxShare = Math.max(maxShare, ...d.salesShare);
  });

  const traces = [];
  const xaxes = ['x','x2','x3'];
  const yaxes = ['y','y2','y3'];
  const yShare = ['y4','y5','y6'];

  regions.forEach((r, idx) => {
    const d = REGION_BY_PT[r];
    const bev  = { type:'bar', name:'BEV',  x: d.years, y: d.BEV.map(v => v*1e6),  marker:{color: PALETTE.fast},   xaxis: xaxes[idx], yaxis: yaxes[idx], showlegend: idx===0, legendgroup:'BEV',
                   hovertemplate:'<b>BEV</b> %{x}: %{y:,.0f}<extra></extra>' };
    const phev = { type:'bar', name:'PHEV', x: d.years, y: d.PHEV.map(v => v*1e6), marker:{color: PALETTE.slow},   xaxis: xaxes[idx], yaxis: yaxes[idx], showlegend: idx===0, legendgroup:'PHEV',
                   hovertemplate:'<b>PHEV</b> %{x}: %{y:,.0f}<extra></extra>' };
    const fcev = { type:'bar', name:'FCEV', x: d.years, y: d.FCEV.map(v => v*1e6), marker:{color: PALETTE.fcev},xaxis: xaxes[idx], yaxis: yaxes[idx], showlegend: idx===0, legendgroup:'FCEV',
                   hovertemplate:'<b>FCEV</b> %{x}: %{y:,.0f}<extra></extra>' };
    const share = { type:'scatter', mode:'lines+markers', name:'Sales share %', x: d.years, y: d.salesShare,
                    line:{ dash:'dash', color: PALETTE.accent, width: 2 },
                    marker:{ color: PALETTE.accent, size: 8 },
                    xaxis: xaxes[idx], yaxis: yShare[idx], showlegend: idx===0, legendgroup:'share',
                    hovertemplate:'<b>Sales share</b> %{x}: %{y:.1f}%<extra></extra>' };
    traces.push(bev, phev, fcev, share);
  });

  const stockRange = [0, maxStock * 1.1];
  const shareRange = [0, maxShare * 1.15];

  // 3-column layout
  const colW = regions.length === 1 ? 1 : regions.length === 2 ? 0.46 : 0.30;
  const gap = regions.length === 1 ? 0 : regions.length === 2 ? 0.08 : 0.05;
  const cols = regions.map((_, i) => {
    const start = i * (colW + gap);
    return [start, Math.min(start + colW, 1)];
  });

  const layout = baseLayout({
    height: 460,
    barmode: 'stack',
    margin: { l: 64, r: 64, t: 50, b: 56 },
    xaxis:  { domain: cols[0] || [0,1], title: regions[0] || '', titlefont: { size: 12, color: '#0F172A' }, gridcolor: '#EEF2F6' },
    xaxis2: { domain: cols[1] || [0,0], title: regions[1] || '', titlefont: { size: 12, color: '#0F172A' }, gridcolor: '#EEF2F6' },
    xaxis3: { domain: cols[2] || [0,0], title: regions[2] || '', titlefont: { size: 12, color: '#0F172A' }, gridcolor: '#EEF2F6' },

    yaxis:  { range: stockRange, title: { text: 'EV stock (vehicles)', font: { size: 11 } }, gridcolor:'#EEF2F6', tickformat: '~s' },
    yaxis2: { range: stockRange, matches: 'y', showticklabels: false, gridcolor: '#EEF2F6' },
    yaxis3: { range: stockRange, matches: 'y', showticklabels: false, gridcolor: '#EEF2F6' },

    yaxis4: { range: shareRange, overlaying: 'y',  side: 'right', showticklabels: false, showgrid: false },
    yaxis5: { range: shareRange, overlaying: 'y2', side: 'right', showticklabels: false, showgrid: false },
    yaxis6: { range: shareRange, overlaying: 'y3', side: 'right', title: { text: 'Sales share (%)', font: { size: 11 } }, ticksuffix: '%', showgrid: false },

    legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: 1.12, font: { size: 11 } },
    hovermode: 'x unified',
  });

  Plotly.newPlot(el, traces, layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// Chart 1.D - China vs USA sales with policy annotations
// ---------------------------------------------------------------------
function mountInflection(el, filters) {
  const f = fSliceYears(filters);
  const visibleCountries = ['China','USA'].filter(c => fCountryKeep(filters, c));
  if (!visibleCountries.length) {
    Plotly.newPlot(el, [], baseLayout({
      height: 560,
      annotations: [{
        xref: 'paper', yref: 'paper', x: 0.5, y: 0.5, showarrow: false,
        text: 'No China / USA inflection series for selected country filter.',
        font: { size: 13, color: '#64748B', family: FONT_FAMILY },
      }],
    }), PLOT_CONFIG);
    return;
  }
  const cn = f.slice(CN_US_SALES.China).map(v => v*1e6);
  const us = f.slice(CN_US_SALES.USA).map(v => v*1e6);
  const traces = [];
  if (visibleCountries.includes('China')) traces.push(
    { type:'scatter', mode:'lines+markers', name:'China',
      x: f.years, y: cn, line: { color: '#D62828', width: 3 }, marker: { size: 9 },
      hovertemplate:'<b>China</b><br>%{x}: %{y:,.0f} EVs sold<extra></extra>' }
  );
  if (visibleCountries.includes('USA')) traces.push(
    { type:'scatter', mode:'lines+markers', name:'USA',
      x: f.years, y: us, line: { color: '#1D4E89', width: 3 }, marker: { size: 9 },
      hovertemplate:'<b>USA</b><br>%{x}: %{y:,.0f} EVs sold<extra></extra>' }
  );

  const valAt = (country, year) => {
    const arr = country === 'China' ? cn : us;
    const i = f.years.indexOf(year);
    return i >= 0 ? arr[i] : null;
  };

  // Highlight inflection points (where growth went exponential): CN ≈ 2015, US ≈ 2018
  const inflections = [
    { country:'China', year: 2015, label: 'CN inflection · exponential phase begins' },
    { country:'USA',   year: 2018, label: 'US inflection · steady acceleration' },
  ];

  const ann = [
    // Policy events: alternate vertical offsets and stagger LEFT/RIGHT to keep arrows from crossing.
    ...POLICY_EVENTS.filter(ev => visibleCountries.includes(ev.country)).map((ev, i) => {
      const offsets = [
        { ax: -120, ay: -90 }, { ax: 110, ay: -150 }, { ax: -130, ay: -210 },
        { ax: 120, ay: -80 }, { ax: -150, ay: -150 }, { ax: 150, ay: -225 },
      ];
      const off = offsets[i % offsets.length];
      // Pre-2018 events go above-left, 2018+ go above-right with longer offsets so they fan out.
      const right = off.ax > 0;
      return {
        x: ev.year, y: valAt(ev.country, ev.year),
        ax: off.ax,
        ay: off.ay,
        text: '<b>' + ev.short + '</b> · ' + ev.label,
        font: { size: 11, color: '#334155' },
        bgcolor: 'rgba(255,255,255,0.98)',
        bordercolor: '#E2E8F0', borderwidth: 1, borderpad: 5,
        arrowhead: 2, arrowsize: 1, arrowwidth: 1, arrowcolor: '#94A3B8',
        xanchor: right ? 'left' : 'right',
      };
    }),
    // Inflection markers - use the chart-paper bottom so they don't overlap with policy boxes.
    ...(visibleCountries.includes('China') ? [{
      xref: 'x', yref: 'paper',
      x: 2015, y: 0.08, ax: -32, ay: -68,
      text: '★ <b>CN inflection (2015)</b><br>exponential phase begins',
      align: 'center',
      font: { size: 11, color: '#D62828', family: FONT_FAMILY },
      bgcolor: 'rgba(255,255,255,1)',
      bordercolor: '#D62828', borderwidth: 1.5, borderpad: 5,
      arrowhead: 2, arrowsize: 1, arrowwidth: 1.3, arrowcolor: '#D62828',
      xanchor: 'center', yanchor: 'bottom',
    }] : []),
    ...(visibleCountries.includes('USA') ? [{
      xref: 'x', yref: 'paper',
      x: 2018, y: 0.02, ax: 48, ay: -96,
      text: '★ <b>US inflection (2018)</b><br>steady acceleration',
      align: 'center',
      font: { size: 11, color: '#1D4E89', family: FONT_FAMILY },
      bgcolor: 'rgba(255,255,255,1)',
      bordercolor: '#1D4E89', borderwidth: 1.5, borderpad: 5,
      arrowhead: 2, arrowsize: 1, arrowwidth: 1.3, arrowcolor: '#1D4E89',
      xanchor: 'center', yanchor: 'bottom',
    }] : []),
  ];

  // Vertical shaded anomaly bands
  const shapes = Object.entries(ANOMALY_YEARS).map(([yr, info]) => ({
    type:'rect', xref:'x', yref:'paper',
    x0: parseInt(yr)-0.5, x1: parseInt(yr)+0.5, y0: 0, y1: 1,
    fillcolor: info.dir === 'down' ? 'rgba(208,0,0,0.06)' : 'rgba(11,122,117,0.06)',
    line: { width: 0 },
  }));

  const layout = baseLayout({
    height: 620,
    margin: { l: 84, r: 42, t: 160, b: 88 },
    xaxis: { title: 'Year', tickmode: 'linear', dtick: 1, tickangle: -45, gridcolor: '#EEF2F6' },
    yaxis: { title: 'EV sales (vehicles)', tickformat: '~s', gridcolor: '#EEF2F6' },
    legend: { orientation: 'h', x: 0, y: 1.08, font: { size: 12 } },
    annotations: ann,
    shapes,
  });

  Plotly.newPlot(el, traces, layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// Chart 2.A - Chargers vs EVs stacked panels
// ---------------------------------------------------------------------
function mountInfraVsEvs(el, filters) {
  const f = fSliceYears(filters);
  const ev = {
    type: 'scatter', mode: 'lines', name: 'EV stock',
    x: f.years, y: f.slice(WORLD_EV_STOCK_M), fill: 'tozeroy',
    line: { color: PALETTE.primary, width: 2.5 },
    fillcolor: 'rgba(11,122,117,0.22)',
    xaxis: 'x', yaxis: 'y',
    hovertemplate: '%{x}: %{y:.2f} M EVs<extra></extra>',
  };
  const slow = {
    type:'scatter', mode:'lines', name:'Slow Charger',
    x: f.years, y: f.slice(WORLD_CHARGERS.Slow), stackgroup: 'chargers',
    line: { width: 0.5, color: PALETTE.slow }, fillcolor: 'rgba(168,218,220,0.85)',
    xaxis: 'x2', yaxis: 'y2',
    hovertemplate: '<b>Slow</b> %{x}: %{y:.2f} M points<extra></extra>',
  };
  const fast = {
    type:'scatter', mode:'lines', name:'Fast Charger',
    x: f.years, y: f.slice(WORLD_CHARGERS.Fast), stackgroup: 'chargers',
    line: { width: 0.5, color: PALETTE.fast }, fillcolor: 'rgba(42,157,143,0.85)',
    xaxis: 'x2', yaxis: 'y2',
    hovertemplate: '<b>Fast</b> %{x}: %{y:.2f} M points<extra></extra>',
  };

  const layout = baseLayout({
    height: 580,
    margin: { l: 70, r: 24, t: 72, b: 86 },
    grid: { rows: 2, columns: 1, pattern: 'independent', roworder: 'top to bottom' },
    xaxis:  { matches: 'x2', showticklabels: false, gridcolor: '#EEF2F6', domain: [0,1], anchor: 'y' },
    yaxis:  { domain: [0.56, 1.0], title: 'EVs (millions)', gridcolor: '#EEF2F6', anchor: 'x' },
    xaxis2: { title: '', tickmode: 'linear', dtick: 1, tickangle: -45, gridcolor: '#EEF2F6', domain: [0,1], anchor: 'y2' },
    yaxis2: { domain: [0, 0.44], title: 'Charging points (millions)', gridcolor: '#EEF2F6', anchor: 'x2' },
    annotations: [
      { text: '<b>EV cars on the road</b>  ·  BEV+PHEV+FCEV, all modes', xref:'paper', yref:'paper', x: 0, y: 1.11, showarrow: false, font: { size: 13, color: '#0F172A' }, xanchor:'left' },
      { text: '<b>Public chargers</b>  ·  Fast vs Slow',                xref:'paper', yref:'paper', x: 0, y: 0.46, showarrow: false, font: { size: 13, color: '#0F172A' }, xanchor:'left' },
      // Synced 2020 reference - anchor at top of each panel so readers can visually align.
      { x: 2020, y: 1.0, xref: 'x', yref: 'paper', text: '2020 - divergence', showarrow: false,
        font: { size: 10, color: '#D62828', family: FONT_MONO },
        bgcolor: 'rgba(255,255,255,0.95)', xanchor: 'left', xshift: 4, yanchor: 'top', borderpad: 2 },
    ],
    legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.16, font: { size: 12 } },
    hovermode: 'x unified',
    // 2020 sync line in BOTH panels - lets the reader visually drop a thread from EV-stock to chargers.
    shapes: [
      { type: 'line', xref: 'x',  yref: 'paper', x0: 2020, x1: 2020, y0: 0.56, y1: 1.0, line: { color: '#D62828', width: 1.2, dash: 'dot' } },
      { type: 'line', xref: 'x2', yref: 'paper', x0: 2020, x1: 2020, y0: 0,    y1: 0.44, line: { color: '#D62828', width: 1.2, dash: 'dot' } },
    ],
  });

  Plotly.newPlot(el, [ev, slow, fast], layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// Chart 2.B - Charger / EV stress test (log x)
// ---------------------------------------------------------------------
function mountStressTest(el, filters) {
  const focus = (filters && filters.country && filters.country !== 'ALL') ? filters.country : null;
  const conts = ['Asia','Europe','America','Oceania'];
  const traces = conts.map(cont => {
    const rows = STRESS_2024.filter(r => r.continent === cont && fCountryKeep(filters, r.country));
    return {
      type: 'scatter', mode: 'markers',
      name: cont,
      x: rows.map(r => r.stock_M),
      y: rows.map(r => r.ratio),
      text: rows.map(r => r.country),
      marker: {
        size: rows.map(r => Math.max(Math.sqrt(r.stock_M*1e6) / 120, 9)),
        sizemode: 'diameter',
        color: CONTINENT_COLORS[cont],
        opacity: 0.82,
        line: {
          color: rows.map(r => fCountryMatches(filters, r.country) ? '#0F172A' : '#fff'),
          width: rows.map(r => fCountryMatches(filters, r.country) ? 2.5 : 1.2),
        },
      },
      customdata: rows.map(r => [r.country, r.continent, r.chargers]),
      hovertemplate: '<b>%{customdata[0]}</b><br>Continent: %{customdata[1]}<br>EV stock: %{x:.2f} M<br>Chargers: %{customdata[2]:,}<br>EVs per public charger: %{y:.1f}<extra></extra>',
    };
  });
  const layout = baseLayout({
    height: 560,
    margin: { l: 70, r: 112, t: 28, b: 72 },
    xaxis: {
      type: 'log', title: { text: 'EV stock (millions, log scale)', standoff: 10 },
      gridcolor: '#EEF2F6', tickvals: [0.05,0.1,0.5,1,5,10,50],
    },
    yaxis: { title: 'EVs per public charger (higher = worse)', gridcolor: '#EEF2F6' },
    legend: {
      title: {
        text: '<b>Continent</b>',
        font: { size: 11, color: '#64748B', family: FONT_FAMILY, weight: 700 },
      },
      x: 1.02, y: 1,
      font: { size: 11, color: '#334155', family: FONT_FAMILY },
      itemsizing: 'constant',
    },
    shapes: [
      {
        type:'line', xref:'paper', yref:'y',
        x0:0, x1:1, y0:12, y1:12,
        line: { dash:'dash', color: '#94A3B8', width: 1 },
      },
    ],
    annotations: [
      {
        xref:'paper', yref:'y', x: 0.01, y: 12, ax: 0, ay: -14,
        text: 'global avg 1:12', showarrow: false,
        font: { size: 11, color: '#94A3B8', family: FONT_MONO },
        xanchor:'left',
      },
      { xref: 'paper', yref: 'paper', x: 1.02, y: 0.54, xanchor: 'left',
        text: '<b>Bubble size</b>', showarrow: false,
        font: { size: 11, color: '#64748B', family: FONT_FAMILY, weight: 700 },
        bgcolor: 'rgba(255,255,255,0.92)', borderpad: 3 },
      { xref: 'paper', yref: 'paper', x: 1.035, y: 0.47, xanchor: 'left', text: '<span style="font-size:11px">○</span> 0.1M', showarrow: false, align: 'left', font: { size: 11, color: '#64748B', family: FONT_MONO } },
      { xref: 'paper', yref: 'paper', x: 1.035, y: 0.405, xanchor: 'left', text: '<span style="font-size:14px">○</span> 1M', showarrow: false, align: 'left', font: { size: 11, color: '#64748B', family: FONT_MONO } },
      { xref: 'paper', yref: 'paper', x: 1.035, y: 0.335, xanchor: 'left', text: '<span style="font-size:18px">○</span> 10M', showarrow: false, align: 'left', font: { size: 11, color: '#64748B', family: FONT_MONO } },
    ],
  });

  Plotly.newPlot(el, traces.filter(t => t.x.length), layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// Chart 3.A - Top 10 EV markets BEV vs PHEV (horizontal 100% bars)
// ---------------------------------------------------------------------
function mountTop20Mix(el, filters) {
  const focus = (filters && filters.country && filters.country !== 'ALL') ? filters.country : null;
  const evType = (filters && filters.ev && filters.ev !== 'ALL') ? filters.ev : null;
  const rowsFiltered = TOP20_MIX.filter(r => fCountryKeep(filters, r.country));
  const rows = (rowsFiltered.length ? rowsFiltered : TOP20_MIX.filter(r => fCountryIncome(filters, r.country))).slice(0, 10).reverse();
  const countries = rows.map(r => r.country);
  const bev  = rows.map(r => r.BEV);
  const phev = rows.map(r => r.PHEV);
  // Highlight markets where PHEV > BEV (Finland, Italy, Spain, Sweden ~tie)
  const PHEV_DOMINANT = new Set(rows.filter(r => r.PHEV > r.BEV).map(r => r.country));

  const traces = [
    {
      type: 'bar', orientation: 'h', name: 'BEV',
      x: bev, y: countries,
      marker: {
        color: countries.map(c => focus && !fCountryMatches(filters, c) ? '#94A3B8' : PALETTE.bev),
        opacity: evType === 'PHEV' || evType === 'FCEV' ? 0.25 : 1,
      },
      text: bev.map(v => v + '%'),
      textposition: 'inside', insidetextanchor: 'middle',
      textfont: { color: '#fff', size: 12, family: FONT_FAMILY },
      hovertemplate: '<b>%{y}</b><br>BEV: %{x:.0f}%<extra></extra>',
    },
    {
      type: 'bar', orientation: 'h', name: 'PHEV',
      x: phev, y: countries,
      marker: {
        color: countries.map(c => focus && !fCountryMatches(filters, c) ? '#CBD5E1' : PALETTE.phev),
        opacity: evType === 'BEV' || evType === 'FCEV' ? 0.25 : 1,
      },
      text: phev.map(v => v + '%'),
      textposition: 'inside', insidetextanchor: 'middle',
      textfont: { color: '#fff', size: 12, family: FONT_FAMILY },
      hovertemplate: '<b>%{y}</b><br>PHEV: %{x:.0f}%<extra></extra>',
    },
  ];

  // Highlight PHEV-dominant rows with a soft band behind them.
  const phevHighlight = countries
    .map((c, i) => PHEV_DOMINANT.has(c) ? i : null)
    .filter(v => v !== null)
    .map(i => ({
      type: 'rect', xref: 'paper', yref: 'y',
      x0: 0, x1: 1, y0: i - 0.46, y1: i + 0.46,
      fillcolor: 'rgba(231,111,81,0.08)', line: { width: 0 },
      layer: 'below',
    }));

  const layout = baseLayout({
    barmode: 'stack',
    height: 540,
    margin: { l: 150, r: 90, t: 46, b: 62 },
    xaxis: {
      title: 'Share of EV car stock (%)',
      range: [0, 100],
      gridcolor: '#EEF2F6',
      linecolor: '#E2E8F0',
      ticksuffix: '%',
      tickfont: { size: 13, color: '#475569' },
    },
    yaxis: {
      type: 'category',
      categoryorder: 'array',
      categoryarray: countries,
      tickfont: { color: '#0F172A', size: 13, family: FONT_FAMILY },
      gridcolor: 'transparent',
      automargin: true,
    },
    legend: {
      orientation: 'h',
      x: 0,
      xanchor: 'left',
      y: 1.12,
      yanchor: 'bottom',
      font: { size: 12, color: '#334155', family: FONT_FAMILY },
    },
    shapes: phevHighlight,
    annotations: [
      { xref: 'paper', yref: 'paper', x: 1.0, y: 1.13, xanchor: 'right',
        text: '<span style="color:#E76F51">■</span> PHEV-dominant market (background tinted)',
        showarrow: false, font: { size: 11, color: '#475569' } },
      { xref: 'paper', yref: 'paper', x: 0, y: -0.19, xanchor: 'left',
        text: '<span style="color:#94A3B8">Note:</span> FCEV is <1% in every market and is excluded for clarity.',
        showarrow: false, font: { size: 11, color: '#64748B', family: FONT_FAMILY } },
    ],
  });

  Plotly.newPlot(el, traces, layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// Chart 3.B - Sales share vs Stock share, with STEPS bridge
// ---------------------------------------------------------------------
function mountTurnoverGap(el) {
  const histYears = YEARS;
  const bridgeYears = [2024, 2030];

  const salesHist = {
    type:'scatter', mode:'lines+markers', name:'Sales share (hist)',
    x: histYears, y: WORLD_SALES_SHARE,
    line: { color: PALETTE.primary, width: 3 },
    marker: { color: PALETTE.primary, size: 8 },
    hovertemplate: '%{x} · Sales share: %{y:.1f}%<extra></extra>',
  };
  const salesProj = {
    type:'scatter', mode:'lines+markers', name:'Sales share (STEPS)',
    x: bridgeYears, y: [WORLD_SALES_SHARE[14], STEPS_2030.salesShare],
    line: { color: PALETTE.primary, width: 2, dash: 'dash' },
    marker: { color: PALETTE.primary, size: 10, symbol: 'diamond' },
    hovertemplate: '%{x} · Sales share: %{y:.1f}%<extra></extra>',
  };
  const stockHist = {
    type:'scatter', mode:'lines+markers', name:'Stock share (hist)',
    x: histYears, y: WORLD_STOCK_SHARE,
    line: { color: PALETTE.accent, width: 3 },
    marker: { color: PALETTE.accent, size: 8 },
    hovertemplate: '%{x} · Stock share: %{y:.1f}%<extra></extra>',
  };
  const stockProj = {
    type:'scatter', mode:'lines+markers', name:'Stock share (STEPS)',
    x: bridgeYears, y: [WORLD_STOCK_SHARE[14], STEPS_2030.stockShare],
    line: { color: PALETTE.accent, width: 2, dash: 'dash' },
    marker: { color: PALETTE.accent, size: 10, symbol: 'diamond' },
    hovertemplate: '%{x} · Stock share: %{y:.1f}%<extra></extra>',
  };

  const layout = baseLayout({
    height: 520,
    margin: { l: 56, r: 24, t: 24, b: 118 },
    xaxis: { title: { text: 'Year', standoff: 12 }, tickmode:'linear', dtick: 2, gridcolor: '#EEF2F6' },
    yaxis: { title: '% of cars', range: [0, 50], ticksuffix: '%', gridcolor: '#EEF2F6' },
    hovermode: 'x unified',
    legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.26, font: { size: 11 } },
    shapes: [{
      type:'line', xref:'x', yref:'paper', x0: 2024, x1: 2024, y0: 0, y1: 1,
      line: { dash:'dot', width: 1, color: '#CBD5E1' },
    }],
    annotations: [
      { x: 2024, y: 1.0, xref: 'x', yref: 'paper', text: 'Historical | Projection',
        font: { size: 10, color: '#94A3B8', family: FONT_MONO },
        showarrow: false, bgcolor: 'rgba(255,255,255,0.85)', xanchor: 'center', borderpad: 2 },
      { x: 2030, y: STEPS_2030.salesShare, text: '42% sales',
        font: { size: 11, color: PALETTE.primary, family: FONT_MONO },
        showarrow: false, xanchor: 'right', yanchor: 'bottom' },
      { x: 2030, y: STEPS_2030.stockShare, text: '~15% stock',
        font: { size: 11, color: PALETTE.accent, family: FONT_MONO },
        showarrow: false, xanchor: 'right', yanchor: 'top' },
    ],
  });

  Plotly.newPlot(el, [salesHist, salesProj, stockHist, stockProj], layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// Chart 4.A - Adoption vs Infrastructure Density (income bubble)
// ---------------------------------------------------------------------
function mountSocio(el, filters) {
  // Income/country filters narrow which bubbles are drawn.
  const allGroups = ['High','Upper-middle','Lower-middle'];
  const groups = allGroups.filter(g => fIncomeKeep(filters, g));

  // Bubble size encodes EV stock (the dimension this chart is about), NOT population.
  // We resolve stock per country from the time-series fixture; if a country isn't tracked
  // there we fall back to a small uniform size so it stays visible.
  const stockFor = (country) => {
    const series = COUNTRY_STOCK_M[country];
    if (series && series.length) return series[series.length - 1] || 0.05;
    // Tracked-but-not-broken-out countries get a typical mid-tier size
    return 0.05;
  };

  // Always label these - outliers and big markets that anchor the story.
  // Includes the four worst-charger-ratio countries from the stress test as well.
  const ALWAYS_LABEL = new Set([
    'Norway','China','USA','India','Netherlands','Korea',
    'Germany','Australia','Mexico','Indonesia','Japan','Sweden','Ukraine',
  ]);

  const traces = groups.map(g => {
    const rows = SOCIO_2024.filter(r => r.income === g && fCountryKeep(filters, r.country));
    return {
      type: 'scatter', mode: 'markers+text',
      name: g + ' income',
      // Defensive +1 on the X value before plotly's log transform handles it:
      // we keep r.ch_per_M (which is always positive in SOCIO_2024), but if a 0
      // ever slips in, the floor here prevents the whole axis collapsing.
      x: rows.map(r => Math.max(r.ch_per_M, 1)),
      y: rows.map(r => r.salesShare),
      text: rows.map(r => ALWAYS_LABEL.has(r.country) ? r.country : ''),
      textposition: 'top center',
      textfont: { color: '#475569', size: 11, family: FONT_FAMILY },
      cliponaxis: false,
      marker: {
        size: rows.map(r => {
          const s = stockFor(r.country);
          const raw = Math.sqrt(s) * 9 + 10;
          return Math.min(Math.max(raw, 10), 56);
        }),
        sizemode: 'diameter',
        color: INCOME_COLORS[g],
        opacity: 0.62,
        line: {
          color: rows.map(r => fCountryMatches(filters, r.country) ? '#0F172A' : '#fff'),
          width: rows.map(r => fCountryMatches(filters, r.country) ? 2.5 : 1.5),
        },
      },
      customdata: rows.map(r => [r.country, g, r.pop, stockFor(r.country)]),
      hovertemplate: '<b>%{customdata[0]}</b><br>Income: %{customdata[1]}<br>Chargers/M: %{x:,.0f}<br>Sales share: %{y:.1f}%<br>EV stock: %{customdata[3]:.2f} M<br>Population: %{customdata[2]} M<extra></extra>',
    };
  });
  const bubbleLegendTitle = {
    type: 'scatter',
    mode: 'text',
    name: '__bubble_size_title',
    showlegend: false,
    hoverinfo: 'skip',
    x: [2.2],
    y: [94],
    text: ['<b>Bubble size</b>'],
    textposition: 'middle center',
    textfont: {
      size: 11,
      color: '#0F172A',
      family: FONT_FAMILY,
    },
    cliponaxis: false,
  };

  const bubbleLegendMarkers = {
    type: 'scatter',
    mode: 'markers',
    name: '__bubble_size_markers',
    showlegend: false,
    hoverinfo: 'skip',
    x: [2.2, 2.2, 2.2],
    y: [88, 74, 55],
    marker: {
      size: [10, 20, 38],
      sizemode: 'diameter',
      color: 'rgba(203,213,225,0.65)',
      line: {
        color: '#64748B',
        width: 1,
      },
    },
    cliponaxis: false,
  };

  const bubbleLegendLabels = {
    type: 'scatter',
    mode: 'text',
    name: '__bubble_size_labels',
    showlegend: false,
    hoverinfo: 'skip',
    x: [3.15, 3.15, 3.15],
    y: [88, 74, 55],
    text: ['0.1M', '1M', '10M+'],
    textposition: 'middle left',
    textfont: {
      size: 10,
      color: '#64748B',
      family: FONT_MONO,
    },
    cliponaxis: false,
  };

  // If a country is focused, add a brighter "highlight" trace just for that country.
  if (filters && filters.country && filters.country !== 'ALL') {
    const hit = SOCIO_2024.find(r => fCountryMatches(filters, r.country) && fIncomeKeep(filters, r.income));
    if (hit) {
      const s = stockFor(hit.country);
      traces.push({
        type: 'scatter', mode: 'markers+text',
        name: 'Focus · ' + hit.country,
        x: [Math.max(hit.ch_per_M, 1)], y: [hit.salesShare],
        text: [hit.country],
        textposition: 'top center',
        textfont: { color: '#0F172A', size: 13, family: FONT_FAMILY, weight: 700 },
        marker: {
          size: [Math.min(Math.max(Math.sqrt(s) * 9 + 10, 14), 60)],
          color: INCOME_COLORS[hit.income] || PALETTE.primary,
          opacity: 1, line: { color: '#0F172A', width: 2.5 },
        },
        hovertemplate: '<b>' + hit.country + '</b> · focused<extra></extra>',
        showlegend: false,
      });
    }
  }
  const layout = baseLayout({
    height: 580,
    margin: { l: 70, r: 34, t: 36, b: 146 },
    xaxis: {
      title: { text: 'Public chargers per million people  (log scale)', standoff: 6 },
      type: 'log',
      tickvals: [1, 10, 100, 1000, 10000],
      ticktext: ['1','10','100','1k','10k'],
      range: [Math.log10(0.8), Math.log10(15000)],
      gridcolor: '#EEF2F6',
    },
    yaxis: { title: 'EV sales share of new cars (%)', range: [0, 100], ticksuffix: '%', gridcolor: '#EEF2F6' },
    legend: {
      title: {
        text: '<b>Income group</b>',
        side: 'left',
        font: { size: 11, color: '#64748B', family: FONT_FAMILY },
      },
      orientation: 'h',
      x: 0,
      xanchor: 'left',
      y: -0.32,
      yanchor: 'top',
      traceorder: 'normal',
      font: { size: 11, color: '#334155', family: FONT_FAMILY },
      itemsizing: 'constant',
      itemwidth: 145,
      bgcolor: 'rgba(0,0,0,0)',
    },
    annotations: [
    ],
  });

  Plotly.newPlot(
    el,
    [
      ...traces.filter(t => t.x.length),
      bubbleLegendTitle,
      bubbleLegendMarkers,
      bubbleLegendLabels,
    ],
    layout,
    PLOT_CONFIG
  );
}

// ---------------------------------------------------------------------
// Chart 5.A - ARIMA forecast vs STEPS
// ---------------------------------------------------------------------
function mountForecast(el) {
  const f = FORECAST;

  const ci95 = {
    type:'scatter', mode:'lines', name:'95% PI',
    x: [...f.fc_years, ...f.fc_years.slice().reverse()],
    y: [...f.ci95_hi, ...f.ci95_lo.slice().reverse()],
    fill:'toself', fillcolor: 'rgba(244,162,97,0.18)',
    line: { color: 'rgba(0,0,0,0)' },
    hoverinfo: 'skip', showlegend: true,
  };
  const ci80 = {
    type:'scatter', mode:'lines', name:'80% PI',
    x: [...f.fc_years, ...f.fc_years.slice().reverse()],
    y: [...f.ci80_hi, ...f.ci80_lo.slice().reverse()],
    fill:'toself', fillcolor: 'rgba(244,162,97,0.35)',
    line: { color: 'rgba(0,0,0,0)' },
    hoverinfo: 'skip', showlegend: true,
  };
  const hist = {
    type:'scatter', mode:'lines+markers', name:'Historical',
    x: f.years_hist, y: f.hist_M,
    line: { color: PALETTE.primary, width: 3 },
    marker: { color: PALETTE.primary, size: 7 },
    hovertemplate: '%{x}: %{y:.1f} M EVs<extra></extra>',
  };
  const fc = {
    type:'scatter', mode:'lines+markers', name:'ARIMA(1,2,1) forecast',
    x: f.fc_years, y: f.fc_mean,
    line: { color: PALETTE.accent, width: 3, dash:'dash' },
    marker: { color: PALETTE.accent, size: 9, symbol: 'diamond' },
    hovertemplate: '%{x}: %{y:.1f} M EVs (forecast)<extra></extra>',
  };
  const steps = {
    type:'scatter', mode:'markers+text', name:'IEA STEPS 2030',
    x: [2030], y: [f.steps_2030],
    text: ['  IEA STEPS: 232 M'],
    textposition: 'middle right',
    textfont: { color: PALETTE.danger, size: 12, family: FONT_FAMILY, weight: 600 },
    marker: { color: PALETTE.danger, size: 18, symbol: 'star', line: { color: '#fff', width: 2 } },
    hovertemplate: 'IEA STEPS 2030: %{y:.0f} M EVs<extra></extra>',
  };

  const layout = baseLayout({
    height: 500,
    margin: { l: 64, r: 200, t: 30, b: 56 },
    xaxis: { title: 'Year', tickmode: 'linear', dtick: 2, gridcolor: '#EEF2F6' },
    yaxis: { title: 'EV cars on the road (millions)', gridcolor: '#EEF2F6' },
    hovermode: 'x unified',
    legend: { orientation: 'h', x: 0.0, y: 1.08, font: { size: 11 } },
    shapes: [{
      type:'line', xref:'x', yref:'paper', x0: 2024, x1: 2024, y0: 0, y1: 1,
      line: { dash:'dot', width: 1, color: '#CBD5E1' },
    }],
    annotations: [
      { x: 2024, y: 1.0, xref:'x', yref:'paper', text: 'Forecast window →',
        showarrow: false, font: { size: 10, color: '#94A3B8', family: FONT_MONO },
        xanchor:'left', bgcolor:'rgba(255,255,255,0.85)', borderpad: 2 },
    ],
  });

  Plotly.newPlot(el, [ci95, ci80, hist, fc, steps], layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// Chart 3.C - Choropleth: EV sales share by country (2024)
// ---------------------------------------------------------------------
function mountChoropleth(el, filters) {
  const focus = (filters && filters.country && filters.country !== 'ALL') ? filters.country : null;
  const filteredRows = CHOROPLETH_2024.filter(r => fCountryKeep(filters, r.name));
  const rows = filteredRows.length ? filteredRows : CHOROPLETH_2024.filter(r => fCountryIncome(filters, r.name));
  const isFiltered = !!(focus || (filters && filters.income && filters.income !== 'ALL'));
  const focusRow = focus ? rows.find(r => fCountryMatches(filters, r.name)) : null;
  const labelCoord = focusRow && COUNTRY_GEO_LABELS[focusRow.name];
  const data = [{
    type: 'choropleth',
    locationmode: 'ISO-3',
    locations: rows.map(r => r.iso),
    z: rows.map(r => r.salesShare),
    text: rows.map(r => r.name),
    customdata: rows.map(r => [r.stock_M, COUNTRY_INCOME_TIER[fNormCountry(r.name)] || 'Unmapped']),
    // Cap colorscale at 60% - only Norway/Sweden/Denmark/China would otherwise saturate the upper half.
    // Anything ≥60% renders identical dark teal; the 0-60% range gets the full ramp resolution.
    colorscale: [
      [0,     '#EAF2F1'],
      [0.05/0.6, '#D6E5E3'],
      [0.15/0.6, '#A8DADC'],
      [0.30/0.6, '#7BC4C0'],
      [0.45/0.6, '#2A9D8F'],
      [0.55/0.6, '#0B7A75'],
      [1,        '#074F4B'],
    ],
    zmin: 0, zmax: 60,
    marker: {
      line: {
        color: rows.map(r => fCountryMatches(filters, r.name) ? '#0F172A' : '#FFFFFF'),
        width: rows.map(r => fCountryMatches(filters, r.name) ? 1.2 : 0.25),
      },
    },
    colorbar: {
      title: { text: 'Sales share (%) - capped at 60%', font: { size: 12, color: '#475569' } },
      thickness: 14, len: 0.72, x: 1.02, ticksuffix: '%',
      tickvals: [0, 10, 20, 30, 40, 50, 60],
      ticktext: ['0%','10%','20%','30%','40%','50%','60%+'],
      tickfont: { size: 12, color: '#475569' },
    },
    hovertemplate: '<b>%{text}</b><br>Development: %{customdata[1]}<br>EV sales share: %{z:.1f}%<br>EV stock: %{customdata[0]:.2f} M<extra></extra>',
  }];
  if (focusRow && labelCoord) {
    data.push({
      type: 'scattergeo',
      mode: 'text',
      lat: [labelCoord[0]],
      lon: [labelCoord[1]],
      text: ['<b>' + focusRow.name + '</b><br>' + focusRow.salesShare.toFixed(1) + '%<br>' + focusRow.stock_M.toFixed(2) + 'M'],
      textfont: { size: 13, color: '#0F172A', family: FONT_FAMILY },
      hoverinfo: 'skip',
      showlegend: false,
    });
  }

  const layout = baseLayout({
    height: 500,
    margin: { l: 0, r: 0, t: 12, b: 40 },
    geo: {
      projection: { type: 'natural earth' },
      fitbounds: focus ? 'locations' : false,
      showcoastlines: true, coastlinecolor: '#CBD5E1', coastlinewidth: 0.5,
      showland: true, landcolor: '#E2E8F0',   // ← "no data" countries render in this neutral gray
      showocean: true, oceancolor: '#FFFFFF',
      showcountries: true, countrycolor: '#FFFFFF', countrywidth: 0.6,
      showframe: false,
      bgcolor: '#FFFFFF',
    },
    annotations: [
      { xref: 'paper', yref: 'paper', x: 0, y: 0.0, xanchor: 'left', yanchor: 'bottom',
        showarrow: false,
        text: '<span style="color:#475569">Gray</span> = ' + (isFiltered ? 'filtered out or no data for current selection.' : 'no data reported in IEA 2024  ·  Most of Africa, S. America, SE Asia are unreported, not 0%.'),
        font: { size: 11, color: '#64748B', family: FONT_FAMILY },
        bgcolor: 'rgba(255,255,255,0.9)', borderpad: 4 },
      ...(focusRow ? [{
        xref: 'paper', yref: 'paper', x: 0.02, y: 0.98, xanchor: 'left', yanchor: 'top',
        showarrow: false, align: 'left',
        text: '<b>' + focusRow.name + '</b><br>Sales share: ' + focusRow.salesShare.toFixed(1) + '%<br>EV stock: ' + focusRow.stock_M.toFixed(2) + ' M',
        font: { size: 12, color: '#0F172A', family: FONT_FAMILY },
        bgcolor: 'rgba(255,255,255,0.96)', bordercolor: '#CBD5E1', borderwidth: 1, borderpad: 5,
      }] : []),
    ],
  });

  Plotly.newPlot(el, data, layout, PLOT_CONFIG).then(() => {
    if (el.__choroplethClickHandler) el.removeListener('plotly_click', el.__choroplethClickHandler);
    el.__choroplethClickHandler = (ev) => {
      const pt = ev && ev.points && ev.points[0];
      if (pt && pt.text) {
        window.dispatchEvent(new CustomEvent('dashboard-set-country', { detail: { country: pt.text } }));
      }
    };
    el.on('plotly_click', el.__choroplethClickHandler);
  });
}

// ---------------------------------------------------------------------
// Chart 2.C - Adoption trend with urbanization overlay
// ---------------------------------------------------------------------
function mountAdoptionUrban(el, filters) {
  const f = fSliceYears(filters);
  const ssSlice = f.slice(WORLD_SALES_SHARE);
  const urbSlice = f.slice(URBAN_PCT_WORLD);
  const traces = [
    {
      type: 'bar', name: 'EV sales share (%)',
      x: f.years, y: ssSlice,
      marker: { color: PALETTE.primary, opacity: 0.85 },
      // Suppress labels for near-zero years so they don't visually pollute the early-decade bars
      text: ssSlice.map(v => v >= 0.5 ? v.toFixed(1) + '%' : ''),
      textposition: 'outside',
      textfont: { color: PALETTE.primary, size: 11, family: FONT_MONO },
      cliponaxis: false,
      yaxis: 'y',
      hovertemplate: '%{x}: %{y:.1f}% EV sales share<extra></extra>',
    },
    {
      type: 'scatter', mode: 'lines+markers', name: 'World urbanization rate (%)',
      x: f.years, y: urbSlice,
      line: { color: PALETTE.accent, width: 3 },
      marker: { color: PALETTE.accent, size: 8 },
      yaxis: 'y2',
      hovertemplate: '%{x}: %{y:.1f}% urban<extra></extra>',
    },
  ];

  const layout = baseLayout({
    height: 440,
    margin: { l: 64, r: 78, t: 64, b: 56 },
    xaxis: { title: 'Year', tickmode: 'linear', dtick: 2, gridcolor: '#EEF2F6' },
    // Widened from 50-60 to 0-100% (with light grid) so the urbanization rise looks honest
    yaxis: { title: 'EV sales share (%)', range: [0, 28], ticksuffix: '%', gridcolor: '#EEF2F6' },
    yaxis2: { title: 'Urbanization (%)', overlaying: 'y', side: 'right', range: [0, 100], ticksuffix: '%', gridcolor: 'transparent', titlefont: { color: PALETTE.accent }, tickfont: { color: PALETTE.accent } },
    legend: { orientation: 'h', x: 0, y: 1.15, font: { size: 13 } },
    annotations: [
      { x: 0.5, y: 1.06, xref: 'paper', yref: 'paper', xanchor: 'center',
        text: 'Right axis: full 0-100% scale - urbanization only moves from 51.6% to 57.8%, so the line’s actual slope is modest.',
        showarrow: false, font: { size: 11, color: '#64748B', family: FONT_FAMILY } },
    ],
  });

  Plotly.newPlot(el, traces, layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// Chart 4.B - Gas prices + transport CO₂ overlay (Tab 4)
// ---------------------------------------------------------------------
function mountGasEmissions(el, filters) {
  const f = fSliceYears(filters);
  const co2Slice = f.slice(TRANSPORT_CO2_GT);
  const gasSlice = f.slice(GAS_PRICE_USD_L);
  const ssSlice  = f.slice(WORLD_SALES_SHARE);
  const traces = [
    {
      type: 'bar', name: 'Transport CO₂ (Gt) · left axis',
      x: f.years, y: co2Slice,
      marker: { color: '#94A3B8', opacity: 0.62 },
      yaxis: 'y',
      hovertemplate: '%{x}: %{y:.2f} Gt CO₂<extra></extra>',
    },
    {
      type: 'scatter', mode: 'lines+markers', name: 'Gas price (USD/L) · right axis',
      x: f.years, y: gasSlice,
      line: { color: PALETTE.danger, width: 3 },
      marker: { color: PALETTE.danger, size: 9 },
      yaxis: 'y2',
      hovertemplate: '%{x}: $%{y:.2f}/L<extra></extra>',
    },
    {
      type: 'scatter', mode: 'lines+markers', name: 'EV sales share (%) · indexed to right axis',
      x: f.years,
      // Scale EV share to share the gas-price axis: 22% → displayed as 1.55 (max gas), etc.
      // The hover and the annotated end label show the true value.
      y: ssSlice.map(v => 0.6 + (v / 22) * (1.55 - 0.6)),
      customdata: ssSlice,
      line: { color: PALETTE.primary, width: 3, dash: 'dot' },
      marker: { color: PALETTE.primary, size: 9 },
      yaxis: 'y2',
      hovertemplate: '%{x}: %{customdata:.1f}% sales share<extra></extra>',
    },
  ];

  const layout = baseLayout({
    height: 520,
    margin: { l: 64, r: 116, t: 96, b: 74 },
    xaxis: { title: { text: 'Year', standoff: 10 }, tickmode: 'linear', dtick: 2 },
    yaxis: { title: { text: 'Transport CO₂ (Gt)  - ≀ axis breaks at 6.5', standoff: 10 }, range: [6.5, 8.0], gridcolor: '#EEF2F6' },
    yaxis2: {
      title: { text: 'Gas price (USD/L)  ·  EV share (indexed)', standoff: 8, font: { size: 11, color: PALETTE.danger } },
      overlaying: 'y', side: 'right', range: [0.6, 1.8], gridcolor: 'transparent', tickprefix: '$',
      tickfont: { color: PALETTE.danger, size: 11 },
    },
    legend: { orientation: 'h', x: 0, y: 1.10, font: { size: 11 } },
    annotations: [
      // Explicit axis-break warning on the left axis
      { x: 0, y: 1.01, xref: 'paper', yref: 'paper', xanchor: 'left',
        text: '<span style="color:#D62828">⚠</span> Left axis (CO₂) is truncated 6.5-8.0 Gt to make the plateau visible - do not read the bar heights as absolute scale.',
        showarrow: false, font: { size: 11, color: '#475569' } },
      // Direct end label for EV share so readers don't have to mentally remap.
      { x: f.years[f.years.length-1], y: 0.6 + (ssSlice[ssSlice.length-1] / 22) * (1.55 - 0.6),
        ax: -10, ay: -22, xref: 'x', yref: 'y2',
        text: '<b>EV share ' + f.years[f.years.length-1] + ' → ' + ssSlice[ssSlice.length-1].toFixed(1) + '%</b>',
        font: { size: 11, color: PALETTE.primary, family: FONT_MONO },
        bgcolor: 'rgba(255,255,255,0.98)', bordercolor: PALETTE.primary, borderwidth: 1, borderpad: 3,
        arrowhead: 2, arrowsize: 1, arrowwidth: 1, arrowcolor: PALETTE.primary, xanchor: 'right' },
    ],
  });

  Plotly.newPlot(el, traces, layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// ML.A - Urbanization vs EV sales share scatter (2024)
// ---------------------------------------------------------------------
// ---------------------------------------------------------------------
// ML.A - EV adoption-gap bar chart (top-10 over- vs top-10 under-performers, 2024)
// Horizontal bars; x = adoption_gap_log, y = country, colored by group.
// Positive gap = actual EV sales above OLS-expected; negative = below.
// ---------------------------------------------------------------------
function mountAdoptionGapBar(el, filters) {
  const OVER = PALETTE.success;   // overperformers
  const UNDER = PALETTE.danger;   // underperformers
  // Keep only rows matching the active country filter (if any). Sort ascending so the
  // most negative gap sits at the bottom and the most positive at the top.
  const rows = ADOPTION_GAP_TOP_BOTTOM
    .filter(r => fCountryKeep(filters, r.country))
    .slice()
    .sort((a, b) => a.gapLog - b.gapLog);

  if (!rows.length) {
    Plotly.newPlot(el, [], baseLayout({
      height: 560,
      annotations: [{ xref: 'paper', yref: 'paper', x: 0.5, y: 0.5, showarrow: false,
        text: 'No over/under-performers match the selected country filter.',
        font: { size: 13, color: '#64748B', family: FONT_FAMILY } }],
    }), PLOT_CONFIG);
    return;
  }

  const mkTrace = (group, color) => {
    const g = rows.filter(r => r.group === group);
    return {
      type: 'bar', orientation: 'h', name: group,
      y: g.map(r => r.country),
      x: g.map(r => r.gapLog),
      marker: {
        color: color, opacity: 0.9,
        line: { color: g.map(r => fCountryMatches(filters, r.country) ? '#0F172A' : color),
                width: g.map(r => fCountryMatches(filters, r.country) ? 2 : 0) },
      },
      customdata: g.map(r => [r.evSales, r.expected]),
      hovertemplate: '<b>%{y}</b><br>Adoption gap (log): %{x:+.2f}'
        + '<br>Actual EV sales: %{customdata[0]:,.0f}'
        + '<br>OLS-expected: %{customdata[1]:,.0f}<extra>' + group + '</extra>',
    };
  };

  const traces = [mkTrace('Underperformers', UNDER), mkTrace('Overperformers', OVER)];

  const layout = baseLayout({
    height: 560,
    margin: { l: 130, r: 40, t: 30, b: 64 },
    barmode: 'overlay',
    xaxis: {
      title: { text: 'Adoption gap — log(actual EV sales) − log(expected)   ·   right = overperforms, left = underperforms', standoff: 12 },
      zeroline: true, zerolinecolor: '#475569', zerolinewidth: 2, gridcolor: '#EEF2F6',
    },
    yaxis: { automargin: true, tickfont: { size: 12, color: '#0F172A' } },
    legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.16, font: { size: 12 } },
    shapes: [{ type: 'line', xref: 'x', yref: 'paper', x0: 0, x1: 0, y0: 0, y1: 1,
               line: { color: '#475569', width: 2 } }],
  });

  Plotly.newPlot(el, traces, layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// ML.B - China dual-line: urbanization + EV sales share (2010..2024)
// ---------------------------------------------------------------------
function mountChinaDual(el, filters) {
  if (filters && filters.country && filters.country !== 'ALL' && !fCountryMatches(filters, 'China')) {
    Plotly.newPlot(el, [], baseLayout({
      height: 460,
      annotations: [{
        xref: 'paper', yref: 'paper', x: 0.5, y: 0.5, showarrow: false,
        text: 'No China time-series for selected country filter.',
        font: { size: 13, color: '#64748B', family: FONT_FAMILY },
      }],
    }), PLOT_CONFIG);
    return;
  }
  const f = fSliceYears(filters);
  const dyears = f.slice(CHINA_DUAL.years);
  const durb   = f.slice(CHINA_DUAL.urban);
  const dshare = f.slice(CHINA_DUAL.evShare);
  const traces = [
    {
      type: 'scatter', mode: 'lines+markers', name: 'Urbanization (%)',
      x: dyears, y: durb,
      line: { color: PALETTE.accent, width: 3 },
      marker: { color: PALETTE.accent, size: 8 },
      yaxis: 'y',
      hovertemplate: '%{x} · Urban: %{y:.1f}%<extra></extra>',
    },
    {
      type: 'scatter', mode: 'lines+markers', name: 'EV sales share (%)',
      x: dyears, y: dshare,
      line: { color: '#D62828', width: 3 },
      marker: { color: '#D62828', size: 8 },
      yaxis: 'y2',
      hovertemplate: '%{x} · EV share: %{y:.2f}%<extra></extra>',
    },
  ];

  const layout = baseLayout({
    height: 460,
    margin: { l: 64, r: 78, t: 56, b: 56 },
    xaxis: { title: 'Year', tickmode: 'linear', dtick: 2 },
    // Left axis (urbanization) now starts at 0 so the actual slope reads honestly against EV share.
    yaxis: { title: 'Urbanization (%)', range: [0, 100], ticksuffix: '%', gridcolor: '#EEF2F6' },
    // Right axis label muted (slate, not the saturated line red) - much less aggressive on the eye.
    yaxis2: {
      title: 'EV sales share (%)',
      overlaying: 'y', side: 'right', range: [0, 55], ticksuffix: '%',
      gridcolor: 'transparent',
      titlefont: { color: '#475569', size: 13 },
      tickfont:  { color: '#475569', size: 12 },
    },
    legend: { orientation: 'h', x: 0, y: 1.14, font: { size: 13 } },
    shapes: [
      // Post-2020 acceleration band
      { type: 'rect', xref: 'x', yref: 'paper',
        x0: 2020, x1: 2024, y0: 0, y1: 1,
        fillcolor: 'rgba(214,40,40,0.06)', line: { width: 0 } },
      // 2017 NEV credit mandate vertical line (matches the inflection chart on the Adoption tab)
      { type: 'line', xref: 'x', yref: 'paper',
        x0: 2017, x1: 2017, y0: 0, y1: 1,
        line: { color: '#D62828', width: 1, dash: 'dot' } },
    ],
    annotations: [
      { x: 2022, y: 1.02, xref: 'x', yref: 'paper',
        text: 'Post-2020 acceleration: 0.01% → 48% share', showarrow: false,
        font: { size: 11, color: '#D62828', family: FONT_MONO },
        bgcolor: 'rgba(255,255,255,0.95)', borderpad: 3 },
      // 2017 NEV mandate marker - same policy event called out on the Adoption tab
      { x: 2017, y: 1.04, xref: 'x', yref: 'paper',
        text: '★ 2017 NEV credit mandate', showarrow: false,
        font: { size: 11, color: '#D62828', family: FONT_MONO },
        bgcolor: 'rgba(255,255,255,0.97)', bordercolor: '#D62828', borderwidth: 1, borderpad: 3,
        xanchor: 'center' },
    ],
  });

  Plotly.newPlot(el, traces, layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// ML.C - OLS coefficient plot with 95% CI bars
// ---------------------------------------------------------------------
function mountOlsCoefs(el) {
  // OLS_COEFS rows: { feature, coef, lo, hi, p }. These are raw coefficients on log(EV sales).
  // Predictors are NOT on a common scale, so we cannot show "the most important" in one number -
  // instead we plot magnitude with CI and let the chart be a forest plot of the signed effects.
  const rows = [...OLS_COEFS].reverse();
  const labels = rows.map(r => r.feature);
  const coefs = rows.map(r => r.coef);
  const errMinus = rows.map(r => r.coef - r.lo);
  const errPlus  = rows.map(r => r.hi - r.coef);
  const markerColors  = rows.map(r => r.p < 0.05 ? PALETTE.primary : '#FFFFFF');
  const markerOutline = rows.map(r => r.p < 0.05 ? PALETTE.primary : '#94A3B8');
  // Format p-values in scientific notation when very small
  const pText = rows.map(r => {
    if (r.p < 1e-6) return 'p < 1e-6  ★';
    return 'p = ' + r.p.toExponential(1) + '  ★';
  });

  const trace = {
    type: 'scatter', mode: 'markers',
    x: coefs, y: labels,
    marker: { color: markerColors, size: 16, line: { color: markerOutline, width: 2 } },
    error_x: {
      type: 'data', symmetric: false,
      array: errPlus, arrayminus: errMinus,
      color: '#64748B', thickness: 1.5, width: 6,
    },
    text: pText,
    textposition: 'middle right',
    hovertemplate: '<b>%{y}</b><br>β = %{x:.3f}<br>%{text}<extra></extra>',
  };

  const layout = baseLayout({
    autosize: true,
    height: 430,
    margin: { l: 180, r: 36, t: 56, b: 68 },
    // Real coefficient range needs ~[-1.6, 2.6] to show the full CI for electricity_generation_log.
    xaxis: {
      title: { text: 'OLS coefficient (raw)  ·  95% CI  ·  positive = associated with higher EV sales', standoff: 12 },
      range: [-1.7, 2.7], gridcolor: '#EEF2F6',
      dtick: 0.5,
    },
    yaxis: { tickfont: { size: 12, color: '#0F172A' }, automargin: true },
    showlegend: false,
    shapes: [
      // Solid, prominent zero-reference line
      { type: 'line', xref: 'x', yref: 'paper', x0: 0, x1: 0, y0: 0, y1: 1, line: { color: '#475569', width: 2 } },
    ],
    annotations: [
      { xref: 'paper', yref: 'paper', x: 0, y: 1.18, xanchor: 'left',
        text: '<b>Raw OLS coefficients</b>  ·  target = log(EV sales) so coefficients are log-units of sales per unit of predictor.',
        showarrow: false, font: { size: 12, color: '#475569' } },
      { xref: 'paper', yref: 'paper', x: 0, y: 1.08, xanchor: 'left',
        text: '<b>n = 651 country-year observations  ·  R² = 0.696  ·  all p < 0.001</b>',
        showarrow: false, font: { size: 11, color: '#0F172A', family: FONT_MONO },
        bgcolor: '#F1F5F9', borderpad: 4 },
      { xref: 'x', yref: 'paper', x: 0, y: -0.04, xanchor: 'center',
        text: 'β = 0  (null)', showarrow: false,
        font: { size: 10, color: '#475569', family: FONT_MONO } },
    ],
  });

  Plotly.newPlot(el, [trace], layout, PLOT_CONFIG);
}

// ---------------------------------------------------------------------
// ML.D - Actual vs expected EV sales scatter (log-log, 2024)
// Each dot = one country. Diagonal y = x is the "actual = expected" line.
// Above the line = overperformer; below = underperformer.
// ---------------------------------------------------------------------
function mountActualVsExpected(el, filters) {
  const HIGHLIGHT = new Set(['China', 'United Kingdom', 'Norway', 'Japan', 'South Africa']);
  const rows = ADOPTION_GAP_2024.filter(r => fCountryKeep(filters, r.country));

  // Plot on log10 axes so the full range (thousands → millions) is readable.
  const log10 = v => Math.log10(Math.max(v, 1));
  const over = rows.filter(r => r.gapLog >= 0);
  const under = rows.filter(r => r.gapLog < 0);

  const mkTrace = (g, name, color) => ({
    type: 'scatter', mode: 'markers+text', name,
    x: g.map(r => log10(r.expected)),
    y: g.map(r => log10(r.evSales)),
    text: g.map(r => HIGHLIGHT.has(r.country) ? (r.country === 'United Kingdom' ? 'UK' : r.country) : ''),
    textposition: 'top center',
    textfont: { color: '#0F172A', size: 12, family: FONT_MONO },
    customdata: g.map(r => [r.country, r.evSales, r.expected]),
    marker: {
      size: g.map(r => HIGHLIGHT.has(r.country) ? 16 : 10),
      color: color, opacity: 0.78,
      line: { color: g.map(r => HIGHLIGHT.has(r.country) ? '#0F172A' : '#fff'),
              width: g.map(r => HIGHLIGHT.has(r.country) ? 2.2 : 1) },
    },
    hovertemplate: '<b>%{customdata[0]}</b><br>Actual EV sales: %{customdata[1]:,.0f}'
      + '<br>OLS-expected: %{customdata[2]:,.0f}<extra>' + name + '</extra>',
  });

  // Diagonal reference line: actual = expected.
  const allX = rows.map(r => log10(r.expected)).concat(rows.map(r => log10(r.evSales)));
  const lo = Math.min(...allX) - 0.3, hi = Math.max(...allX) + 0.3;
  const diag = {
    type: 'scatter', mode: 'lines', name: 'actual = expected',
    x: [lo, hi], y: [lo, hi],
    line: { color: '#475569', dash: 'dash', width: 2 },
    hoverinfo: 'skip',
  };

  const traces = [
    diag,
    mkTrace(over, 'Overperformers', PALETTE.success),
    mkTrace(under, 'Underperformers', PALETTE.danger),
  ];

  // Extra headroom on the y-axis so the top-right point's text label (China) isn't clipped.
  const yHi = hi + 0.35;
  const layout = baseLayout({
    height: 540,
    margin: { l: 72, r: 36, t: 40, b: 96 },
    xaxis: { title: { text: 'Expected EV sales (OLS) — log₁₀ scale', standoff: 10 }, range: [lo, hi], gridcolor: '#EEF2F6' },
    yaxis: { title: { text: 'Actual EV sales — log₁₀ scale', standoff: 10 }, range: [lo, yHi], gridcolor: '#EEF2F6' },
    legend: { orientation: 'h', x: 0.5, xanchor: 'center', y: -0.2, font: { size: 12 }, itemsizing: 'constant' },
    annotations: [
      { xref: 'paper', yref: 'paper', x: 0.02, y: 0.98, xanchor: 'left', showarrow: false,
        text: '▲ above diagonal = overperformers', font: { size: 11, color: PALETTE.success, family: FONT_MONO } },
      { xref: 'paper', yref: 'paper', x: 0.98, y: 0.06, xanchor: 'right', showarrow: false,
        text: '▼ below diagonal = underperformers', font: { size: 11, color: PALETTE.danger, family: FONT_MONO } },
    ],
  });

  Plotly.newPlot(el, traces.filter(t => !t.x || t.x.length), layout, PLOT_CONFIG);
}

// Expose
Object.assign(window, {
  mountFleetSalesShare, mountStockByPowertrain, mountChargersWorld, mountModeMixPies,
  mountSalesStockBubbles, mountBarRace, mountGrowthCompare, mountInflection,
  mountInfraVsEvs, mountStressTest,
  mountTop20Mix, mountTurnoverGap,
  mountSocio, mountForecast,
  mountChoropleth, mountAdoptionUrban, mountGasEmissions,
  mountAdoptionGapBar, mountChinaDual, mountOlsCoefs, mountActualVsExpected,
});
