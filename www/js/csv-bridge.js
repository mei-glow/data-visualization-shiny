// =====================================================================
// CSV bridge - overrides the baked-in IEA fixtures with values derived
// from the user's real CSVs (merged_output.csv + ev2025.csv) when they
// are available. The exact charts, layout and styling are unchanged; only
// the *numbers* behind window.* are swapped where a clean mapping exists.
//
// Shiny injects two globals before this script runs:
//   window.__MERGE_ROWS__  → array of merged_output.csv row objects (or null)
//   window.__EV_ROWS__     → array of ev2025.csv row objects (or null)
// If neither is present, the original IEA fixtures are kept verbatim.
// =====================================================================
(function () {
  const merge = window.__MERGE_ROWS__ || null;
  const ev    = window.__EV_ROWS__ || null;

  // Nothing loaded → keep the original fixtures exactly as shipped.
  if ((!merge || !merge.length) && (!ev || !ev.length)) {
    console.info('[csv-bridge] No CSV data injected - using IEA fixtures.');
    return;
  }

  const YEARS = window.YEARS; // 2010..2024 from data-fixtures.jsx
  const num = (v) => {
    if (v === null || v === undefined || v === '') return NaN;
    const n = +String(v).replace(/,/g, '');
    return Number.isFinite(n) ? n : NaN;
  };
  const pick = (row, keys) => {
    for (const k of keys) {
      if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
      // case-insensitive fallback
      const hit = Object.keys(row).find(c => c.toLowerCase() === k.toLowerCase());
      if (hit && row[hit] !== '' && row[hit] !== null) return row[hit];
    }
    return undefined;
  };

  // ---- helper: build a YEARS-aligned series from rows for one region/metric
  function seriesByYear(rows, regionVal, regionKeys, valueKeys) {
    const out = YEARS.map(() => NaN);
    rows.forEach(r => {
      const reg = pick(r, regionKeys);
      if (reg !== regionVal) return;
      const yr = num(pick(r, ['year', 'Year']));
      const idx = YEARS.indexOf(yr);
      if (idx < 0) return;
      const v = num(pick(r, valueKeys));
      if (Number.isFinite(v)) out[idx] = v;
    });
    return out;
  }

  // =================================================================
  // 1) merged_output.csv → region-level GHG / electricity / urban / pop
  //    These don't map onto the IEA EV fixtures 1:1, so we expose them
  //    as a NEW global the (optional) data-table + any region charts read.
  // =================================================================
  if (merge && merge.length) {
    const regionKeys = ['region_country', 'region', 'country'];
    const regions = [...new Set(merge.map(r => pick(r, regionKeys)).filter(Boolean))];

    window.__CSV_MERGE__ = {
      regions,
      years: YEARS,
      ghgByRegion: Object.fromEntries(regions.map(rg => [rg,
        seriesByYear(merge, rg, regionKeys, ['Greenhouse gas emissions per capita', 'ghg_per_capita', 'ghg'])])),
      elecByRegion: Object.fromEntries(regions.map(rg => [rg,
        seriesByYear(merge, rg, regionKeys, ['electricity_generation', 'electricity', 'elec'])])),
      urbanByRegion: Object.fromEntries(regions.map(rg => [rg,
        seriesByYear(merge, rg, regionKeys, ['Urban_pct', 'urban_pct', 'urban'])])),
      popByRegion: Object.fromEntries(regions.map(rg => [rg,
        seriesByYear(merge, rg, regionKeys, ['population', 'pop'])])),
      raw: merge,
    };
    console.info('[csv-bridge] merged_output.csv → __CSV_MERGE__ for', regions.length, 'regions.');
  }

  // =================================================================
  // 2) ev2025.csv → override the EV fixtures the charts consume.
  //    We map the common IEA Global EV Outlook columns:
  //      country, year, powertrain/parameter, value, mode, category, unit
  //    onto WORLD_EV_STOCK_M, WORLD_SALES_SHARE, WORLD_STOCK_BY_POWERTRAIN,
  //    COUNTRY_STOCK_M and COUNTRY_SALES_2024_M.
  // =================================================================
  if (ev && ev.length) {
    const ck = ['country', 'region', 'Region/country/economy', 'region_country'];
    const yk = ['year', 'Year'];
    const ptk = ['powertrain', 'Powertrain'];
    const paramk = ['parameter', 'Parameter'];
    const modek = ['mode', 'Mode'];
    const valk = ['value', 'Value'];
    const unitk = ['unit', 'Unit'];

    const isWorld = (c) => /^(world|global)$/i.test(String(c || ''));

    // --- World EV stock (millions, cars) by year ---
    const worldStock = YEARS.map(() => NaN);
    const worldShare = YEARS.map(() => NaN);
    const worldPT = { BEV: YEARS.map(() => 0), PHEV: YEARS.map(() => 0), FCEV: YEARS.map(() => 0) };
    const countryStock = {}; // name -> YEARS series
    const countrySales2024 = {};

    let touched = false;
    ev.forEach(r => {
      const yr = num(pick(r, yk));
      const idx = YEARS.indexOf(yr);
      const country = pick(r, ck);
      const param = String(pick(r, paramk) || '').toLowerCase();
      const pt = String(pick(r, ptk) || '').toUpperCase();
      const mode = String(pick(r, modek) || '').toLowerCase();
      const unit = String(pick(r, unitk) || '').toLowerCase();
      const val = num(pick(r, valk));
      if (!Number.isFinite(val)) return;

      const carsOnly = mode === '' || mode === 'cars';

      // EV stock (vehicles) - convert to millions if raw count.
      // Keep this exact: "EV stock share" is a percentage and must not be
      // added to vehicle stock.
      if (param === 'ev stock' && carsOnly) {
        const vM = unit.includes('vehicle') || val > 1e4 ? val / 1e6 : val;
        if (isWorld(country) && idx >= 0) { worldStock[idx] = (worldStock[idx] || 0); }
        if (idx >= 0 && country && !isWorld(country)) {
          countryStock[country] = countryStock[country] || YEARS.map(() => NaN);
          countryStock[country][idx] = (countryStock[country][idx] || 0) + vM;
        }
        if (idx >= 0 && ['BEV', 'PHEV', 'FCEV'].includes(pt)) {
          if (isWorld(country)) { worldPT[pt][idx] += vM; touched = true; }
        }
      }
      // EV sales share (%)
      if (param === 'ev sales share' && isWorld(country) && idx >= 0) {
        worldShare[idx] = val; touched = true;
      }
      // 2024 sales (millions)
      if (param === 'ev sales' && yr === 2024 && country && !isWorld(country) && carsOnly) {
        const vM = unit.includes('vehicle') || val > 1e4 ? val / 1e6 : val;
        countrySales2024[country] = (countrySales2024[country] || 0) + vM;
      }
    });

    // World stock = sum of powertrains where we have them
    YEARS.forEach((_, i) => {
      const s = worldPT.BEV[i] + worldPT.PHEV[i] + worldPT.FCEV[i];
      if (s > 0) worldStock[i] = s;
    });

    // Only override a fixture if we actually filled it with real data.
    const hasData = (arr) => arr.some(v => Number.isFinite(v) && v !== 0);

    if (touched && hasData(worldStock)) {
      window.WORLD_EV_STOCK_M = worldStock.map((v, i) => Number.isFinite(v) ? v : window.WORLD_EV_STOCK_M[i]);
      window.WORLD_STOCK_BY_POWERTRAIN = {
        BEV: worldPT.BEV.map((v, i) => v || window.WORLD_STOCK_BY_POWERTRAIN.BEV[i]),
        PHEV: worldPT.PHEV.map((v, i) => v || window.WORLD_STOCK_BY_POWERTRAIN.PHEV[i]),
        FCEV: worldPT.FCEV.map((v, i) => v || window.WORLD_STOCK_BY_POWERTRAIN.FCEV[i]),
      };
      console.info('[csv-bridge] Overrode WORLD_EV_STOCK_M + powertrain split from ev2025.csv.');
    }
    if (hasData(worldShare)) {
      window.WORLD_SALES_SHARE = worldShare.map((v, i) => Number.isFinite(v) ? v : window.WORLD_SALES_SHARE[i]);
      console.info('[csv-bridge] Overrode WORLD_SALES_SHARE from ev2025.csv.');
    }
    if (Object.keys(countryStock).length) {
      Object.entries(countryStock).forEach(([c, series]) => {
        if (window.COUNTRY_STOCK_M[c]) {
          window.COUNTRY_STOCK_M[c] = series.map((v, i) => Number.isFinite(v) ? v : window.COUNTRY_STOCK_M[c][i]);
        }
      });
      console.info('[csv-bridge] Patched COUNTRY_STOCK_M for', Object.keys(countryStock).length, 'countries.');
    }
    if (Object.keys(countrySales2024).length) {
      Object.entries(countrySales2024).forEach(([c, v]) => {
        if (window.COUNTRY_SALES_2024_M[c] !== undefined) window.COUNTRY_SALES_2024_M[c] = v;
      });
    }
  }
})();
