# Data Preprocessing & Cleaning Log

**Date**: 2026-06-05

**Objective**: Clean the main EV dataset (EVDataExplorer2025) and 3 auxiliary
files (Emission, Urban_Pct, Electricity), compute regional aggregates via SUM
of constituent country values, add ISO country codes, and merge the auxiliary
files into a single output covering 2010–2024.

**Main data**: EVDataExplorer2025.csv from Global EV Outlook 2025 [1].
**Auxiliary data**: three raw files from World Bank Open Data [2] and Our World in Data [3], [4].

---

======================================================================
DATA PREPROCESSING & CLEANING PIPELINE (Revised)
======================================================================

## STEP 0: Clean main data EVDataExplorer2025

Performed by `preprocess()` before the auxiliary files are joined.

1. **Rename column**: `Aggregate group` → `agg_group`.
2. **Remap `agg_group` values** for readability:
     | Raw value             | Standardized |
     |-----------------------|--------------|
     | _World                | World        |
     | Aggregate_sales_stock | Continent    |
     | Other                 | Country      |
3. **Drop early projection rows**: rows where `category == "Projection-STEPS"`
   AND `year < 2030` are removed. Only the 2030 STEPS horizon is retained;
   historical rows are untouched.
4. **Rename `powertrain` values**:
     - "Publicly available fast" → "Fast Charger"
     - "Publicly available slow" → "Slow Charger"
5. **Rename `unit` values**:
     - "Oil displacement, million lge" → "Oil displacement (Mlge)"
6. **Rename `parameter` values**:
     - "Oil displacement Mbd"          → "Oil displacement (Mbd)"
     - "Oil displacement, million lge" → "Oil displacement (Mlge)"
7. **Add convenience flag**: boolean column `is_projection = (category == "Projection-STEPS")`.

The 54 countries with `agg_group == "Country"` form the canonical country list
used to standardise the three auxiliary files. Cleaned EV frame is saved at
the end of the pipeline to `cleaned_data/ev2025.csv`.

## STEP 1: Load raw files and inspect structure

Emission.csv: 5275 rows x 3 cols
  Columns: ['Entity', 'Year', 'Greenhouse gas emissions per capita']
  Format: LONG (each row = 1 country + 1 year). No reshaping needed.
  Year range: 2000–2024

Urban_Pct.csv: 266 rows x 27 cols
  Columns: Country Name + 26 year columns (2000–2025)
  Format: WIDE (years as columns). Must melt to long format.

Electricity.csv: 5835 rows x 4 meaningful cols (dropped trailing empty columns)
  Columns: ['country', 'year', 'population', 'electricity_generation']
  NOTE: 'population' and 'electricity_generation' stored as string dtype → converted to numeric.
  Format: LONG. No reshaping needed.
  Year range: 2000–2025

## STEP 2: Reshape Urban_Pct from wide to long format

Melted: 266 rows x 26 year-columns → 6625 rows in long format.
Each row now contains exactly 1 country + 1 year + 1 Urban_pct value.

## STEP 3: Remove 'Rest of the world' rows

  Emission: no 'Rest of...' rows found. Nothing to remove.
  Electricity: no 'Rest of...' rows found. Nothing to remove.
  Urban_Pct: no 'Rest of...' rows found. Nothing to remove.

## STEP 4: Standardize country names to match EVDataExplorer2025

Emission & Electricity renames: {'Czechia': 'Czech Republic', 'South Korea': 'Korea', 'Turkey': 'Turkiye', 'United States': 'USA', 'Vietnam': 'Viet Nam'}
Urban_Pct renames: {'Czechia': 'Czech Republic', 'Korea, Rep.': 'Korea', 'Turkiye': 'Turkiye', 'United States': 'USA', 'Russian Federation': 'Russia', 'Slovak Republic': 'Slovakia'}

Post-rename verification:
  Emission — all 54 EV countries found ✓
  Electricity — all 54 EV countries found ✓
  Urban_Pct — all 54 EV countries found ✓

## STEP 5: Compute regional aggregates using SUM

Strategy: Remove any pre-existing region rows, then recompute each region by
SUMMING values of its constituent EV countries. All values are taken precisely
from the dataset — nothing generated.

8 regions are produced: World, Africa, Asia Pacific, Europe,
Central and South America, Middle East and Caspian, North America, **EU27**.

### 5a. Emission (Greenhouse gas emissions per capita)
    Africa: summed 2 countries across 25 years
    Asia Pacific: summed 10 countries across 25 years
    Europe: summed 32 countries across 25 years
    Central and South America: summed 5 countries across 25 years
    Middle East and Caspian: summed 3 countries across 25 years
    North America: summed 2 countries across 25 years
    EU27: summed 26 countries across 25 years
    World: summed 54 countries across 25 years
  Removed pre-existing region rows: ['Africa', 'Europe', 'North America', 'World']
  Result: [refresh by running pipeline] rows

### 5b. Electricity (population, electricity_generation)
    Africa: summed 2 countries across 26 years
    Asia Pacific: summed 10 countries across 26 years
    Europe: summed 32 countries across 26 years
    Central and South America: summed 5 countries across 26 years
    Middle East and Caspian: summed 3 countries across 26 years
    North America: summed 2 countries across 26 years
    EU27: summed 26 countries across 26 years
    World: summed 54 countries across 26 years
  Removed pre-existing region rows: ['Africa', 'Europe', 'North America', 'World']
  Result: [refresh by running pipeline] rows

### 5c. Urban_Pct (Urban_pct)
    Africa: summed 2 countries across 25 years
    Asia Pacific: summed 10 countries across 25 years
    Europe: summed 32 countries across 25 years
    Central and South America: summed 5 countries across 25 years
    Middle East and Caspian: summed 3 countries across 25 years
    North America: summed 2 countries across 25 years
    EU27: summed 26 countries across 25 years
    World: summed 54 countries across 25 years
  Removed pre-existing region rows: ['North America', 'World']
  Result: [refresh by running pipeline] rows

## STEP 6: Filter to only EV-relevant countries and regions

Keep set = 54 EV countries ∪ 8 needed regions = 62 entities.

  Emission: [refresh] rows
  Electricity: [refresh] rows
  Urban_Pct: [refresh] rows

## STEP 7: Save cleaned intermediate files

  Emission_cleaned.csv
  Electricity_cleaned.csv
  Urban_Pct_cleaned.csv

## STEP 8: Merge all 3 cleaned files into one output

Build union of (region_country, year) keys across the three cleaned frames, then
left-join the value columns onto that key set.

Merged shape: [refresh] rows x 6 cols

## STEP 9: Add ISO 3166-1 alpha-3 country codes

54 country codes + 8 region codes (regions use descriptive abbreviations:
WLD, AFR, APAC, EUR, CSAM, MECA, NAM, EU27).
All 62 entities mapped to codes ✓

## STEP 9b: Restrict merged dataset to 2010–2024

Rows outside `2010 ≤ year ≤ 2024` are dropped from the merged auxiliary frame.
Rationale: align the merged auxiliary data with the EV dataset's historical
window. (The 2030 STEPS projection lives only in the EV file, handled in STEP 0.)

## STEP 10: Final output

Columns: ['region_country', 'year', 'code', 'Greenhouse gas emissions per capita', 'population', 'electricity_generation', 'Urban_pct']
Unique entities: 62 (54 countries + 8 regions)
Year range: 2010–2024
Shape: [refresh] rows x 7 cols

Null counts (will shift after EU27 + 2010–2024 filter):
  Greenhouse gas emissions per capita: [refresh] nulls
  population: [refresh] nulls
  electricity_generation: [refresh] nulls
  Urban_pct: [refresh] nulls

Saved: merged_output.csv
Saved: ev2025.csv  (cleaned EVDataExplorer2025, output of STEP 0)

---

## Region-to-Country Mapping (SUM aggregation)

**Africa** (2 countries): South Africa, Seychelles

**Asia Pacific** (10 countries): Australia, China, India, Indonesia, Japan, Korea, Malaysia, New Zealand, Thailand, Viet Nam

**Europe** (32 countries): Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Ireland, Italy, Latvia, Lithuania, Luxembourg, Netherlands, Norway, Poland, Portugal, Romania, Russia, Slovakia, Slovenia, Spain, Sweden, Switzerland, Turkiye, United Kingdom

**Central and South America** (5 countries): Brazil, Chile, Colombia, Costa Rica, Mexico

**Middle East and Caspian** (3 countries): Israel, Jordan, Uzbekistan

**North America** (2 countries): Canada, USA

**EU27** (26 countries): Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Ireland, Italy, Latvia, Lithuania, Luxembourg, Netherlands, Poland, Portugal, Romania, Slovakia, Slovenia, Spain, Sweden

**World**: Sum of all 54 EV countries

## Country Name Standardizations

| Raw Name | Standardized Name | Files |
|---|---|---|
| Czechia | Czech Republic | Emission, Electricity, Urban_Pct |
| South Korea | Korea | Emission, Electricity |
| Turkey | Turkiye | Emission, Electricity |
| United States | USA | Emission, Electricity, Urban_Pct |
| Vietnam | Viet Nam | Emission, Electricity |
| Russian Federation | Russia | Urban_Pct |
| Slovak Republic | Slovakia | Urban_Pct |
| Korea, Rep. | Korea | Urban_Pct |

## EV-data Value Standardizations (STEP 0)

| Field | Raw value | Standardized value |
|---|---|---|
| agg_group | _World | World |
| agg_group | Aggregate_sales_stock | Continent |
| agg_group | Other | Country |
| powertrain | Publicly available fast | Fast Charger |
| powertrain | Publicly available slow | Slow Charger |
| unit | Oil displacement, million lge | Oil displacement (Mlge) |
| parameter | Oil displacement Mbd | Oil displacement (Mbd) |
| parameter | Oil displacement, million lge | Oil displacement (Mlge) |

## References
[1] International Energy Agency. Global EV outlook 2025. IEA. https://www.iea.org/data-and-statistics/data-product/global-ev-outlook-2025
[2] Our World in Data. Energy data [Data set]. GitHub. https://github.com/owid/energy-data/
[3] Our World in Data. Per capita greenhouse gas emissions [Interactive chart]. https://ourworldindata.org/grapher/per-capita-ghg-emissions
[4] World Bank. Urban population (% of total population) [Data set]. World Bank Open Data. https://data.worldbank.org/indicator/SP.URB.TOTL.IN.ZS