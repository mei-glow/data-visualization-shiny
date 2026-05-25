"""
This script performs:
  1. Load and inspect structure of all 3 raw files (electricity + population, emission, urban_pct)
  2. Reshape wide-format data (Urban_Pct) to long format and cleaned EVDataExplorer2025
  3. Remove "Rest of the world" rows in raw files - no need this objects for prediction phase
  4. Standardize country names in raw files to match EVDataExplorer2025
  5. Compute regional aggregates via SUM of constituent countries in the data
  6. Filter to only EVDataExplorer2025 countries and regions
  7. Save cleaned files
  8. Merge all 3 cleaned files into one output
  9. Add ISO country codes to EVDataExplorer2025 and 3 files
  10. Select year from 2010 to 2024
 11. Save final output 

Input files:
  - Emission.csv            (greenhouse gas emissions per capita)
  - Urban_Pct.csv           (urbanization rate by country)
  - Electricity.csv         (population & electricity generation)
  - EVDataExplorer2025.csv


Output files:
  - merged_output.csv           (final merged dataset)
  - Emission_cleaned.csv  
  - Electricity_cleaned.csv   
  - Urban_Pct_cleaned.csv       
  - EV_cleaned
"""

import pandas as pd
import numpy as np

log_lines = []

# STEP 1: LOAD RAW FILES AND INSPECT STRUCTURE
ev_df = pd.read_csv("D://Data_Projects//data-visualization-shiny//data//raw_data//EVDataExplorer2025.csv")
em = pd.read_csv('D://Data_Projects//data-visualization-shiny//data//raw_data//Emission.csv')
ur = pd.read_csv('D://Data_Projects//data-visualization-shiny//data//raw_data//Urban_Pct.csv', encoding='utf-8-sig')
el = pd.read_csv('D://Data_Projects//data-visualization-shiny//data//raw_data//Electricity.csv')
# clean country string
el['country'] = el['country'].str.strip()
# convert population and electricity column to numeric
el['population'] = pd.to_numeric(el['population'], errors='coerce')
el['electricity_generation'] = pd.to_numeric(el['electricity_generation'], errors='coerce')


# STEP 2: RESHAPE Urban_Pct WIDE to LONG AND CLEAN EV
year_cols = [c for c in ur.columns if c != 'Country Name']
ur_long = ur.melt(
    id_vars='Country Name',
    value_vars=year_cols,
    var_name='year',
    value_name='Urban_pct'
)
ur_long['year'] = ur_long['year'].astype(int)
ur_long['Urban_pct'] = pd.to_numeric(ur_long['Urban_pct'], errors='coerce')
ur_long = ur_long.dropna(subset=['Urban_pct'])
ur_long.rename(columns={'Country Name': 'country'}, inplace=True)


# STEP 3: REMOVE "Rest of the world" ROWS
def preprocess(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # 1. rename column
    df = df.rename(columns={"Aggregate group": "agg_group"})

    # 2. remap agg_group values
    df["agg_group"] = df["agg_group"].replace({
        "_World": "World",
        "Aggregate_sales_stock": "Continent",
        "Other": "Country"
    })

    # 3. drop projection rows with year < 2030 (keep only 2030 horizon)
    drop_mask = (df["category"] == "Projection-STEPS") & (df["year"] < 2030)
    df = df.loc[~drop_mask].copy()

    # 4. rename powertrain values
    df["powertrain"] = df["powertrain"].replace({
        "Publicly available fast": "Fast Charger",
        "Publicly available slow": "Slow Charger",
    })

    # 5. rename unit
    df["unit"] = df["unit"].replace({
        "Oil displacement, million lge": "Oil displacement (Mlge)"
    })

    # 6. rename parameter
    df["parameter"] = df["parameter"].replace({
        "Oil displacement Mbd": "Oil displacement (Mbd)",
        "Oil displacement, million lge": "Oil displacement (Mlge)",
    })

    # convenience flag
    df["is_projection"] = df["category"] == "Projection-STEPS"

    return df.reset_index(drop=True)


for df, col in [(em, 'Entity',),
                (el, 'country'),
                (ur_long, 'country')]:
    mask = df[col].str.lower().str.contains('rest of', na=False)
    count = mask.sum()
    if count > 0:
        df.drop(df[mask].index, inplace=True)

ev_df = preprocess(ev_df)


# STEP 4: STANDARDIZE COUNTRY NAMES
name_map_em_el = {
    'Czechia': 'Czech Republic',
    'South Korea': 'Korea',
    'Turkey': 'Turkiye',
    'United States': 'USA',
    'Vietnam': 'Viet Nam',
}
name_map_ur = {
    'Czechia': 'Czech Republic',
    'Korea, Rep.': 'Korea',
    'Turkiye': 'Turkiye',
    'United States': 'USA',
    'Russian Federation': 'Russia',
    'Slovak Republic': 'Slovakia',
}

em['Entity'] = em['Entity'].replace(name_map_em_el)
el['country'] = el['country'].replace(name_map_em_el)
ur_long['country'] = ur_long['country'].replace(name_map_ur)

# The 54 countries present in EVDataExplorer2025 (excluding regions)
ev_countries = ev_df[ev_df["agg_group"] == "Other"]["region_country"].values

for name, df, col in [('Emission', em, 'Entity'),
                       ('Electricity', el, 'country'),
                       ('Urban_Pct', ur_long, 'country')]:
    missing = [c for c in ev_countries if c not in df[col].values]
    if missing:
        print(f"{name} — still missing: {missing}.")
    else:
        print(f"{name} — All 54 EV countries found.")

# STEP 5: COMPUTE REGIONAL AGGREGATES (SUM)
region_mapping = {
    'Africa': ['South Africa', 'Seychelles'],
    'Asia Pacific': [
        'Australia', 'China', 'India', 'Indonesia', 'Japan', 'Korea',
        'Malaysia', 'New Zealand', 'Thailand', 'Viet Nam',
    ],
    'Europe': [
        'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus',
        'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France',
        'Germany', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Italy',
        'Latvia', 'Lithuania', 'Luxembourg', 'Netherlands', 'Norway',
        'Poland', 'Portugal', 'Romania', 'Russia', 'Slovakia',
        'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkiye',
        'United Kingdom',
    ],
    'Central and South America': [
        'Brazil', 'Chile', 'Colombia', 'Costa Rica', 'Mexico',
    ],
    'Middle East and Caspian': ['Israel', 'Jordan', 'Uzbekistan'],
    'North America': ['Canada', 'USA'],
    "EU27": [
            'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus',
            'Czech Republic', 'Denmark', 'Estonia', 'Finland', 'France',
            'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy',
            'Latvia', 'Lithuania', 'Luxembourg', 'Netherlands', 'Poland',
            'Portugal', 'Romania', 'Slovakia', 'Slovenia', 'Spain',
            'Sweden']
}

needed_regions = [
    'World', 'Africa', 'Asia Pacific', 'Europe',
    'Central and South America', 'Middle East and Caspian', 
    'North America', 'EU27'
]


def add_region_aggregates(df, country_col, year_col, value_cols):
    """
    Remove existing region rows, recompute all via SUM of constituent
    EV countries. All values are taken directly from the dataset.
    
    World = sum of all countries in EV dataset.
    """
    existing = list(df[df[country_col].isin(needed_regions)][country_col].unique())
    df = df[~df[country_col].isin(needed_regions)].copy()

    region_frames = []

    for region, countries in region_mapping.items():
        subset = df[df[country_col].isin(countries)]
        found = sorted(subset[country_col].unique())
        not_found = [c for c in countries if c not in found]
        if not_found:
            print(f"{region}: missing countries {not_found}")
        agg = subset.groupby(year_col)[value_cols].sum(min_count=1).reset_index()
        agg[country_col] = region
        region_frames.append(agg)
        print(f"{region}: summed {len(found)} countries across {len(agg)} years")

    # World = sum of ALL 54 EV countries
    world_sub = df[df[country_col].isin(ev_countries)]
    world_agg = world_sub.groupby(year_col)[value_cols].sum(min_count=1).reset_index()
    world_agg[country_col] = 'World'
    region_frames.append(world_agg)
    print(f"World: summed {world_sub[country_col].nunique()} countries across {len(world_agg)} years")

    return pd.concat([df] + region_frames, ignore_index=True), existing


# 5a. Emission
print("5a. Emission (Greenhouse gas emissions per capita)")
em_clean, em_removed = add_region_aggregates(
    em, 'Entity', 'Year', ['Greenhouse gas emissions per capita']
)
print(f"  Result: {em_clean.shape[0]} rows\n")

# 5b. Electricity
print("5b. Electricity (population, electricity_generation)")
el_clean, el_removed = add_region_aggregates(
    el, 'country', 'year', ['population', 'electricity_generation']
)
print(f"  Result: {el_clean.shape[0]} rows\n")

# 5c. Urban_Pct
print("### 5c. Urban_Pct (Urban_pct)")
ur_clean, ur_removed = add_region_aggregates(
    ur_long, 'country', 'year', ['Urban_pct']
)
print(f"  Result: {ur_clean.shape[0]} rows")


# STEP 6: FILTER TO ONLY EV COUNTRIES + REGIONS
keep = set(list(ev_countries) + needed_regions)
em_clean = em_clean[em_clean['Entity'].isin(keep)]
el_clean = el_clean[el_clean['country'].isin(keep)]
ur_clean = ur_clean[ur_clean['country'].isin(keep)]


# STEP 7: SAVE CLEANED INTERMEDIATE FILES
em_clean.to_csv('Emission_cleaned.csv', index=False)
el_clean.to_csv('Electricity_cleaned.csv', index=False)
ur_clean.to_csv('Urban_Pct_cleaned.csv', index=False)

# STEP 8: MERGE ALL 3 CLEANED FILES INTO ONE OUTPUT
em_m = em_clean.rename(columns={'Entity': 'region_country', 'Year': 'year'})
el_m = el_clean.rename(columns={'country': 'region_country'})
ur_m = ur_clean.rename(columns={'country': 'region_country'})

# Build union of all (region_country, year) keys
all_keys = pd.concat([
    em_m[['region_country', 'year']],
    el_m[['region_country', 'year']],
    ur_m[['region_country', 'year']],
]).drop_duplicates()

merged = all_keys.merge(
    em_m[['region_country', 'year', 'Greenhouse gas emissions per capita']],
    on=['region_country', 'year'], how='left'
).merge(
    el_m[['region_country', 'year', 'population', 'electricity_generation']],
    on=['region_country', 'year'], how='left'
).merge(
    ur_m[['region_country', 'year', 'Urban_pct']],
    on=['region_country', 'year'], how='left'
)

print(f"Merged shape: {merged.shape[0]} rows x {merged.shape[1]} cols")


# STEP 9: ADD ISO COUNTRY CODES
print("\nSTEP 9: Add ISO 3166-1 alpha-3 country codes\n")

iso_codes = {
    'Australia': 'AUS', 'Austria': 'AUT', 'Belgium': 'BEL', 'Brazil': 'BRA',
    'Bulgaria': 'BGR', 'Canada': 'CAN', 'Chile': 'CHL', 'China': 'CHN',
    'Colombia': 'COL', 'Costa Rica': 'CRI', 'Croatia': 'HRV', 'Cyprus': 'CYP',
    'Czech Republic': 'CZE', 'Denmark': 'DNK', 'Estonia': 'EST', 'Finland': 'FIN',
    'France': 'FRA', 'Germany': 'DEU', 'Greece': 'GRC', 'Hungary': 'HUN',
    'Iceland': 'ISL', 'India': 'IND', 'Indonesia': 'IDN', 'Ireland': 'IRL',
    'Israel': 'ISR', 'Italy': 'ITA', 'Japan': 'JPN', 'Jordan': 'JOR',
    'Korea': 'KOR', 'Latvia': 'LVA', 'Lithuania': 'LTU', 'Luxembourg': 'LUX',
    'Malaysia': 'MYS', 'Mexico': 'MEX', 'Netherlands': 'NLD', 'New Zealand': 'NZL',
    'Norway': 'NOR', 'Poland': 'POL', 'Portugal': 'PRT', 'Romania': 'ROU',
    'Russia': 'RUS', 'Seychelles': 'SYC', 'Slovakia': 'SVK', 'Slovenia': 'SVN',
    'South Africa': 'ZAF', 'Spain': 'ESP', 'Sweden': 'SWE', 'Switzerland': 'CHE',
    'Thailand': 'THA', 'Turkiye': 'TUR', 'USA': 'USA', 'United Kingdom': 'GBR',
    'Uzbekistan': 'UZB', 'Viet Nam': 'VNM',
    # Regions — descriptive abbreviations
    'World': 'WLD', 'Africa': 'AFR', 'Asia Pacific': 'APAC',
    'Europe': 'EUR', 'Central and South America': 'CSAM',
    'Middle East and Caspian': 'MECA', 'North America': 'NAM',
    'EU27': 'EU27'
}

merged['code'] = merged['region_country'].map(iso_codes)
unmapped = merged[merged['code'].isna()]['region_country'].unique()
if len(unmapped) > 0:
    print(f"WARNING: No code for: {list(unmapped)}")


# STEP 10: filter year 2010 - 2024
merged = merged[(merged['year'] >= 2010) & (merged['year'] <= 2024)]

# STEP 11: FINAL OUTPUT
print("\nSTEP 10: Final output\n")

output_cols = [
    'region_country', 'year', 'code',
    'Greenhouse gas emissions per capita',
    'population', 'electricity_generation', 'Urban_pct',
]
merged = merged[output_cols].sort_values(['region_country', 'year']).reset_index(drop=True)

# Check null values
for col in output_cols[3:]:
    n = merged[col].isna().sum()
    print(f"  {col}: {n} nulls ({n / len(merged) * 100:.1f}%)")

merged.to_csv('D://Data_Projects//data-visualization-shiny//data//cleaned_data//merged_output.csv', index=False)
print(f"\nSaved: merged_output.csv")
ev_df.to_csv('D://Data_Projects//data-visualization-shiny//data//cleaned_data//ev2025.csv', index=False)
print(f"\nSaved: ev2025.csv")