# E-Mobility Global Transition Dashboard

An interactive visual analytics dashboard for exploring the uneven global
transition to electric mobility. The application combines historical and
projected EV indicators with charging infrastructure, socioeconomic variables,
environmental indicators, and predictive analyses.

**Live application:** https://mei-glow.shinyapps.io/data-visualization-shiny11/

**Course:** COMP4010 - Data Visualization

**Primary data:** [IEA Global EV Outlook 2025](https://www.iea.org/data-and-statistics/data-product/global-ev-outlook-2025)

## Project Motivation

Global EV sales are growing quickly, but the transition is not progressing
equally across countries. Strong sales growth can coexist with weak charging
coverage, different BEV/PHEV market structures, and a slowly changing vehicle
fleet.

This dashboard investigates four connected questions:

1. Where is EV adoption accelerating, and where is it falling behind?
2. Does charging infrastructure grow before or after EV demand?
3. How does EV market composition differ across leading markets?
4. Which socioeconomic and infrastructure variables are associated with EV
   adoption?

The intended audience includes policymakers, infrastructure planners, industry
analysts, and researchers.

## Key Findings

- EV adoption remains geographically concentrated rather than evenly global.
- Seven of the ten leading EV markets are BEV-dominant; PHEVs remain important
  where charging confidence is weaker.
- Charging density is strongly associated with adoption, but income and
  infrastructure do not explain every outlier.
- Fast growth in new EV sales does not immediately transform the full vehicle
  fleet: under the IEA STEPS scenario, the global sales share reaches about 42%
  by 2030 while stock share remains around 15%.
- The pooled panel OLS finds significant associations between EV sales and all
  five tested predictors. These results are descriptive associations, not
  causal policy effects.
- In the held-out model comparison, Lasso narrowly leads the linear and
  tree-based alternatives, although the difference from plain OLS and Ridge is
  small.

## Dashboard Structure

The application contains six linked narrative tabs:

| Tab | Purpose | Example visualizations |
| --- | --- | --- |
| Overview | Summarize global fleet, sales share, powertrains, and chargers | KPI cards, bar-line chart, stacked area chart, small-multiple pies |
| Adoption Trends | Compare country and regional growth over time | Bubble scatter, animated Top-12 ranking, indexed growth lines, inflection timeline |
| Infrastructure & Demand | Evaluate charger growth and availability | Dual-line chart, stress-test bubbles, ratio table, Granger-test summary |
| Market Composition | Compare geographic adoption and powertrain structure | Clickable choropleth, turnover-gap lines, Top-10 stacked bars |
| Socioeconomic & Policy | Relate infrastructure, income, fuel prices, and emissions to adoption | Income-group bubble scatter, multi-axis time series |
| ML / Causality | Present statistical associations and predictive diagnostics | OLS forest plot, country scatter, model comparison, China time series |

The dashboard includes more than five purposeful chart types, including line,
bar, stacked area, scatter/bubble, pie, choropleth, forest plot, and table
views.

## Interactivity

- A collapsible sidebar filters by year range, development group, country, and
  EV powertrain.
- Active-filter chips show the current state and allow individual filters to be
  cleared.
- Clicking a country on the world map selects it globally, zooms the map, and
  highlights or filters compatible charts.
- The country-ranking chart animates through years using efficient
  `Plotly.react` updates.
- Plotly tooltips expose exact values and contextual variables.
- Every chart card supports PNG download, copying plotted data, and fullscreen
  inspection.
- Global trend charts remain at world level when no comparable country-level
  series exists, preventing misleading substitutions.

## Data Sources

### Primary EV data

- [IEA Global EV Outlook 2025](https://www.iea.org/data-and-statistics/data-product/global-ev-outlook-2025)
- Historical EV sales, stock, sales share, powertrain, charging infrastructure,
  and oil-displacement indicators
- Historical period: 2010-2024
- Projection horizon: 2030 STEPS

### External contextual data

- Population and electricity generation
- [World Bank urban population share](https://data.worldbank.org/indicator/SP.URB.TOTL.IN.ZS)
- Greenhouse-gas emissions per capita
- Gas-price indicators used in the socioeconomic comparison

### Processed outputs

- `data/cleaned_data/ev2025.csv`: 14,962 rows, 10 columns
- `data/cleaned_data/merged_output.csv`: merged contextual country/region-year
  indicators used by the dashboard
- `data/preprocessing_log.md`: detailed cleaning and aggregation log

## Data Processing

The preprocessing workflow is implemented in `preprocessing_pipeline.py`:

1. Load the IEA and external source files.
2. Reshape urbanization data from wide to long format.
3. Convert numeric fields and remove irrelevant aggregate rows.
4. Standardize country names across datasets.
5. Recompute regional aggregates from their constituent EV markets.
6. Merge emissions, population, electricity, and urbanization indicators.
7. Add ISO country codes and restrict the historical analysis to 2010-2024.
8. Export the cleaned EV and contextual datasets.

The committed cleaned datasets allow the application to run immediately.
`preprocessing_pipeline.py` currently contains machine-specific source/output
paths; update those paths before regenerating the cleaned files on another
machine.

## ML and Analytical Methods

The dashboard embeds analytical results directly into the visual workflow:

- **Pooled OLS:** 53-country by 15-year panel using `log(EV sales)` as the
  target, displayed as coefficients with 95% confidence intervals.
- **Model comparison:** held-out R-squared and MAE comparisons across Linear
  Regression, Ridge, Lasso, Random Forest, and Gradient Boosting.
- **Granger test:** checks whether past urbanization improves forecasts of
  China's EV adoption at tested lags.
- **IEA STEPS comparison:** contrasts historical trends with the 2030 policy
  scenario.

These analyses should be interpreted as associations and forecasting
diagnostics, not causal proof or policy counterfactuals.

## Technical Architecture

The application uses a hybrid Python Shiny, React, and Plotly architecture:

```text
Cleaned CSV files
      |
      v
app.py: Pandas loading + JSON-safe serialization
      |
      v
Python Shiny: page, deployment, and static-asset serving
      |
      v
CSV bridge: maps cleaned records to visualization variables
      |
      v
React: tabs, sidebar, shared filters, linked-view events
      |
      v
Plotly: charts, hover, zoom, click selection, animation, exports
```

Python Shiny loads the data once at startup and serves the application.
Filtering and visualization updates occur primarily in the browser, reducing
server recomputation and keeping interactions responsive. React, ReactDOM,
Plotly, and geographic TopoJSON files are vendored in `www/vendor/`, making the
visualization layer independent of external CDNs.

## Run Locally

### 1. Clone the repository

```bash
git clone https://github.com/mei-glow/data-visualization-shiny.git
cd data-visualization-shiny
```

### 2. Create and activate a virtual environment

Windows PowerShell:

```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

macOS/Linux:

```bash
python -m venv venv
source venv/bin/activate
```

### 3. Install pinned dependencies

```bash
python -m pip install -r requirements.txt
```

### 4. Start the application

```bash
python -m shiny run --reload --host 127.0.0.1 --port 8000 app.py
```

Open http://127.0.0.1:8000.

## Editing the Frontend

Editable frontend sources are stored as JSX files under `www/`. The application
serves their transpiled counterparts from `www/js/`.

```bash
npm install --save-dev @babel/cli @babel/core @babel/preset-react
npx babel www/app.jsx -o www/js/app.js --presets @babel/preset-react
npx babel www/charts.jsx -o www/js/charts.js --presets @babel/preset-react
npx babel www/csv-bridge.jsx -o www/js/csv-bridge.js --presets @babel/preset-react
npx babel www/data-fixtures.jsx -o www/js/data-fixtures.js --presets @babel/preset-react
```

Restart Shiny after changing `www/design.css`, because the CSS is inlined into
the page at application startup.

## Deploy to shinyapps.io

After configuring an `rsconnect-python` account, deploy or update the existing
application with:

```powershell
.\venv\Scripts\rsconnect.exe deploy shiny . --name mei-glow --app-id 17373708 --title ev-dashboard --python .\venv\Scripts\python.exe --exclude "Causality test.ipynb" --exclude "e-mobility-dashboard-ui.html" --exclude "report/**" --exclude "__pycache__/**"
```

## Repository Structure

```text
app.py                         Python Shiny entry point
preprocessing_pipeline.py      Cleaning, harmonization, aggregation, and merge pipeline
requirements.txt               Pinned Python dependencies
data/
  raw_data/                    Original EV and contextual source files
  cleaned_data/                Production-ready CSV files loaded by the app
  notebook/                    Exploratory notebook
  preprocessing_log.md         Cleaning and validation log
www/
  app.jsx                      React UI, tabs, filters, cards, and interactions
  charts.jsx                   Plotly chart builders
  csv-bridge.jsx               Cleaned CSV-to-chart mapping layer
  data-fixtures.jsx            Baseline visualization and analytical fixtures
  design.css                   Responsive dashboard styling
  js/                          Transpiled JavaScript bundles served by Shiny
  vendor/                      Local React, Plotly, and TopoJSON assets
report/
  main.tex                     LaTeX report entry point
  sections/                    Report sections
```

## Team

| Member | Primary responsibility |
| --- | --- |
| Pham Quynh Trang | Project lead and UI/UX |
| Nguyen Thi Bao Tien | Data preprocessing pipeline |
| Tran Phuong Mai | Dashboard implementation |
| Nguyen Khanh Ngoc | ML and forecasting analysis |

Git history and feature branches document the collaborative development and
integration process.

## Limitations and Future Work

- Several contextual regional values are recomputed from the subset of
  countries represented in the EV dataset; they should not be interpreted as
  complete global aggregates.
- The app serializes the cleaned datasets to the browser at startup. A larger
  dataset would benefit from modular Shiny server queries and server-side
  filtering.
- Country coverage is uneven, especially in regions where the IEA does not
  report detailed values.
- OLS and Granger outputs describe associations and temporal predictability;
  they do not establish causal effects.
- Future work could add automated pipeline validation, uncertainty-aware
  forecasts, and richer policy variables.

## Report and Resources

- Live app: https://mei-glow.shinyapps.io/data-visualization-shiny11/
- Source data folder: https://github.com/mei-glow/data-visualization-shiny/tree/main/data
- LaTeX report: `report/main.tex`

## License and Attribution

The IEA Global EV Outlook 2025 data product is published under the terms stated
by the IEA. External datasets retain their respective licenses. This repository
is an academic data-visualization project.
