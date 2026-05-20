# Data Preprocessing & Cleaning Log

**Date**: 2026-05-20

**Objective**: Clean 3 raw files (Emission, Urban_Pct, Electricity), compute regional aggregates via SUM of constituent country values, add ISO country codes, and merge into a single output.

---

======================================================================
DATA PREPROCESSING & CLEANING PIPELINE (Revised)
======================================================================

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
  NOTE: 'population' was stored as string dtype → converted to numeric.
  Format: LONG. No reshaping needed.
  Year range: 2000–2025

## STEP 2: Reshape Urban_Pct from wide to long format

Melted: 266 rows x 26 year-columns → 6625 rows in long format
Each row now contains exactly 1 country + 1 year + 1 Urban_pct value.

## STEP 3: Remove 'Rest of the world' rows

  Emission: no 'Rest of...' rows found. Nothing to remove.
  Electricity: no 'Rest of...' rows found. Nothing to remove.
  Urban_Pct: no 'Rest of...' rows found. Nothing to remove.

## STEP 4: Standardize country names to match EVDataExplorer2025

Emission & Electricity renames: {'Czechia': 'Czech Republic', 'South Korea': 'Korea', 'Turkey': 'Turkiye', 'United States': 'USA', 'Vietnam': 'Viet Nam'}
Urban_Pct renames: {'Czechia': 'Czech Republic', 'Korea, Rep.': 'Korea', 'Turkiye': 'Turkiye', 'United States': 'USA', 'Viet Nam': 'Viet Nam', 'Russian Federation': 'Russia', 'Slovak Republic': 'Slovakia'}

Post-rename verification:
  Emission — all 54 EV countries found ✓
  Electricity — all 54 EV countries found ✓
  Urban_Pct — all 54 EV countries found ✓

## STEP 5: Compute regional aggregates using SUM

Strategy: Remove any pre-existing region rows, then recompute each
region by SUMMING values of its constituent EV countries.
All values are taken precisely from the dataset — nothing generated.

### 5a. Emission (Greenhouse gas emissions per capita)
    Africa: summed 2 countries across 25 years
    Asia Pacific: summed 10 countries across 25 years
    Europe: summed 32 countries across 25 years
    Central and South America: summed 5 countries across 25 years
    Middle East and Caspian: summed 3 countries across 25 years
    North America: summed 2 countries across 25 years
    World: summed 54 countries across 25 years
  Removed pre-existing region rows: ['Africa', 'Europe', 'North America', 'World']
  Result: 5350 rows

### 5b. Electricity (population, electricity_generation)
    Africa: summed 2 countries across 26 years
    Asia Pacific: summed 10 countries across 26 years
    Europe: summed 32 countries across 26 years
    Central and South America: summed 5 countries across 26 years
    Middle East and Caspian: summed 3 countries across 26 years
    North America: summed 2 countries across 26 years
    World: summed 54 countries across 26 years
  Removed pre-existing region rows: ['Africa', 'Europe', 'North America', 'World']
  Result: 5915 rows

### 5c. Urban_Pct (Urban_pct)
    Africa: summed 2 countries across 25 years
    Asia Pacific: summed 10 countries across 25 years
    Europe: summed 32 countries across 25 years
    Central and South America: summed 5 countries across 25 years
    Middle East and Caspian: summed 3 countries across 25 years
    North America: summed 2 countries across 25 years
    World: summed 54 countries across 25 years
  Removed pre-existing region rows: ['North America', 'World']
  Result: 6750 rows

## STEP 6: Filter to only EV-relevant countries and regions

  Emission: 1525 rows
  Electricity: 1582 rows
  Urban_Pct: 1525 rows

## STEP 7: Save cleaned intermediate files

  Emission_cleaned.csv: 1525 rows
  Electricity_cleaned.csv: 1582 rows
  Urban_Pct_cleaned.csv: 1525 rows

## STEP 8: Merge all 3 cleaned files into one output

Merged shape: 1582 rows x 6 cols

## STEP 9: Add ISO 3166-1 alpha-3 country codes

  All 61 entities mapped to codes ✓

## STEP 10: Final output

Shape: 1582 rows x 7 cols
Columns: ['region_country', 'year', 'code', 'Greenhouse gas emissions per capita', 'population', 'electricity_generation', 'Urban_pct']
Unique entities: 61
Year range: 2000–2025

Null counts:
  Greenhouse gas emissions per capita: 57 nulls (3.6%)
  population: 0 nulls (0.0%)
  electricity_generation: 0 nulls (0.0%)
  Urban_pct: 57 nulls (3.6%)

Sample — USA:
region_country  year code  Greenhouse gas emissions per capita  population  electricity_generation  Urban_pct
           USA  2000  USA                            25.639954 281484126.0             3802.100098  79.074090
           USA  2001  USA                            24.540426 284279634.0             3727.570068  79.308622
           USA  2002  USA                            24.588982 287084335.0             3844.229980  79.546104

Sample — Asia Pacific:
region_country  year code  Greenhouse gas emissions per capita   population  electricity_generation  Urban_pct
  Asia Pacific  2000 APAC                           117.477388 2903495844.0             3862.870047 552.870317
  Asia Pacific  2001 APAC                           119.673594 2938429386.0             4036.980080 559.113474
  Asia Pacific  2002 APAC                           116.483455 2972027040.0             4300.579990 566.645600

Sample — World:
region_country  year code  Greenhouse gas emissions per capita   population  electricity_generation   Urban_pct
         World  2000  WLD                           583.863617 4340959850.0            13435.590152 3645.477633
         World  2001  WLD                           590.228452 4386076705.0            13588.770130 3663.553592
         World  2002  WLD                           589.052319 4430584837.0            14056.499988 3681.133487

Saved: merged_output.csv

---

## Region-to-Country Mapping (SUM aggregation)

**Africa** (2 countries): South Africa, Seychelles

**Asia Pacific** (10 countries): Australia, China, India, Indonesia, Japan, Korea, Malaysia, New Zealand, Thailand, Viet Nam

**Europe** (32 countries): Austria, Belgium, Bulgaria, Croatia, Cyprus, Czech Republic, Denmark, Estonia, Finland, France, Germany, Greece, Hungary, Iceland, Ireland, Italy, Latvia, Lithuania, Luxembourg, Netherlands, Norway, Poland, Portugal, Romania, Russia, Slovakia, Slovenia, Spain, Sweden, Switzerland, Turkiye, United Kingdom

**Central and South America** (5 countries): Brazil, Chile, Colombia, Costa Rica, Mexico

**Middle East and Caspian** (3 countries): Israel, Jordan, Uzbekistan

**North America** (2 countries): Canada, USA

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
