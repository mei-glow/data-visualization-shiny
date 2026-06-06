// =====================================================================
// E-Mobility Dashboard - top-level React app
// =====================================================================

const { useState, useEffect, useRef, useMemo, createContext, useContext } = React;

// -------- Icons (inline strokes; original artwork) --------
const I = {
  globe:    (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg>,
  trend:    (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M3 17l6-6 4 4 8-9"/><path d="M14 6h7v7"/></svg>,
  plug:     (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M9 3v5M15 3v5M6 8h12v3a6 6 0 0 1-6 6 6 6 0 0 1-6-6V8z"/><path d="M12 17v4"/></svg>,
  bolt:     (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" {...p}><path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/></svg>,
  city:     (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M3 21h18M5 21V7l5-3v17M14 21V10l5-2v13"/><path d="M7 9h1M7 12h1M7 15h1M16 13h1M16 16h1"/></svg>,
  target:   (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>,
  brain:    (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M9 3a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5 3 3 0 0 0 2 5v1a3 3 0 0 0 6 0V3a3 3 0 0 0-3 0z"/><path d="M15 3a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-2 5v1a3 3 0 0 1-6 0"/></svg>,

  download: (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M12 3v12m0 0l-4-4m4 4l4-4M5 21h14"/></svg>,
  copy:     (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>,
  expand:   (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.7" {...p}><path d="M4 10V4h6M20 14v6h-6M4 4l7 7M20 20l-7-7"/></svg>,
  play:     (p) => <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" {...p}><path d="M4 3l9 5-9 5z"/></svg>,
  pause:    (p) => <svg viewBox="0 0 16 16" width="14" height="14" fill="currentColor" {...p}><rect x="4" y="3" width="3" height="10"/><rect x="9" y="3" width="3" height="10"/></svg>,
  chev:     (p) => <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" {...p}><path d="M9 6l6 6-6 6"/></svg>,
  filter:   (p) => <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.6" {...p}><path d="M3 5h18l-7 9v6l-4-2v-4z"/></svg>,
};

// ----- Tab manifest (Forecasting tab removed per request; its forecast story is now part of the ML tab) -----
const TABS = [
  { id: 0, label: 'Overview',                 icon: I.globe,  key: 'overview' },
  { id: 1, label: 'Adoption Trends',          icon: I.trend,  key: 'adoption' },
  { id: 2, label: 'Infrastructure & Demand',  icon: I.plug,   key: 'infra' },
  { id: 3, label: 'Market Composition',       icon: I.bolt,   key: 'market' },
  { id: 4, label: 'Socioeconomic & Policy',   icon: I.city,   key: 'socio' },
  { id: 5, label: 'ML / Causality',           icon: I.brain,  key: 'ml' },
];

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
  ev: 'ALL',
};

function FilterStatusBar() {
  const f = useFilters();
  if (!f) return null;
  const { state, set, reset } = f;
  const chips = [];
  if (state.yearMin !== DEFAULT_FILTERS.yearMin || state.yearMax !== DEFAULT_FILTERS.yearMax) {
    chips.push({ k: 'years', label: `Years ${state.yearMin}-${state.yearMax}`, clear: () => set({ yearMin: DEFAULT_FILTERS.yearMin, yearMax: DEFAULT_FILTERS.yearMax }) });
  }
  if (state.country !== 'ALL') chips.push({ k: 'country', label: `Country: ${state.country}`, clear: () => set({ country: 'ALL' }) });
  if (state.income !== 'ALL')  chips.push({ k: 'income',  label: `Development: ${state.income}`,   clear: () => set({ income: 'ALL' }) });
  if (state.ev !== 'ALL')      chips.push({ k: 'ev',      label: `Powertrain: ${state.ev}`,    clear: () => set({ ev: 'ALL' }) });
  if (!chips.length) return null;
  return (
    <div className="filter-status">
      <span className="filter-status-label">Active filters</span>
      {chips.map(c => (
        <button key={c.k} className="filter-status-chip" onClick={c.clear} title="Click to clear">
          {c.label} <span className="filter-status-x">×</span>
        </button>
      ))}
      <button className="filter-status-reset" onClick={reset}>Reset all</button>
    </div>
  );
}

// =====================================================================
// Reusable bits
// =====================================================================
function ChartCard({ title, sub, callout, children, mount, deps = [] }) {
  const cardRef = useRef(null);
  const hostRef = useRef(null);
  const filters = useFilters();
  const fState = filters && filters.state;
  const safeName = (title || 'chart').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || 'chart';
  const getPlot = () => {
    const host = hostRef.current;
    if (!host) return null;
    return host.classList && host.classList.contains('js-plotly-plot')
      ? host
      : host.querySelector('.js-plotly-plot');
  };
  const copyText = async (text) => {
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
      scale: 2,
    }).then((url) => {
      const a = document.createElement('a');
      a.href = url;
      a.download = safeName + '.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }).catch((err) => {
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
      customdata: trace.customdata || null,
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
      try { Plotly.Plots.resize(hostRef.current); } catch (e) {}
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
        try { Plotly.Plots.resize(hostRef.current); } catch (e) {}
        const raf2 = requestAnimationFrame(() => {
          try { Plotly.Plots.resize(hostRef.current); } catch (e) {}
        });
        hostRef.current && (hostRef.current.__raf2 = raf2);
      });
      const t = setTimeout(() => { try { Plotly.Plots.resize(hostRef.current); } catch (e) {} }, 250);
      return () => {
        window.removeEventListener('resize', handle);
        cancelAnimationFrame(raf1);
        if (hostRef.current && hostRef.current.__raf2) cancelAnimationFrame(hostRef.current.__raf2);
        clearTimeout(t);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    fState && fState.country, fState && fState.income,
    fState && fState.ev, fState && fState.yearMin, fState && fState.yearMax,
    ...deps,
  ]);
  return (
    <div className="card" ref={cardRef}>
      <div className="chart-head">
        <div>
          <div className="chart-title">{title}</div>
          {sub && <div className="chart-sub">{sub}</div>}
        </div>
        <div className="chart-actions">
          <button className="icon-btn" title="Download PNG" onClick={handleDownload}><I.download /></button>
          <button className="icon-btn" title="Copy data" onClick={handleCopyData}><I.copy /></button>
          <button className="icon-btn" title="Fullscreen" onClick={handleFullscreen}><I.expand /></button>
        </div>
      </div>
      <div className="chart-host" ref={hostRef}>{children}</div>
      {callout && (
        <div className="chart-callout">
          <div className="chart-callout-tag">Takeaway</div>
          <div className="chart-callout-body">{callout}</div>
        </div>
      )}
    </div>
  );
}

function SectionHeader({ eyebrow, title, sub }) {
  return (
    <div className="section-band">
      <div className="container has-filter">
        <div className="eyebrow">{eyebrow}</div>
        <h1 className="section-title">{title}</h1>
        <div className="section-sub">{sub}</div>
      </div>
    </div>
  );
}

function Insight({ tagLabel, children, chips }) {
  return (
    <div className="insight">
      <div className="insight-tag">{tagLabel || 'Policy brief'}</div>
      <div>
        <div className="insight-body">{children}</div>
        <div className="chips">
          {chips.map((c, i) => <span key={i} className={"chip " + (c.tone || 'slate')}>{c.label}</span>)}
        </div>
      </div>
    </div>
  );
}

function Kpi({ label, value, sub, accent }) {
  const style = accent ? { borderLeftColor: accent } : {};
  const valStyle = accent ? { color: accent } : {};
  return (
    <div className="kpi" style={style}>
      <div className="kpi-label">{label}</div>
      <div className="kpi-val" style={valStyle}>{value}</div>
      <div className="kpi-sub">{sub}</div>
    </div>
  );
}

// =====================================================================
// Left filter panel
// =====================================================================
function FilterPanel({ open, onToggle }) {
  const f = useFilters();
  if (!f) return null;
  const { state, set, reset } = f;

  const countries = ['ALL', ...Array.from(new Set([
    ...Object.keys(window.COUNTRY_STOCK_M || {}),
    ...(window.SOCIO_2024 || []).map(r => r.country),
    ...(window.CHOROPLETH_2024 || []).map(r => r.name),
    ...(window.STRESS_2024 || []).map(r => r.country),
    ...(window.TOP20_MIX || []).map(r => r.country),
  ].filter(c => c && c !== 'Rest of the world'))).sort((a, b) => a.localeCompare(b))];

  return (
    <aside className={"filter-panel " + (open ? 'open' : 'closed')} aria-label="Filters">
      <button
        type="button"
        className="filter-toggle"
        aria-label={open ? 'Close filters' : 'Open filters'}
        aria-expanded={open}
        onClick={onToggle}
      >
        <I.chev />
      </button>
      <div className="filter-panel-body">
      <div className="fp-title"><I.filter /> Filters</div>

      <h4>Year range</h4>
      <div className="fp-year">
        <input type="number" min={2010} max={2024} value={state.yearMin}
          onChange={e => set({ yearMin: Math.min(parseInt(e.target.value||2010,10), state.yearMax) })} />
        <span style={{ color: 'var(--muted)' }}>→</span>
        <input type="number" min={2010} max={2024} value={state.yearMax}
          onChange={e => set({ yearMax: Math.max(parseInt(e.target.value||2024,10), state.yearMin) })} />
      </div>

      <h4>Development Groups</h4>
      <div className="fp-segments">
        {[
          { v:'ALL',   label: 'All development groups' },
          { v:'High',  label: 'Developed' },
          { v:'Upper-middle', label: 'Developing' },
          { v:'Lower-middle', label: 'Developing, lower income' },
        ].map(opt => (
          <button key={opt.v} className={"fp-seg " + (state.income === opt.v ? 'active' : '')}
            onClick={() => set({ income: opt.v })}>
            <span className="dot" /> {opt.label}
          </button>
        ))}
      </div>

      <h4>Country</h4>
      <select value={state.country} onChange={e => set({ country: e.target.value })}>
        {countries.map(c => <option key={c} value={c}>{c === 'ALL' ? '- All countries -' : c}</option>)}
      </select>
      <div className="fp-meta">When set, country-level charts highlight or filter to this market.</div>

      <h4>EV type</h4>
      <div className="fp-segments">
        {['ALL','BEV','PHEV','FCEV'].map(t => (
          <button key={t} className={"fp-seg " + (state.ev === t ? 'active' : '')}
            onClick={() => set({ ev: t })}>
            <span className="dot" /> {t === 'ALL' ? 'All powertrains' : t}
          </button>
        ))}
      </div>

      <button className="fp-clear" onClick={reset}>Reset all filters</button>

      <div className="fp-meta" style={{ marginTop: 18, paddingTop: 14, borderTop: '1px solid var(--border)' }}>
        <strong style={{ color: 'var(--ink-2)' }}>Cross-chart filtering.</strong>{' '}
        Filters apply to country/income-aware charts (bubble, stress test, socio, choropleth). Time-series
        charts respect the year range.
      </div>
      </div>
    </aside>
  );
}

// =====================================================================
// Tab 0 - Overview
// =====================================================================
function TabOverview() {
  return (
    <div className="tab-body">
      <SectionHeader
        eyebrow="GLOBAL SNAPSHOT"
        title="The Global EV Transition, at a Glance"
        sub="Where the world stands in 2024 - and where it's headed by 2030."
      />
      <div className="container has-filter" style={{ marginTop: 24 }}>
        <div className="kpi-row">
          <Kpi label="EV cars on the road, 2024" value="58.1 M" sub="All powertrains · global" />
          <Kpi label="Share of car stock, 2024" value="4.5 %" sub="Of all cars on the road · global" />
          <Kpi label="Share of new car sales, 2024" value="22 %" sub="global" />
          <Kpi label="Public charging points, 2024" value="5.40 M" sub="Million individual connectors of fast and slow chargers · global" />
        </div>

        <div className="grid-stack">
          <ChartCard
            title="Current and projected trends of EV Car Fleet & Sales Share"
            sub="IEA STEPS (Stated Policies Scenario) is the trajectory implied by today's announced policies - not an aspiration. Bars: EV stock (M, left axis). Markers: sales share (%, right axis)."
            mount={mountFleetSalesShare}
            callout={<><strong>Stock and sales diverged</strong> - sales share already at 22%, but only 4.5% of the on-road fleet is electric. The 2030s will be the fleet-turnover decade.</>}
          />

          <div className="grid-2">
            <ChartCard
              title="World EV car stocks by powertrain over time"
              sub="BEV and PHEV dominate the global EV powertrain mix; FCEV remains a sliver. Stacked area shows the relative scale of each."
              mount={mountStockByPowertrain}
              callout={<>BEVs make up <strong>~68% of the global EV fleet</strong> by 2024 and the gap with PHEV is widening.</>}
            />
            <ChartCard
              title="World charging points over time"
              sub="Slow public chargers (Level 1/2, AC) lead in count and have stayed ahead of fast DC chargers throughout - Slow makes up ~58% of the stack in 2024."
              mount={mountChargersWorld}
              callout={<>Slow chargers carry the network; fast chargers are growing faster on a percentage basis (3.5× since 2020) but still only <strong>44.2%</strong> of public points.</>}
            />
          </div>

          <ChartCard
            title="EV stock proportion by mode and powertrain, 2024"
            sub="Within each powertrain, which vehicle modes dominate."
            mount={mountModeMixPies}
            callout={<>BEVs span all three modes -> BEV predominantly deployed in 2-and-3 wheelers, while also maintaining a presence in passenger car.</>}
          />
        </div>

        <Insight
          tagLabel="Hook"
          chips={[
            { label: '58.1 M EVs (2024)',         tone: 'teal'  },
            { label: '22% sales share',           tone: 'amber' },
            { label: '232 M projected (STEPS 2030)', tone: 'coral' },
          ]}
        >
          <p>From 2010 to 2024, the global EV fleet grew from <strong>~20,000 cars to 58.1 million</strong> - a compound annual growth rate of approximately <strong>67%</strong>. Sales share of new cars now stands at <strong>22%</strong>, while stock share lags at <strong>4.5%</strong>, indicating the world is mid-transition: the <em>sales</em> shift has happened, the <em>fleet</em> turnover is still ahead. The IEA STEPS scenario projects <strong>232 M EVs and a 42% sales share by 2030</strong>. BEVs dominate the global Cars segment, with China alone accounting for roughly <strong>59%</strong> of the world EV fleet.</p>
        </Insight>
      </div>
    </div>
  );
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
    2010: 'USA', 2011: 'USA', 2012: 'USA', 2013: 'USA', 2014: 'USA',
    2015: 'USA', 2016: 'China', 2017: 'China', 2018: 'China', 2019: 'China',
    2020: 'China', 2021: 'China', 2022: 'China', 2023: 'China', 2024: 'China',
  };

  return (
    <div className="tab-body">
      <SectionHeader
        eyebrow="ADOPTION TRENDS"
        title="Who is winning the EV race?"
        sub="Three big players, one inflection point, and the moment growth went exponential."
      />
      <div className="container has-filter" style={{ marginTop: 24 }}>
        <div className="grid-stack">
          <ChartCard
            title="EV sales and on-the-road vehicles by country and region"
            sub="Bubble = EV stock (millions). Aggregates (CHN, APAC, EUR…) plotted alongside countries."
            mount={mountSalesStockBubbles}
            callout={<>China (34M stock, 11.2M sales) dwarfs every other single market - its bubble is <strong>~5× larger</strong> than the USA's.</>}
          />

          <div className="card">
            <div className="chart-head">
              <div>
                <div className="chart-title">Top-12 EV car stock by country - {year}</div>
                <div className="chart-sub">
                  Sorted by rank each year. Leader in <strong>{year}</strong>: <strong style={{ color: leaders[year] === 'China' ? '#D62828' : '#1D4E89' }}>{leaders[year]}</strong>.
                  &nbsp;·&nbsp; USA led 2010-2015; <strong>China overtook in 2016</strong> and has held the lead since.
                </div>
              </div>
              <div className="chart-actions">
                <button className="icon-btn" title="Download PNG"><I.download /></button>
                <button className="icon-btn" title="Fullscreen"><I.expand /></button>
              </div>
            </div>
            <div style={{ padding: '6px 20px 0', display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {[
                ['China', '#D62828'], ['USA', '#1D4E89'], ['Germany', '#FFB703'],
                ['France', '#7209B7'], ['UK', '#9D0208'], ['Norway', '#0077B6'],
                ['Netherlands', '#118AB2'], ['Sweden', '#06A77D'], ['Japan', '#BC4749'],
                ['Korea', '#FF006E'], ['Italy', '#D62246'], ['Canada', '#9B2226'],
              ].map(([c, col]) => (
                <span key={c} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 11, color: 'var(--ink-2)', fontFamily: 'var(--font-mono)',
                }}>
                  <span style={{ width: 10, height: 10, borderRadius: 2, background: col }} />
                  {c}
                </span>
              ))}
            </div>
            <div ref={raceRef} className="chart-host" />
            <div className="scrubber">
              <button className="play" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? <I.pause /> : <I.play />}
              </button>
              <div className="yr-label">Year: {year}</div>
              <input
                type="range" min={2010} max={2024} step={1} value={year}
                onChange={e => { if (playing) togglePlay(); setYear(parseInt(e.target.value, 10)); }}
              />
            </div>
            <div className="chart-callout">
              <div className="chart-callout-tag">Takeaway</div>
              <div className="chart-callout-body">Bars re-rank every year, so you can watch position changes directly. Notable: Norway briefly entered the top-5 in 2017-2019, then dropped as China/Europe scaled.</div>
            </div>
          </div>

          <ChartCard
            title="EV Growth Comparison: China, USA, Europe (2016-2024)"
            sub="Stacked stock bars (left axis) + dashed sales-share line (right axis), one panel per region - same scales for direct comparison."
            mount={mountGrowthCompare}
            callout={<>China hit a <strong>48% sales share</strong> in 2024; Europe is at 24% and the USA at 10.5% - three speeds, same direction.</>}
          />

          <ChartCard
            title="When did exponential growth start?"
            sub="China vs USA EV sales with policy event annotations and inflection markers. Shaded bands mark synchronized global anomalies (COVID-19, post-COVID rebound, 2022 oil-price spike)."
            mount={mountInflection}
            callout={<>China's curve bends sharply around <strong>2015</strong> (post-NEV-credit-mandate); the USA's inflection comes ~3 years later in <strong>2018</strong>.</>}
          />
        </div>

        <Insight
          tagLabel="Race"
          chips={[
            { label: 'China overtook USA: 2016', tone: 'teal' },
            { label: 'Policy precedes inflection by ~1-2 yrs', tone: 'amber' },
            { label: 'Top 3: China · USA · Europe', tone: 'slate' },
          ]}
        >
          <p>China and the USA dominate EV sales in absolute terms (<strong>CHN 11.2M</strong> sales in 2024, <strong>USA ~1.6M</strong>), with Europe collectively rivalling the USA. China started the race behind the USA in 2012, drew level around 2015, and decisively overtook the USA in <strong>2016</strong> - a lead that has compounded ever since. The <strong>2017 China NEV credit mandate</strong> and the <strong>2020 charging infrastructure rollout</strong> map directly to the inflection points where China's curve bent upward most sharply. The synchronized COVID-19 dip (2020) and post-COVID rebound (2021) appear in nearly every country's series, suggesting global shocks dominate idiosyncratic policy in their year of impact.</p>
        </Insight>
      </div>
    </div>
  );
}

// =====================================================================
// Tab 2 - Infrastructure & Demand
// =====================================================================
function TabInfra() {
  return (
    <div className="tab-body">
      <SectionHeader
        eyebrow="INFRASTRUCTURE & DEMAND"
        title="Chicken or Egg?"
        sub="Do chargers lead EVs, or follow them?"
      />
      <div className="container has-filter" style={{ marginTop: 24 }}>
        <div className="grid-stack">
          <ChartCard
            title="Chargers vs EVs: do they grow together?"
            sub="World, historical. Top: EVs (M). Bottom: chargers (M), Fast + Slow stacked. Compare shapes, not magnitudes. Synced reference line at 2020."
            mount={mountInfraVsEvs}
            callout={<>EV stock and charger count grow in lockstep until ~2020, then EVs <strong>pull ahead</strong> - adoption is outpacing infrastructure.</>}
          />

          <ChartCard
            title="Adoption trend with urbanization overlay"
            sub="World EV sales share (bars, left axis) against urbanization rate (line, right axis, full 0-100% scale). Both rise - but is urbanization a leading signal, or just a parallel trend?"
            mount={mountAdoptionUrban}
            callout={<>The two curves move together: every 1pp rise in urban share since 2015 has coincided with roughly <strong>3pp</strong> of EV sales-share gain. Association, not causation - see the Granger test below.</>}
          />

          {/* GRANGER causality - belongs here as the quantitative answer to "chicken or egg?" */}
          <div className="card">
            <div className="chart-head">
              <div>
                <div className="chart-title">Granger causality · Urbanization → EV sales share</div>
                <div className="chart-sub">Cross-reference for the Infrastructure ↔ adoption question above.</div>
              </div>
            </div>
            <div style={{ padding: '4px 20px 16px' }}>
              <p style={{ fontSize: 14, color: 'var(--ink-2)', lineHeight: 1.65, marginTop: 4, marginBottom: 14 }}>
                <strong>What this tests.</strong> Granger causality asks a forecasting question: <em>does knowing past urbanization values help predict future EV sales share, beyond what EV sales share's own past values already tell you?</em> If yes (low p-value), urbanization is said to <em>Granger-cause</em> EV adoption. If no, the two are correlated but neither is provably leading the other in time.
              </p>

              {/* Verdict banner - single clear takeaway above the technical table */}
              <div className="granger-verdict">
                <div className="granger-verdict-tag">Verdict</div>
                <div>
                  <strong>No Granger causality at either lag tested (α = 0.05).</strong> F-tests on lag-1 and lag-2 both produce p &gt; 0.33.
                  Urbanization and EV adoption co-move on China's series, but on this data urbanization does not provably <em>lead</em> EV adoption in time.
                </div>
              </div>

              <table className="data">
                <thead>
                  <tr>
                    <th>Lag (years)</th>
                    <th className="num">SSR F-stat</th>
                    <th className="num">F p-value</th>
                    <th className="num">χ² p-value</th>
                    <th>Reject H₀?</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { lag: 1, F: 1.021, p: 0.334, chi: 0.254 },
                    { lag: 2, F: 1.208, p: 0.348, chi: 0.140 },
                  ].map(g => (
                    <tr key={g.lag}>
                      <td>{g.lag}</td>
                      <td className="num">{g.F.toFixed(3)}</td>
                      <td className="num">{g.p.toFixed(3)}</td>
                      <td className="num">{g.chi.toFixed(3)}</td>
                      <td style={{ color: 'var(--ink-2)' }}>
                        No - fail to reject
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: 12, fontSize: 11, color: 'var(--muted)', fontFamily: 'var(--font-mono)' }}>
                Source: <code style={{ background: 'var(--surface)', padding: '0 4px', borderRadius: 3 }}>granger_china_results.csv</code> · Method: statsmodels' <code style={{ background: 'var(--surface)', padding: '0 4px', borderRadius: 3 }}>grangercausalitytests</code> on China's annual urban-pct → EV-share series (2010-2024, n = 15).
              </div>
            </div>
            <div className="chart-callout">
              <div className="chart-callout-tag">Takeaway</div>
              <div className="chart-callout-body">No statistically detectable lead-lag between urbanization and EV adoption at α = 0.05. Chickens AND eggs - they emerge together. The full ML evidence (cross-sectional OLS, model bake-off) lives in the ML / Causality tab.</div>
            </div>
          </div>

          <div className="grid-2-wide-left">
            <ChartCard
              title="Charger-to-EV stress test, 2024"
              sub="X = EV stock (log, M). Y = EVs per public charger (higher = worse). Bubble = ∝√stock."
              mount={mountStressTest}
              callout={<>The <strong>1:12 global average</strong> hides huge dispersion - Korea sits at 1:2, New Zealand at 1:78.</>}
            />
            <div className="card">
              <div className="chart-head">
                <div>
                  <div className="chart-title">Worst charger-to-EV ratios</div>
                  <div className="chart-sub">Top 5 markets where drivers compete hardest for plugs.</div>
                </div>
              </div>
              <div style={{ padding: '0 16px 16px' }}>
                <table className="data">
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th className="num">EV stock (M)</th>
                      <th className="num">Chargers</th>
                      <th className="num">EVs / charger</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { c:'New Zealand', s:0.113, ch:1440,   r:78.5, sev: 1 },
                      { c:'Australia',   s:0.302, ch:6700,   r:45.1, sev:.74 },
                      { c:'Mexico',      s:0.068, ch:1850,   r:36.8, sev:.55 },
                      { c:'USA',         s:6.319, ch:193000, r:32.7, sev:.45 },
                      { c:'Norway',      s:0.960, ch:31000,  r:31.0, sev:.40 },
                    ].map(row => (
                      <tr key={row.c}>
                        <td>{row.c}</td>
                        <td className="num">{row.s.toFixed(3)}</td>
                        <td className="num">{row.ch.toLocaleString()}</td>
                        <td className="heat" style={{ background: `rgba(231,111,81,${0.10 + row.sev*0.45})`, color: '#7C2B17' }}>
                          {row.r.toFixed(1)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 10 }}>
                  Best in class: Netherlands ~ <strong>1 : 5</strong>, Korea ~ <strong>1 : 2</strong>.
                </div>
              </div>
            </div>
          </div>
        </div>

        <Insight
          tagLabel="Stress"
          chips={[
            { label: 'Global ratio: 1:12 (2024)', tone: 'amber' },
            { label: 'Worst: New Zealand 1:78',   tone: 'coral' },
            { label: 'Best: Netherlands & dense EU', tone: 'teal' },
          ]}
        >
          <p>At the global level, EV deployment and public charging have grown together - chargers slightly led in absolute terms during the 2010s, but EV stock has been <strong>outpacing charger growth since around 2020</strong>. By 2024, the world adds roughly <strong>12 EVs for every new public charger</strong>. Per-country stress varies enormously: New Zealand (1:78), Australia (1:45), and Mexico (1:37) face the most acute charging deficits, while the USA - despite having the fourth-largest charger fleet (193,000 points) - still has <strong>33 EVs per charger</strong> because adoption scaled faster than infrastructure. European countries with dense public networks (Netherlands, France, Germany) sit at the favorable end of the spectrum.</p>
        </Insight>
      </div>
    </div>
  );
}

// =====================================================================
// Tab 3 - Market Composition (now includes choropleth)
// =====================================================================
function TabMarket() {
  return (
    <div className="tab-body">
      <SectionHeader
        eyebrow="MARKET COMPOSITION"
        title="What kind of EV, and where?"
        sub="BEV vs PHEV split, the global geography of adoption, and whether the fleet is turning over fast enough for 2030."
      />
      <div className="container has-filter" style={{ marginTop: 24 }}>
        <div className="grid-stack">
          <ChartCard
            title="EV sales share by country, 2024 - world map"
            sub="Choropleth of EV share of new car sales. Darker = higher share. Scale capped at 60% so country variation is visible. Gray = no data reported."
            mount={mountChoropleth}
            callout={<>Norway (92%) and the Nordics lead by a wide margin; the Americas (ex-Canada) and most of Asia outside China lag below 10%.</>}
          />

          <ChartCard
            title="The turnover gap: sales share vs stock share"
            sub="World, cars. Solid = historical. Dashed + diamond = STEPS projection. The widening gap is the single most important slide for 2030 planning."
            mount={mountTurnoverGap}
            callout={<>By 2030, sales hit 42% but stock only reaches ~15%: <strong>27pp gap</strong> = unfinished fleet turnover. The 2030s will be the fleet-turnover decade.</>}
          />

          <ChartCard
            title="Top 10 EV markets proportion, 2024"
            sub="BEV vs PHEV share of EV car stock, per country. PHEV-dominant rows are highlighted. FCEV is <1% in every market and is excluded for clarity."
            mount={mountTop20Mix}
            callout={<>7 out of 10 markets are <strong>BEV-dominant</strong>; PHEV holdouts (Finland, Italy, Spain) cluster in countries with weaker fast-charging networks.</>}
          />
        </div>

        <Insight
          tagLabel="Composition"
          chips={[
            { label: 'BEV-dominant in 7/10 top markets', tone: 'teal' },
            { label: 'Sales-stock gap: 27 pp by 2030',     tone: 'amber' },
            { label: 'Fleet turnover = the 2030s story',   tone: 'slate' },
          ]}
        >
          <p><strong>BEVs dominate</strong> the top 10 EV markets, accounting for 60%+ of EV stock in <strong>7 of them</strong>. China (68% BEV), USA (75%), and Norway (78%) are clearly BEV-led, while markets like Finland (42% BEV) and Spain (47%) still rely heavily on PHEVs. PHEVs remain a meaningful transitional technology in markets with weaker fast-charging networks or stronger PHEV-favorable subsidies. The <strong>fleet turnover gap</strong> is the central tension of the next decade: by 2030, sales share is projected to reach <strong>42%</strong> while stock share only catches up to <strong>~15%</strong> - meaning the 2020s are the <em>sales</em> transition and the 2030s will be the <em>fleet</em> transition.</p>
        </Insight>
      </div>
    </div>
  );
}

// =====================================================================
// Tab 4 - Socioeconomic & Policy (with gas + emissions overlay)
// =====================================================================
function TabSocio() {
  return (
    <div className="tab-body">
      <SectionHeader
        eyebrow="SOCIOECONOMIC & POLICY"
        title="Is EV adoption equitable?"
        sub="EV penetration vs charging infrastructure density, gas prices, and transport emissions."
      />
      <div className="container has-filter" style={{ marginTop: 24 }}>
        <div className="grid-stack">
          <ChartCard
            title="Adoption vs infrastructure density, 2024"
            sub="X = public chargers per million (log scale). Y = EV sales share %. Bubble size ∝ √(EV stock). Color = income group. Outliers and big markets are labeled by default; hover any bubble for full detail."
            mount={mountSocio}
            callout={<>A near-linear ladder on log-scale chargers: every <strong>10×</strong> in charger density predicts ~25pp more sales share.</>}
          />

          <ChartCard
            title="Gas prices, transport emissions, and EV adoption"
            sub="Bars: world transport CO₂ (Gt, left). Solid line: average gas price (USD/L, right). Dotted: EV sales share (%). Are EVs co-moving with the external pressure to electrify?"
            mount={mountGasEmissions}
            callout={<>Per-capita CO₂ emissions rose through 2019 before declining after 2020, while EV adoption accelerated. Gas-price spikes (2022) align with EV-share accelerations.</>}
          />

          <div className="kpi-row" style={{ marginTop: 4 }}>
            <Kpi label="Median sales share · High income"        value="24.0 %" sub="High-income median (Norway, Sweden, NL, UK…)" accent={INCOME_COLORS.High} />
            <Kpi label="Median sales share · Upper-middle"        value="7.4 %"  sub="China, Costa Rica, Türkiye, Brazil, Mexico"   accent={INCOME_COLORS['Upper-middle']} />
            <Kpi label="Median sales share · Lower-middle"        value="4.7 %"  sub="India, Indonesia, Ukraine, Philippines"      accent={INCOME_COLORS['Lower-middle']} />
            <Kpi label="Outlier · China"                          value="48 %"   sub="Behaves like high-income on adoption"        accent={PALETTE.accent} />
          </div>
        </div>

        <Insight
          tagLabel="Equity"
          chips={[
            { label: 'High income: 24%',        tone: 'teal' },
            { label: 'China is the outlier: 48%', tone: 'amber' },
            { label: '5× gap between tiers',    tone: 'coral' },
          ]}
        >
          <p>EV adoption is sharply stratified by income. The median sales share is <strong>24% in high-income countries, 7.4% in upper-middle-income countries, and 4.7% in lower-middle-income countries</strong> - a five-fold gap between the top and bottom tiers. Within the high-income group, Nordic countries (Norway 92%, Sweden 58%) lead by a wide margin, driven by aggressive tax incentives and dense charging networks. China is the standout exception in the upper-middle tier: at <strong>48% sales share and 2,481 chargers per million people</strong>, it operates closer to high-income leaders than to its income peers. The lower-middle-income group remains pre-adoption in cars, but is leapfrogging into electric two- and three-wheelers (visible in the Overview tab's powertrain × mode breakdown).</p>
        </Insight>
      </div>
    </div>
  );
}

// =====================================================================
// Tab 5 - ML / Causality
// =====================================================================
function TabML() {
  return (
    <div className="tab-body">
      <SectionHeader
        eyebrow="ML & CAUSALITY"
        title="What actually predicts EV adoption?"
        sub="Cross-sectional OLS, country scatter, and model comparison - paired with the time-series Granger evidence from the Infrastructure tab."
      />
      <div className="container has-filter" style={{ marginTop: 24 }}>

        {/* ====================== Non-technical TL;DR ====================== */}
        <div className="ml-intro">
          <div className="ml-intro-eyebrow">In one paragraph</div>
          <p>
            We tested whether urbanization and other country features <em>cause</em> EV adoption in time (Granger test on China's series, in the Infrastructure tab) and how well they <em>describe</em> it (a pooled OLS panel on <strong>53 countries × 15 years</strong>).
            The pooled OLS finds <strong>all five predictors significant at p &lt; 0.001</strong> - electricity-generation capacity is the strongest positive driver, population the strongest negative one (smaller countries punch above their weight in EV sales). But on the China time-series, urbanization does <strong>not</strong> Granger-cause EV adoption - they move together without one provably leading the other.
            On held-out data, <strong>Lasso narrowly tops the model bake-off</strong> (R² = 0.49, MAE = 1.10 log-units ≈ a factor-of-3 miss on the raw sales scale), with Ridge and plain OLS right behind it. Tree-based models trail.
          </p>
        </div>

        {/* ====================== Cross-sectional section ====================== */}
        <div className="section-divider">
          <span className="section-divider-label">Pooled-panel analysis</span>
          <span className="section-divider-meta">53 countries · 2010-2024 · OLS on log(EV sales) &amp; model bake-off</span>
        </div>

        <div className="grid-stack">

          {/* Scatter: urban% vs EV share (2024) */}
          <ChartCard
            title="Urbanization rate vs EV sales share, 2024 (53 countries)"
            sub="Each dot = one country. Size ∝ EV stock volume. The dashed line is the OLS fit on all 53 countries; the dotted line is the fit with Norway excluded (showing the leverage effect). Source: scatter_urban_ev_share_2024.csv."
            mount={mountUrbanScatter}
            callout={<>The cross-sectional fit is weak (R² ≈ 0.1 on this single year alone), but the China outlier shows urbanization alone doesn't determine volume - <strong>policy + scale do</strong>.</>}
          />

          {/* OLS coefficient plot */}
          <ChartCard
            title="OLS coefficients with 95% CI (panel of 53 countries × 15 yrs)"
            sub={<>Pooled regression on log(EV sales) as the target. Bars are 95% confidence intervals. <strong>All five predictors clear p &lt; 0.001</strong> on this large panel. <span style={{ color: 'var(--muted)' }}>Source: ols_final_results.csv.</span></>}
            mount={mountOlsCoefs}
            callout={<>Top three drivers: <strong>electricity-generation capacity</strong> (β = +2.20), <strong>year</strong> (β = +0.48/yr), and <strong>urbanization</strong> (β = +0.027/pp). Population is significantly <em>negative</em> (β = −1.28) - holding everything else constant, smaller countries sell more EVs per capita.</>}
          />

          {/* Model comparison */}
          <ChartCard
            title="Model comparison · test R² and MAE (log-units)"
            sub="Held-out test scores. Lasso narrowly tops the table; tree-based models trail. MAE is in log-units of sales - a value of 1.1 corresponds to a factor-of-3 miss on the raw sales scale. Source: model_comparison_results.csv."
            mount={mountModelCompare}
            callout={<>Lasso wins by ~0.6 percentage-points of R² over plain OLS - inside fold-to-fold noise. Tree-based models likely under-perform because the underlying relationships are largely monotonic on log scale, which suits linear hypotheses.</>}
          />
        </div>

        {/* ====================== Time-series section ====================== */}
        <div className="section-divider" style={{ marginTop: 28 }}>
          <span className="section-divider-label">Time-series view</span>
          <span className="section-divider-meta">single country (China) · 2010-2024 · Granger test cross-reference</span>
        </div>

        <div className="grid-stack">
          {/* China dual-line */}
          <ChartCard
            title="China · urbanization and EV sales share, 2010-2024"
            sub="Both lines rise, but the EV sales share curve hockey-sticks around 2020 while urbanization climbs near-linearly. The two are co-moving, not synchronously. The Infrastructure tab's Granger test (no detectable lead at any lag) confirms this visual reading."
            mount={mountChinaDual}
            callout={<>China's urban share went from 49% → 67%; its EV sales share went from <strong>0.01% → 48%</strong>. Adoption accelerated <em>after</em> urbanization had already plateaued in growth rate.</>}
          />
        </div>

        {/* ====================== Modeling notes (distinct accent) ====================== */}
        <details id="methodology" className="ml-notes methodology-box" open>
          <summary>
            <span className="ml-notes-tag">Methodology</span>
            <span className="methodology-close">open / close</span>
          </summary>
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
              <span className="chip teal">IEA Global EV Outlook 2025 · 2010-2024</span>
              <span className="chip amber">Country, development group, EV type, and year filters</span>
              <span className="chip slate">OLS, Granger, and held-out model comparison</span>
            </div>
            <p>This dashboard combines IEA Global EV Outlook 2025 series with cleaned socioeconomic, energy, emissions, and fuel-price indicators. Country-level charts apply the selected country and development-group filters directly; global trend charts keep the world aggregate unless a comparable country series is available. Shares, stocks, chargers, and sales are shown in their original reported units, while bubble areas use square-root scaling so large markets remain readable without hiding smaller markets.</p>
            <p>The modeling section is descriptive, not causal proof. The pooled OLS uses a 53-country × 15-year panel with log(EV sales) as the target, and the model comparison reports held-out R² and MAE in log units. The China Granger test is included as a time-series check: it asks whether past urbanization improves forecasts of EV adoption, and it does not find a statistically useful lead at the tested lags. Results should be read as associations and forecasting diagnostics, not policy counterfactuals.</p>
          </div>
        </details>

      </div>
    </div>
  );
}
// =====================================================================
// Footer
// =====================================================================
function Footer({ onMethodology }) {
  return (
    <div className="footer">
      <div className="container has-filter">
        <div className="footer-inner">
          <div>
            <h5>Data sources</h5>
            <div className="source">
              <strong>IEA Global EV Outlook 2025</strong><br/>
              External: population, urbanization, gas price &amp; emissions<br/>
              <span style={{ color: 'var(--muted)' }}>14,962 rows × 10 cols · 2010-2024 + 2030 STEPS</span>
            </div>
          </div>
          <div>
            <h5>Resources</h5>
            <div className="links">
              <a href="https://github.com/mei-glow/data-visualization-shiny" target="_blank" rel="noreferrer">GitHub repo</a>
              <a href="#methodology" onClick={onMethodology}>Methodology · ML / Causality</a>
              <a href="https://github.com/mei-glow/data-visualization-shiny/tree/main/data" target="_blank" rel="noreferrer">Download raw data</a>
            </div>
          </div>
          <div>
            <h5>Team</h5>
            <div className="credits-list">
              <div><b>Pham Quynh Trang</b> · Lead, UI / UX</div>
              <div><b>Nguyen Thi Bao Tien</b> · Data pipeline</div>
              <div><b>Tran Phuong Mai</b> · Dashboard build</div>
              <div><b>Nguyen Khanh Ngoc</b> · ML &amp; forecasting</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MethodologyModal({ onClose }) {
  return (
    <div className="method-modal" role="dialog" aria-modal="true" aria-labelledby="method-title">
      <div className="method-modal-backdrop" onClick={onClose}></div>
      <div className="method-modal-panel">
        <button className="method-modal-close" onClick={onClose} aria-label="Close methodology">×</button>
        <div className="ml-notes-tag">Methodology</div>
        <h3 id="method-title">How this dashboard was built</h3>
        <div className="chips" style={{ marginTop: 8, marginBottom: 14 }}>
          <span className="chip teal">IEA Global EV Outlook 2025 · 2010-2024</span>
          <span className="chip amber">Country, development group, EV type, and year filters</span>
          <span className="chip slate">OLS, Granger, and held-out model comparison</span>
        </div>
        <p>This dashboard combines IEA Global EV Outlook 2025 series with cleaned socioeconomic, energy, emissions, and fuel-price indicators. Country-level charts apply the selected country and development-group filters directly; global trend charts keep the world aggregate unless a comparable country series is available.</p>
        <p>Shares, stocks, chargers, and sales are shown in their original reported units. Bubble areas use square-root scaling so large markets remain readable without hiding smaller markets. Model outputs are descriptive: OLS, Granger tests, and held-out model comparison should be read as associations and forecasting diagnostics, not policy counterfactuals.</p>
      </div>
    </div>
  );
}

// =====================================================================
// Top chrome - brand + nav
// =====================================================================
function TopBar() {
  return (
    <div className="brandbar">
      <div className="brandbar-inner">
        <div className="brand">
          <div className="brand-mark">ev</div>
          <div className="brand-title">
            E-Mobility Global Transition
            <span className="sep">·</span>
            <span className="sub">IEA Global EV Outlook 2025</span>
          </div>
        </div>
        <div className="brand-meta">
          <span>2010-2024 historical · 2030 STEPS</span>
        </div>
      </div>
    </div>
  );
}

function TabNav({ active, onChange }) {
  return (
    <div className="tabnav">
      <div className="tabs" role="tablist">
        {TABS.map(t => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            className={"tab " + (active === t.id ? 'active' : '')}
            onClick={() => onChange(t.id)}
          >
            <span className="tab-ico">{t.icon({})}</span>
            <span>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
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
    window.dispatchEvent(new CustomEvent('dashboard-filter-change', { detail: filters }));
  }, [filters]);
  useEffect(() => {
    const syncDocked = () => setNavDocked(window.scrollY > 54);
    syncDocked();
    window.addEventListener('scroll', syncDocked, { passive: true });
    return () => window.removeEventListener('scroll', syncDocked);
  }, []);
  useEffect(() => {
    const handleCountry = (event) => {
      const country = event && event.detail && event.detail.country;
      if (country) setFilters(f => ({ ...f, country }));
    };
    window.addEventListener('dashboard-set-country', handleCountry);
    return () => window.removeEventListener('dashboard-set-country', handleCountry);
  }, []);

  const ctx = useMemo(() => ({
    state: filters,
    set: (patch) => setFilters(f => ({ ...f, ...patch })),
    reset: () => setFilters(DEFAULT_FILTERS),
  }), [filters]);
  const openMethodology = (event) => {
    event.preventDefault();
    setMethodologyOpen(true);
  };

  return (
    <FilterCtx.Provider value={ctx}>
      <div className={(filterOpen ? 'dashboard-shell filter-open' : 'dashboard-shell filter-closed') + (navDocked ? ' nav-docked' : '')}>
        <TopBar />
        <TabNav
          active={tab}
          onChange={setTab}
        />
        <FilterPanel open={filterOpen} onToggle={() => setFilterOpen(v => !v)} />
        <FilterStatusBar />
        <div data-screen-label={String(tab).padStart(2,'0') + ' ' + TABS[tab].label}>
          {tab === 0 && <TabOverview />}
          {tab === 1 && <TabAdoption />}
          {tab === 2 && <TabInfra />}
          {tab === 3 && <TabMarket />}
          {tab === 4 && <TabSocio />}
          {tab === 5 && <TabML />}
        </div>
        <Footer onMethodology={openMethodology} />
      </div>
      {methodologyOpen && <MethodologyModal onClose={() => setMethodologyOpen(false)} />}
    </FilterCtx.Provider>
  );
}

// Expose so print-app.jsx (loaded after) can override the render with an all-tabs stack
Object.assign(window, {
  App, TopBar, Footer, TABS,
  TabOverview, TabAdoption, TabInfra, TabMarket, TabSocio, TabML,
});

if (!window.__SKIP_DEFAULT_RENDER__) {
  ReactDOM.createRoot(document.getElementById('root')).render(<App />);
}
