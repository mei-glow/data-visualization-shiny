// =====================================================================
// E-Mobility Dashboard - data fixtures
// Numbers approximate the IEA Global EV Outlook 2025 values referenced
// in the PRD. They are realistic enough for a high-fidelity prototype.
// =====================================================================

const PALETTE = {
  primary: '#0B7A75',
  accent: '#F4A261',
  bev: '#264653',
  phev: '#E76F51',
  fcev: '#9C89B8',
  fast: '#2A9D8F',
  slow: '#A8DADC',
  muted: '#94A3B8',
  danger: '#D00000',
  warning: '#FFB703',
  success: '#06A77D',
  ink: '#0F172A',
  ink2: '#334155',
  border: '#E2E8F0'
};
const REGION_COLORS = {
  China: '#D62828',
  USA: '#1D4E89',
  EU27: '#003566',
  Europe: '#005F73',
  India: '#F77F00',
  Norway: '#0077B6',
  Germany: '#FFB703',
  France: '#7209B7',
  'United Kingdom': '#9D0208',
  Japan: '#BC4749',
  Korea: '#FF006E',
  Brazil: '#3A5A40',
  Australia: '#FB8500',
  Canada: '#9B2226',
  Netherlands: '#118AB2',
  Sweden: '#06A77D',
  Italy: '#D62246',
  Spain: '#E07A5F',
  Belgium: '#403D58',
  Denmark: '#9D6B53',
  Switzerland: '#577590',
  Austria: '#84A98C',
  Finland: '#5E548E',
  'Rest of the world': '#94A3B8'
};

// ---------- World aggregates 2010..2024 + 2030 STEPS ----------
const YEARS = [2010, 2011, 2012, 2013, 2014, 2015, 2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024];

// EV stock (millions of vehicles) world, cars only, BEV+PHEV+FCEV
const WORLD_EV_STOCK_M = [0.02, 0.06, 0.18, 0.40, 0.74, 1.26, 2.00, 3.30, 5.40, 7.40, 10.20, 16.50, 26.30, 40.80, 58.10];

// EV sales share of new cars (%)
const WORLD_SALES_SHARE = [0.01, 0.02, 0.04, 0.08, 0.18, 0.30, 0.55, 0.95, 1.80, 2.60, 4.20, 8.60, 13.90, 17.80, 22.00];

// EV stock share of all cars (%)
const WORLD_STOCK_SHARE = [0.0, 0.01, 0.01, 0.03, 0.05, 0.10, 0.17, 0.27, 0.42, 0.55, 0.78, 1.20, 1.95, 3.10, 4.50];

// 2030 projection (STEPS)
const STEPS_2030 = {
  stock_M: 232.2,
  salesShare: 42,
  stockShare: 14.8
};

// World EV stock by powertrain (millions, cars) - sums approximately to WORLD_EV_STOCK_M
const WORLD_STOCK_BY_POWERTRAIN = {
  BEV: [0.012, 0.040, 0.110, 0.250, 0.460, 0.780, 1.250, 2.050, 3.350, 4.600, 6.450, 10.700, 17.500, 27.500, 39.500],
  PHEV: [0.008, 0.020, 0.070, 0.150, 0.275, 0.470, 0.730, 1.220, 2.020, 2.750, 3.700, 5.700, 8.650, 13.100, 18.300],
  FCEV: [0.000, 0.000, 0.000, 0.000, 0.005, 0.010, 0.020, 0.030, 0.030, 0.050, 0.050, 0.100, 0.150, 0.200, 0.300]
};
const STEPS_STOCK_BY_POWERTRAIN_2030 = {
  BEV: 168,
  PHEV: 62,
  FCEV: 2.2
};

// World public charging points (millions)
const WORLD_CHARGERS = {
  Slow: [0.005, 0.015, 0.030, 0.060, 0.110, 0.170, 0.230, 0.320, 0.430, 0.580, 0.770, 1.080, 1.450, 2.000, 2.640],
  Fast: [0.001, 0.004, 0.012, 0.025, 0.045, 0.075, 0.110, 0.160, 0.220, 0.310, 0.430, 0.620, 0.900, 1.350, 1.910]
};
const STEPS_CHARGERS_2030 = {
  Slow: 6.40,
  Fast: 5.10
};

// 2024 mode share within each powertrain (vehicles, all modes - Cars / 2&3w / Other)
const MODE_SHARE_2024 = {
  BEV: {
    '2 and 3 wheelers': 0.78,
    'Cars': 0.20,
    'Other (Trucks, Buses, Vans)': 0.02
  },
  PHEV: {
    '2 and 3 wheelers': 0.02,
    'Cars': 0.95,
    'Other (Trucks, Buses, Vans)': 0.03
  },
  FCEV: {
    '2 and 3 wheelers': 0.00,
    'Cars': 0.55,
    'Other (Trucks, Buses, Vans)': 0.45
  }
};

// ---------- Country level ----------
// EV stock by country/region, 2010..2024 (millions, cars BEV+PHEV+FCEV)
const COUNTRY_STOCK_M = {
  China: [0.001, 0.006, 0.013, 0.032, 0.105, 0.312, 0.648, 1.220, 2.300, 3.350, 4.600, 7.840, 13.800, 22.500, 34.000],
  USA: [0.004, 0.022, 0.075, 0.175, 0.290, 0.405, 0.560, 0.760, 1.130, 1.450, 1.770, 2.450, 3.300, 4.500, 6.320],
  Europe: [0.005, 0.018, 0.040, 0.090, 0.180, 0.330, 0.560, 0.910, 1.350, 1.870, 3.250, 5.400, 7.900, 10.800, 13.900],
  Germany: [0.001, 0.003, 0.006, 0.020, 0.050, 0.080, 0.135, 0.220, 0.380, 0.540, 1.130, 1.910, 2.620, 3.080, 3.510],
  France: [0.002, 0.004, 0.010, 0.020, 0.045, 0.075, 0.115, 0.170, 0.270, 0.380, 0.640, 1.040, 1.520, 1.980, 2.420],
  'United Kingdom': [0.001, 0.002, 0.005, 0.015, 0.030, 0.055, 0.090, 0.140, 0.220, 0.330, 0.510, 0.860, 1.250, 1.620, 1.940],
  Norway: [0.001, 0.005, 0.012, 0.030, 0.060, 0.100, 0.150, 0.215, 0.300, 0.395, 0.510, 0.610, 0.730, 0.850, 0.960],
  Netherlands: [0.001, 0.003, 0.007, 0.020, 0.045, 0.090, 0.130, 0.155, 0.180, 0.220, 0.280, 0.380, 0.540, 0.730, 0.910],
  Sweden: [0.000, 0.001, 0.003, 0.006, 0.012, 0.025, 0.040, 0.070, 0.115, 0.180, 0.270, 0.450, 0.630, 0.760, 0.870],
  Japan: [0.005, 0.018, 0.040, 0.075, 0.110, 0.140, 0.170, 0.205, 0.255, 0.295, 0.310, 0.345, 0.415, 0.500, 0.580],
  Korea: [0.000, 0.000, 0.001, 0.004, 0.008, 0.015, 0.025, 0.060, 0.110, 0.180, 0.260, 0.380, 0.520, 0.620, 0.690],
  India: [0.000, 0.000, 0.000, 0.001, 0.003, 0.006, 0.010, 0.020, 0.045, 0.085, 0.110, 0.190, 0.330, 0.490, 0.660],
  Canada: [0.000, 0.001, 0.002, 0.005, 0.011, 0.020, 0.035, 0.060, 0.105, 0.155, 0.205, 0.265, 0.345, 0.470, 0.620],
  Italy: [0.000, 0.001, 0.002, 0.004, 0.008, 0.015, 0.025, 0.045, 0.075, 0.120, 0.190, 0.310, 0.430, 0.530, 0.620],
  Spain: [0.000, 0.001, 0.002, 0.004, 0.008, 0.014, 0.024, 0.040, 0.065, 0.105, 0.165, 0.250, 0.340, 0.420, 0.490],
  Belgium: [0.000, 0.000, 0.001, 0.003, 0.006, 0.012, 0.020, 0.030, 0.050, 0.085, 0.140, 0.220, 0.310, 0.400, 0.470],
  Denmark: [0.000, 0.000, 0.001, 0.002, 0.005, 0.009, 0.014, 0.020, 0.030, 0.045, 0.080, 0.140, 0.220, 0.310, 0.390],
  Switzerland: [0.000, 0.000, 0.001, 0.002, 0.005, 0.010, 0.016, 0.025, 0.040, 0.060, 0.095, 0.150, 0.220, 0.290, 0.350],
  Australia: [0.000, 0.000, 0.001, 0.002, 0.004, 0.007, 0.011, 0.018, 0.030, 0.045, 0.065, 0.090, 0.130, 0.210, 0.302],
  Austria: [0.000, 0.000, 0.001, 0.002, 0.005, 0.010, 0.016, 0.025, 0.040, 0.060, 0.095, 0.150, 0.200, 0.260, 0.310],
  Finland: [0.000, 0.000, 0.000, 0.001, 0.002, 0.005, 0.009, 0.015, 0.025, 0.040, 0.060, 0.095, 0.135, 0.180, 0.215],
  Brazil: [0.000, 0.000, 0.000, 0.001, 0.002, 0.003, 0.005, 0.007, 0.010, 0.014, 0.020, 0.030, 0.055, 0.090, 0.130],
  Mexico: [0.000, 0.000, 0.000, 0.000, 0.001, 0.002, 0.004, 0.007, 0.012, 0.018, 0.024, 0.032, 0.044, 0.058, 0.068],
  'New Zealand': [0.000, 0.000, 0.000, 0.001, 0.002, 0.003, 0.005, 0.008, 0.013, 0.020, 0.030, 0.045, 0.065, 0.090, 0.113],
  'Rest of the world': [0.001, 0.002, 0.004, 0.008, 0.015, 0.025, 0.040, 0.060, 0.090, 0.140, 0.205, 0.290, 0.420, 0.580, 0.770]
};

// 2024 EV sales (millions, cars)
const COUNTRY_SALES_2024_M = {
  China: 11.20,
  USA: 1.60,
  Europe: 3.20,
  Germany: 0.72,
  France: 0.49,
  'United Kingdom': 0.47,
  Norway: 0.13,
  Netherlands: 0.21,
  Sweden: 0.13,
  Japan: 0.13,
  Korea: 0.14,
  India: 0.21,
  Canada: 0.18,
  Italy: 0.13,
  Spain: 0.10,
  Belgium: 0.10,
  Denmark: 0.09,
  Switzerland: 0.05,
  Australia: 0.09,
  Austria: 0.06,
  Finland: 0.04,
  Brazil: 0.06,
  Mexico: 0.018,
  'New Zealand': 0.03
};

// Aggregates for the bubble scatter
const REGION_AGGS_2024 = {
  CHN: {
    name: 'China',
    stock_M: 34.0,
    sales_M: 11.20,
    color: '#D62828'
  },
  EUR: {
    name: 'Europe',
    stock_M: 13.9,
    sales_M: 3.20,
    color: '#005F73'
  },
  USA: {
    name: 'USA',
    stock_M: 6.32,
    sales_M: 1.60,
    color: '#1D4E89'
  },
  APAC: {
    name: 'Asia Pacific',
    stock_M: 36.5,
    sales_M: 11.65,
    color: '#9C89B8'
  },
  NAM: {
    name: 'North America',
    stock_M: 6.94,
    sales_M: 1.78,
    color: '#9B2226'
  },
  IND: {
    name: 'India',
    stock_M: 0.66,
    sales_M: 0.21,
    color: '#F77F00'
  }
};
// Plus individual countries (smaller bubbles)
const COUNTRY_SMALL_2024 = ['Germany', 'France', 'United Kingdom', 'Norway', 'Netherlands', 'Sweden', 'Japan', 'Korea', 'Italy', 'Spain', 'Belgium', 'Denmark', 'Switzerland', 'Australia', 'Austria', 'Finland', 'Canada', 'Brazil', 'Mexico', 'New Zealand'].map(c => ({
  name: c,
  iso: {
    Germany: 'DEU',
    France: 'FRA',
    'United Kingdom': 'GBR',
    Norway: 'NOR',
    Netherlands: 'NLD',
    Sweden: 'SWE',
    Japan: 'JPN',
    Korea: 'KOR',
    Italy: 'ITA',
    Spain: 'ESP',
    Belgium: 'BEL',
    Denmark: 'DNK',
    Switzerland: 'CHE',
    Australia: 'AUS',
    Austria: 'AUT',
    Finland: 'FIN',
    Canada: 'CAN',
    Brazil: 'BRA',
    Mexico: 'MEX',
    'New Zealand': 'NZL'
  }[c],
  stock_M: COUNTRY_STOCK_M[c][14],
  sales_M: COUNTRY_SALES_2024_M[c],
  color: REGION_COLORS[c] || PALETTE.muted
}));

// ---------- China / USA / Europe stock by powertrain 2016..2024 ----------
const REGION_BY_PT = {
  China: {
    years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    BEV: [0.490, 0.910, 1.700, 2.530, 3.450, 5.880, 10.350, 16.875, 25.500],
    PHEV: [0.158, 0.310, 0.600, 0.820, 1.150, 1.960, 3.450, 5.625, 8.500],
    FCEV: [0.0001, 0.0005, 0.001, 0.002, 0.003, 0.005, 0.008, 0.012, 0.020],
    salesShare: [1.5, 2.2, 4.5, 5.2, 6.2, 16.0, 29.0, 38.0, 48.0]
  },
  USA: {
    years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    BEV: [0.300, 0.430, 0.700, 0.920, 1.130, 1.560, 2.150, 2.940, 4.150],
    PHEV: [0.260, 0.330, 0.430, 0.530, 0.640, 0.890, 1.150, 1.560, 2.165],
    FCEV: [0.0005, 0.0009, 0.002, 0.003, 0.005, 0.008, 0.010, 0.012, 0.015],
    salesShare: [0.9, 1.2, 2.1, 1.9, 2.3, 4.5, 7.7, 9.5, 10.5]
  },
  Europe: {
    years: [2016, 2017, 2018, 2019, 2020, 2021, 2022, 2023, 2024],
    BEV: [0.290, 0.470, 0.700, 1.020, 1.880, 3.150, 4.700, 6.450, 8.350],
    PHEV: [0.270, 0.440, 0.650, 0.850, 1.370, 2.250, 3.200, 4.350, 5.550],
    FCEV: [0.0003, 0.0005, 0.001, 0.002, 0.003, 0.005, 0.008, 0.012, 0.015],
    salesShare: [1.3, 1.9, 2.6, 3.4, 11.0, 18.0, 22.5, 23.5, 24.0]
  }
};

// ---------- China vs USA EV sales 2010..2024 ----------
const CN_US_SALES = {
  China: [0.001, 0.005, 0.008, 0.018, 0.075, 0.330, 0.510, 0.770, 1.080, 1.060, 1.260, 3.350, 6.600, 8.400, 11.200],
  USA: [0.001, 0.018, 0.053, 0.097, 0.119, 0.116, 0.157, 0.199, 0.358, 0.327, 0.328, 0.670, 0.918, 1.430, 1.600]
};
const POLICY_EVENTS = [{
  year: 2012,
  country: 'USA',
  short: 'US',
  label: 'Tesla Model S released'
}, {
  year: 2017,
  country: 'China',
  short: 'CN',
  label: 'NEV credit mandate announced'
}, {
  year: 2020,
  country: 'China',
  short: 'CN',
  label: 'Mass charging infrastructure rollout'
}, {
  year: 2021,
  country: 'USA',
  short: 'US',
  label: 'Biden EV target announced'
}, {
  year: 2023,
  country: 'China',
  short: 'CN',
  label: 'BYD surpasses Tesla sales'
}, {
  year: 2023,
  country: 'USA',
  short: 'US',
  label: 'Tesla charging standard adopted'
}];

// ---------- Top 20 BEV/PHEV split, 2024 ----------
// order = bottom→top in the chart
const TOP20_MIX = [{
  country: 'Finland',
  BEV: 42,
  PHEV: 58
}, {
  country: 'Austria',
  BEV: 51,
  PHEV: 49
}, {
  country: 'Australia',
  BEV: 57,
  PHEV: 43
}, {
  country: 'Switzerland',
  BEV: 53,
  PHEV: 47
}, {
  country: 'Spain',
  BEV: 47,
  PHEV: 53
}, {
  country: 'Denmark',
  BEV: 61,
  PHEV: 39
}, {
  country: 'Italy',
  BEV: 44,
  PHEV: 56
}, {
  country: 'Korea',
  BEV: 78,
  PHEV: 22
}, {
  country: 'Japan',
  BEV: 60,
  PHEV: 40
}, {
  country: 'Belgium',
  BEV: 53,
  PHEV: 47
}, {
  country: 'Sweden',
  BEV: 49,
  PHEV: 51
}, {
  country: 'Rest of the world',
  BEV: 65,
  PHEV: 35
}, {
  country: 'Canada',
  BEV: 68,
  PHEV: 32
}, {
  country: 'Norway',
  BEV: 78,
  PHEV: 22
}, {
  country: 'Netherlands',
  BEV: 72,
  PHEV: 28
}, {
  country: 'France',
  BEV: 64,
  PHEV: 36
}, {
  country: 'United Kingdom',
  BEV: 70,
  PHEV: 30
}, {
  country: 'Germany',
  BEV: 58,
  PHEV: 42
}, {
  country: 'USA',
  BEV: 75,
  PHEV: 25
}, {
  country: 'China',
  BEV: 68,
  PHEV: 32
}];

// ---------- Charger stress test 2024 (worst-5 + a wider set) ----------
const STRESS_2024 = [
// Worst-5 (highlighted)
{
  country: 'New Zealand',
  continent: 'Oceania',
  stock_M: 0.113,
  chargers: 1440,
  ratio: 78.5
}, {
  country: 'Australia',
  continent: 'Oceania',
  stock_M: 0.302,
  chargers: 6700,
  ratio: 45.1
}, {
  country: 'Mexico',
  continent: 'America',
  stock_M: 0.068,
  chargers: 1850,
  ratio: 36.8
}, {
  country: 'USA',
  continent: 'America',
  stock_M: 6.319,
  chargers: 193000,
  ratio: 32.7
}, {
  country: 'Norway',
  continent: 'Europe',
  stock_M: 0.960,
  chargers: 31000,
  ratio: 31.0
},
// Others
{
  country: 'United Kingdom',
  continent: 'Europe',
  stock_M: 1.940,
  chargers: 75000,
  ratio: 25.9
}, {
  country: 'Canada',
  continent: 'America',
  stock_M: 0.620,
  chargers: 28000,
  ratio: 22.1
}, {
  country: 'Sweden',
  continent: 'Europe',
  stock_M: 0.870,
  chargers: 41000,
  ratio: 21.2
}, {
  country: 'Switzerland',
  continent: 'Europe',
  stock_M: 0.350,
  chargers: 18000,
  ratio: 19.4
}, {
  country: 'Italy',
  continent: 'Europe',
  stock_M: 0.620,
  chargers: 51000,
  ratio: 12.2
}, {
  country: 'Spain',
  continent: 'Europe',
  stock_M: 0.490,
  chargers: 42000,
  ratio: 11.7
}, {
  country: 'Germany',
  continent: 'Europe',
  stock_M: 3.510,
  chargers: 130000,
  ratio: 27.0
}, {
  country: 'Denmark',
  continent: 'Europe',
  stock_M: 0.390,
  chargers: 24000,
  ratio: 16.3
}, {
  country: 'Austria',
  continent: 'Europe',
  stock_M: 0.310,
  chargers: 22000,
  ratio: 14.1
}, {
  country: 'Belgium',
  continent: 'Europe',
  stock_M: 0.470,
  chargers: 38000,
  ratio: 12.4
}, {
  country: 'France',
  continent: 'Europe',
  stock_M: 2.420,
  chargers: 165000,
  ratio: 14.7
}, {
  country: 'Netherlands',
  continent: 'Europe',
  stock_M: 0.910,
  chargers: 175000,
  ratio: 5.2
}, {
  country: 'Japan',
  continent: 'Asia',
  stock_M: 0.580,
  chargers: 38000,
  ratio: 15.3
}, {
  country: 'Korea',
  continent: 'Asia',
  stock_M: 0.690,
  chargers: 350000,
  ratio: 2.0
}, {
  country: 'China',
  continent: 'Asia',
  stock_M: 34.000,
  chargers: 3500000,
  ratio: 9.7
}, {
  country: 'India',
  continent: 'Asia',
  stock_M: 0.660,
  chargers: 25000,
  ratio: 26.4
}, {
  country: 'Brazil',
  continent: 'America',
  stock_M: 0.130,
  chargers: 6200,
  ratio: 21.0
}, {
  country: 'Finland',
  continent: 'Europe',
  stock_M: 0.215,
  chargers: 12000,
  ratio: 17.9
}];
const CONTINENT_COLORS = {
  Asia: '#D62828',
  Europe: '#1D4E89',
  America: '#9B2226',
  Africa: '#FB8500',
  Oceania: '#7209B7',
  Other: '#94A3B8'
};

// ---------- Socioeconomic 2024 ----------
const INCOME_COLORS = {
  'High': '#0B7A75',
  'Upper-middle': '#F4A261',
  'Lower-middle': '#E76F51'
};
const SOCIO_2024 = [
// country, salesShare%, chargers/M, popM, income
{
  country: 'Norway',
  salesShare: 92,
  ch_per_M: 5700,
  pop: 5.5,
  income: 'High'
}, {
  country: 'Sweden',
  salesShare: 58,
  ch_per_M: 3900,
  pop: 10.5,
  income: 'High'
}, {
  country: 'Denmark',
  salesShare: 51,
  ch_per_M: 4100,
  pop: 5.9,
  income: 'High'
}, {
  country: 'Netherlands',
  salesShare: 35,
  ch_per_M: 9900,
  pop: 17.6,
  income: 'High'
}, {
  country: 'Finland',
  salesShare: 38,
  ch_per_M: 2100,
  pop: 5.5,
  income: 'High'
}, {
  country: 'Belgium',
  salesShare: 30,
  ch_per_M: 3200,
  pop: 11.7,
  income: 'High'
}, {
  country: 'Switzerland',
  salesShare: 28,
  ch_per_M: 2050,
  pop: 8.8,
  income: 'High'
}, {
  country: 'Germany',
  salesShare: 19,
  ch_per_M: 1550,
  pop: 83.8,
  income: 'High'
}, {
  country: 'France',
  salesShare: 22,
  ch_per_M: 2440,
  pop: 67.8,
  income: 'High'
}, {
  country: 'United Kingdom',
  salesShare: 26,
  ch_per_M: 1110,
  pop: 67.5,
  income: 'High'
}, {
  country: 'USA',
  salesShare: 10.5,
  ch_per_M: 575,
  pop: 335.0,
  income: 'High'
}, {
  country: 'Canada',
  salesShare: 15,
  ch_per_M: 705,
  pop: 39.7,
  income: 'High'
}, {
  country: 'Australia',
  salesShare: 12,
  ch_per_M: 255,
  pop: 26.3,
  income: 'High'
}, {
  country: 'Japan',
  salesShare: 3.4,
  ch_per_M: 305,
  pop: 124.0,
  income: 'High'
}, {
  country: 'Korea',
  salesShare: 9.5,
  ch_per_M: 6800,
  pop: 51.4,
  income: 'High'
}, {
  country: 'Austria',
  salesShare: 19,
  ch_per_M: 2440,
  pop: 9.0,
  income: 'High'
}, {
  country: 'Italy',
  salesShare: 9,
  ch_per_M: 865,
  pop: 58.9,
  income: 'High'
}, {
  country: 'Spain',
  salesShare: 11,
  ch_per_M: 880,
  pop: 47.8,
  income: 'High'
}, {
  country: 'China',
  salesShare: 48,
  ch_per_M: 2481,
  pop: 1411.0,
  income: 'Upper-middle'
}, {
  country: 'Costa Rica',
  salesShare: 15,
  ch_per_M: 1450,
  pop: 5.2,
  income: 'Upper-middle'
}, {
  country: 'Türkiye',
  salesShare: 11,
  ch_per_M: 320,
  pop: 85.3,
  income: 'Upper-middle'
}, {
  country: 'Brazil',
  salesShare: 6.5,
  ch_per_M: 30,
  pop: 215.3,
  income: 'Upper-middle'
}, {
  country: 'Mexico',
  salesShare: 4.5,
  ch_per_M: 14,
  pop: 128.5,
  income: 'Upper-middle'
}, {
  country: 'Thailand',
  salesShare: 13,
  ch_per_M: 110,
  pop: 71.7,
  income: 'Upper-middle'
}, {
  country: 'Indonesia',
  salesShare: 7,
  ch_per_M: 6,
  pop: 275.5,
  income: 'Lower-middle'
}, {
  country: 'India',
  salesShare: 2.4,
  ch_per_M: 18,
  pop: 1408.0,
  income: 'Lower-middle'
}, {
  country: 'Ukraine',
  salesShare: 5.2,
  ch_per_M: 75,
  pop: 41.4,
  income: 'Lower-middle'
}, {
  country: 'Philippines',
  salesShare: 1.6,
  ch_per_M: 9,
  pop: 113.9,
  income: 'Lower-middle'
}];
const INCOME_MEDIANS = [{
  group: 'High',
  value: 24.0
}, {
  group: 'Upper-middle',
  value: 7.4
}, {
  group: 'Lower-middle',
  value: 4.7
}];

// ---------- Choropleth (2024 EV sales share by country, ISO-3) ----------
const CHOROPLETH_2024 = [{
  iso: 'CHN',
  name: 'China',
  salesShare: 48.0,
  stock_M: 34.000
}, {
  iso: 'NOR',
  name: 'Norway',
  salesShare: 92.0,
  stock_M: 0.960
}, {
  iso: 'SWE',
  name: 'Sweden',
  salesShare: 58.0,
  stock_M: 0.870
}, {
  iso: 'DNK',
  name: 'Denmark',
  salesShare: 51.0,
  stock_M: 0.390
}, {
  iso: 'FIN',
  name: 'Finland',
  salesShare: 38.0,
  stock_M: 0.215
}, {
  iso: 'NLD',
  name: 'Netherlands',
  salesShare: 35.0,
  stock_M: 0.910
}, {
  iso: 'BEL',
  name: 'Belgium',
  salesShare: 30.0,
  stock_M: 0.470
}, {
  iso: 'CHE',
  name: 'Switzerland',
  salesShare: 28.0,
  stock_M: 0.350
}, {
  iso: 'GBR',
  name: 'United Kingdom',
  salesShare: 26.0,
  stock_M: 1.940
}, {
  iso: 'FRA',
  name: 'France',
  salesShare: 22.0,
  stock_M: 2.420
}, {
  iso: 'DEU',
  name: 'Germany',
  salesShare: 19.0,
  stock_M: 3.510
}, {
  iso: 'AUT',
  name: 'Austria',
  salesShare: 19.0,
  stock_M: 0.310
}, {
  iso: 'CAN',
  name: 'Canada',
  salesShare: 15.0,
  stock_M: 0.620
}, {
  iso: 'CRI',
  name: 'Costa Rica',
  salesShare: 15.0,
  stock_M: 0.030
}, {
  iso: 'THA',
  name: 'Thailand',
  salesShare: 13.0,
  stock_M: 0.180
}, {
  iso: 'AUS',
  name: 'Australia',
  salesShare: 12.0,
  stock_M: 0.302
}, {
  iso: 'ESP',
  name: 'Spain',
  salesShare: 11.0,
  stock_M: 0.490
}, {
  iso: 'TUR',
  name: 'Türkiye',
  salesShare: 11.0,
  stock_M: 0.135
}, {
  iso: 'USA',
  name: 'United States',
  salesShare: 10.5,
  stock_M: 6.320
}, {
  iso: 'KOR',
  name: 'Korea',
  salesShare: 9.5,
  stock_M: 0.690
}, {
  iso: 'ITA',
  name: 'Italy',
  salesShare: 9.0,
  stock_M: 0.620
}, {
  iso: 'IDN',
  name: 'Indonesia',
  salesShare: 7.0,
  stock_M: 0.085
}, {
  iso: 'BRA',
  name: 'Brazil',
  salesShare: 6.5,
  stock_M: 0.130
}, {
  iso: 'UKR',
  name: 'Ukraine',
  salesShare: 5.2,
  stock_M: 0.070
}, {
  iso: 'MEX',
  name: 'Mexico',
  salesShare: 4.5,
  stock_M: 0.068
}, {
  iso: 'JPN',
  name: 'Japan',
  salesShare: 3.4,
  stock_M: 0.580
}, {
  iso: 'IND',
  name: 'India',
  salesShare: 2.4,
  stock_M: 0.660
}, {
  iso: 'PHL',
  name: 'Philippines',
  salesShare: 1.6,
  stock_M: 0.045
}];

// ---------- Urbanization (2010..2024, %) ----------
const URBAN_PCT_WORLD = [51.6, 52.1, 52.6, 53.1, 53.6, 54.1, 54.6, 55.1, 55.6, 56.0, 56.4, 56.8, 57.2, 57.5, 57.8];

// ---------- Gas prices (USD / litre, world avg) and emissions (Gt CO2 transport) ----------
const GAS_PRICE_USD_L = [0.90, 1.05, 1.10, 1.05, 1.00, 0.85, 0.80, 0.95, 1.10, 1.05, 0.90, 1.20, 1.55, 1.40, 1.35];
const TRANSPORT_CO2_GT = [7.0, 7.1, 7.2, 7.3, 7.4, 7.5, 7.55, 7.65, 7.75, 7.80, 7.10, 7.40, 7.55, 7.60, 7.55];

// ---------- China dual-line: urban% + sales share, 2010..2024 ----------
const CHINA_DUAL = {
  years: YEARS,
  urban: [49.0, 50.6, 52.0, 53.7, 54.8, 56.1, 57.3, 58.5, 59.6, 60.6, 63.9, 64.7, 65.2, 66.2, 67.0],
  evShare: [0.01, 0.02, 0.03, 0.05, 0.30, 1.0, 1.5, 2.2, 4.5, 5.2, 6.2, 16.0, 29.0, 38.0, 48.0]
};

// ---------- Scatter: Urbanization vs EV sales share, 2024 (53 countries from scatter_urban_ev_share_2024.csv) ----------
const URBAN_VS_EV_2024 = [{
  country: 'Australia',
  urban: 87.60,
  share: 13.0,
  ev_sales: 112000,
  stock_M: 0.302,
  region: 'Oceania'
}, {
  country: 'Austria',
  urban: 69.47,
  share: 24.0,
  ev_sales: 62000,
  stock_M: 0.310,
  region: 'Europe'
}, {
  country: 'Belgium',
  urban: 87.61,
  share: 43.0,
  ev_sales: 197000,
  stock_M: 0.470,
  region: 'Europe'
}, {
  country: 'Brazil',
  urban: 87.90,
  share: 6.4,
  ev_sales: 125000,
  stock_M: 0.130,
  region: 'America'
}, {
  country: 'Bulgaria',
  urban: 73.95,
  share: 5.0,
  ev_sales: 2170,
  stock_M: 0.010,
  region: 'Europe'
}, {
  country: 'Canada',
  urban: 82.70,
  share: 17.0,
  ev_sales: 252000,
  stock_M: 0.620,
  region: 'America'
}, {
  country: 'Chile',
  urban: 89.00,
  share: 2.1,
  ev_sales: 5600,
  stock_M: 0.012,
  region: 'America'
}, {
  country: 'China',
  urban: 65.89,
  share: 48.0,
  ev_sales: 11300000,
  stock_M: 34.000,
  region: 'Asia'
}, {
  country: 'Colombia',
  urban: 78.52,
  share: 7.4,
  ev_sales: 13100,
  stock_M: 0.025,
  region: 'America'
}, {
  country: 'Costa Rica',
  urban: 79.31,
  share: 15.0,
  ev_sales: 11022,
  stock_M: 0.030,
  region: 'America'
}, {
  country: 'Croatia',
  urban: 57.52,
  share: 4.9,
  ev_sales: 3200,
  stock_M: 0.010,
  region: 'Europe'
}, {
  country: 'Cyprus',
  urban: 66.68,
  share: 12.0,
  ev_sales: 1860,
  stock_M: 0.005,
  region: 'Europe'
}, {
  country: 'Czech Republic',
  urban: 72.79,
  share: 6.8,
  ev_sales: 15800,
  stock_M: 0.040,
  region: 'Europe'
}, {
  country: 'Denmark',
  urban: 88.70,
  share: 56.0,
  ev_sales: 96100,
  stock_M: 0.390,
  region: 'Europe'
}, {
  country: 'Estonia',
  urban: 70.70,
  share: 10.0,
  ev_sales: 2600,
  stock_M: 0.012,
  region: 'Europe'
}, {
  country: 'Finland',
  urban: 74.26,
  share: 50.0,
  ev_sales: 37000,
  stock_M: 0.215,
  region: 'Europe'
}, {
  country: 'France',
  urban: 78.80,
  share: 24.0,
  ev_sales: 450000,
  stock_M: 2.420,
  region: 'Europe'
}, {
  country: 'Germany',
  urban: 82.02,
  share: 19.0,
  ev_sales: 570000,
  stock_M: 3.510,
  region: 'Europe'
}, {
  country: 'Greece',
  urban: 78.99,
  share: 12.0,
  ev_sales: 17000,
  stock_M: 0.040,
  region: 'Europe'
}, {
  country: 'Hungary',
  urban: 70.49,
  share: 12.0,
  ev_sales: 14300,
  stock_M: 0.045,
  region: 'Europe'
}, {
  country: 'Iceland',
  urban: 94.18,
  share: 42.0,
  ev_sales: 4300,
  stock_M: 0.030,
  region: 'Europe'
}, {
  country: 'India',
  urban: 35.38,
  share: 2.1,
  ev_sales: 92095,
  stock_M: 0.660,
  region: 'Asia'
}, {
  country: 'Indonesia',
  urban: 58.75,
  share: 7.3,
  ev_sales: 49150,
  stock_M: 0.085,
  region: 'Asia'
}, {
  country: 'Ireland',
  urban: 64.35,
  share: 25.0,
  ev_sales: 30000,
  stock_M: 0.090,
  region: 'Europe'
}, {
  country: 'Israel',
  urban: 91.54,
  share: 21.0,
  ev_sales: 76400,
  stock_M: 0.180,
  region: 'Asia'
}, {
  country: 'Italy',
  urban: 69.60,
  share: 7.9,
  ev_sales: 118000,
  stock_M: 0.620,
  region: 'Europe'
}, {
  country: 'Japan',
  urban: 92.19,
  share: 2.8,
  ev_sales: 103000,
  stock_M: 0.580,
  region: 'Asia'
}, {
  country: 'Korea',
  urban: 81.17,
  share: 9.2,
  ev_sales: 127900,
  stock_M: 0.690,
  region: 'Asia'
}, {
  country: 'Latvia',
  urban: 68.48,
  share: 12.0,
  ev_sales: 2100,
  stock_M: 0.008,
  region: 'Europe'
}, {
  country: 'Lithuania',
  urban: 68.83,
  share: 12.0,
  ev_sales: 3500,
  stock_M: 0.012,
  region: 'Europe'
}, {
  country: 'Luxembourg',
  urban: 94.84,
  share: 36.0,
  ev_sales: 16800,
  stock_M: 0.060,
  region: 'Europe'
}, {
  country: 'Malaysia',
  urban: 76.92,
  share: 3.6,
  ev_sales: 27300,
  stock_M: 0.055,
  region: 'Asia'
}, {
  country: 'Mexico',
  urban: 79.75,
  share: 2.2,
  ev_sales: 27100,
  stock_M: 0.068,
  region: 'America'
}, {
  country: 'Netherlands',
  urban: 95.64,
  share: 48.0,
  ev_sales: 182000,
  stock_M: 0.910,
  region: 'Europe'
}, {
  country: 'New Zealand',
  urban: 83.94,
  share: 11.0,
  ev_sales: 9700,
  stock_M: 0.113,
  region: 'Oceania'
}, {
  country: 'Norway',
  urban: 83.33,
  share: 92.0,
  ev_sales: 113500,
  stock_M: 0.960,
  region: 'Europe'
}, {
  country: 'Poland',
  urban: 59.97,
  share: 5.7,
  ev_sales: 32000,
  stock_M: 0.080,
  region: 'Europe'
}, {
  country: 'Portugal',
  urban: 61.33,
  share: 33.0,
  ev_sales: 70000,
  stock_M: 0.180,
  region: 'Europe'
}, {
  country: 'Romania',
  urban: 52.17,
  share: 6.5,
  ev_sales: 9800,
  stock_M: 0.025,
  region: 'Europe'
}, {
  country: 'Russia',
  urban: 75.11,
  share: 2.9,
  ev_sales: 32600,
  stock_M: 0.070,
  region: 'Europe'
}, {
  country: 'Slovakia',
  urban: 53.19,
  share: 4.8,
  ev_sales: 4400,
  stock_M: 0.012,
  region: 'Europe'
}, {
  country: 'Slovenia',
  urban: 55.76,
  share: 8.1,
  ev_sales: 4300,
  stock_M: 0.015,
  region: 'Europe'
}, {
  country: 'South Africa',
  urban: 63.69,
  share: 0.61,
  ev_sales: 1940,
  stock_M: 0.005,
  region: 'Africa'
}, {
  country: 'Spain',
  urban: 80.32,
  share: 11.0,
  ev_sales: 128000,
  stock_M: 0.490,
  region: 'Europe'
}, {
  country: 'Sweden',
  urban: 88.86,
  share: 58.0,
  ev_sales: 157000,
  stock_M: 0.870,
  region: 'Europe'
}, {
  country: 'Switzerland',
  urban: 85.46,
  share: 28.0,
  ev_sales: 67000,
  stock_M: 0.350,
  region: 'Europe'
}, {
  country: 'Thailand',
  urban: 61.87,
  share: 13.0,
  ev_sales: 80400,
  stock_M: 0.180,
  region: 'Asia'
}, {
  country: 'Türkiye',
  urban: 89.34,
  share: 11.0,
  ev_sales: 105700,
  stock_M: 0.135,
  region: 'Asia'
}, {
  country: 'USA',
  urban: 80.12,
  share: 10.0,
  ev_sales: 1520000,
  stock_M: 6.320,
  region: 'America'
}, {
  country: 'United Kingdom',
  urban: 83.24,
  share: 28.0,
  ev_sales: 550000,
  stock_M: 1.940,
  region: 'Europe'
}, {
  country: 'Uzbekistan',
  urban: 51.00,
  share: 5.0,
  ev_sales: 22600,
  stock_M: 0.040,
  region: 'Asia'
}, {
  country: 'Viet Nam',
  urban: 38.49,
  share: 17.0,
  ev_sales: 69084,
  stock_M: 0.130,
  region: 'Asia'
}];

// ---------- OLS coefficients from ols_final_results.csv ----------
// These are RAW (not standardized) coefficients on log(EV sales) as the target.
// All five non-intercept predictors are significant at p < 0.001 due to the large
// pooled panel (≈ 53 countries × multiple years). The signs and magnitudes tell
// the story; absolute size depends on the unit of each predictor.
const OLS_COEFS = [{
  feature: 'Electricity generation (log)',
  coef: 2.20,
  lo: 1.96,
  hi: 2.44,
  p: 2.5e-59
}, {
  feature: 'Year (per year)',
  coef: 0.48,
  lo: 0.45,
  hi: 0.52,
  p: 1.7e-122
}, {
  feature: 'Urbanization (% pop urban)',
  coef: 0.027,
  lo: 0.016,
  hi: 0.037,
  p: 7.9e-7
}, {
  feature: 'Greenhouse gas per capita',
  coef: -0.082,
  lo: -0.112,
  hi: -0.052,
  p: 1.2e-7
}, {
  feature: 'Population (log)',
  coef: -1.28,
  lo: -1.50,
  hi: -1.06,
  p: 1.6e-28
}];
const OLS_FIT = {
  r2: 0.696,
  n: 651,
  n_label: 'n = 651 country-year observations',
  target: 'log(EV sales)'
};

// ---------- Adoption gap, 2024 (from adoption_gap_top_bottom_2024.csv) ----------
// gap = actual EV sales vs OLS-expected. Positive = overperforms fundamentals; negative = underperforms.
// adoption_gap_log is the gap on the log(EV sales) scale (the modeling target), used for the bar chart.
const ADOPTION_GAP_TOP_BOTTOM = [
  { country: 'Luxembourg',     group: 'Overperformers',  gapLog: 2.7195060180581425,  evSales: 16800.0,    expected: 1106.3086044932193,  share: 36.0,  urban: 94.84387029 },
  { country: 'United Kingdom', group: 'Overperformers',  gapLog: 1.5206843593539467,  evSales: 550000.0,   expected: 120208.46190957763,  share: 28.0,  urban: 83.24295444 },
  { country: 'Portugal',       group: 'Overperformers',  gapLog: 1.4933697863096658,  evSales: 70000.0,    expected: 15722.237935817855,  share: 33.0,  urban: 61.32819073 },
  { country: 'China',          group: 'Overperformers',  gapLog: 1.3710271513543155,  evSales: 11300000.0, expected: 2868460.0397231984,  share: 48.0,  urban: 65.8946981  },
  { country: 'Belgium',        group: 'Overperformers',  gapLog: 1.2816586140514605,  evSales: 197000.0,   expected: 54681.85321997273,   share: 43.0,  urban: 87.6126557  },
  { country: 'Denmark',        group: 'Overperformers',  gapLog: 1.2183138620818266,  evSales: 96100.0,    expected: 28418.7935862495,    share: 56.0,  urban: 88.69605527 },
  { country: 'Costa Rica',     group: 'Overperformers',  gapLog: 1.1382302112891072,  evSales: 11022.0,    expected: 3530.6097530452407,  share: 15.0,  urban: 79.31076724 },
  { country: 'Ireland',        group: 'Overperformers',  gapLog: 1.1008495596303174,  evSales: 30000.0,    expected: 9976.98488704111,    share: 25.0,  urban: 64.34703793 },
  { country: 'Uzbekistan',     group: 'Overperformers',  gapLog: 1.0981510256514966,  evSales: 22600.0,    expected: 7536.142470047644,   share: 5.0,   urban: 50.99866867 },
  { country: 'Indonesia',      group: 'Overperformers',  gapLog: 1.0589056269331145,  evSales: 49150.0,    expected: 17046.295429870024,  share: 7.3,   urban: 58.75096354 },
  { country: 'Mexico',         group: 'Underperformers', gapLog: -1.134846704238143,  evSales: 27100.0,    expected: 84301.98990461408,   share: 2.2,   urban: 79.7538806  },
  { country: 'Sweden',         group: 'Underperformers', gapLog: -1.2041053414708642, evSales: 157000.0,   expected: 523405.0328109966,   share: 58.0,  urban: 88.85597483 },
  { country: 'Korea',          group: 'Underperformers', gapLog: -1.4508435494744276, evSales: 127900.0,   expected: 545715.7545813076,   share: 9.2,   urban: 81.16825285 },
  { country: 'Norway',         group: 'Underperformers', gapLog: -1.6195334086891489, evSales: 113500.0,   expected: 573262.2619519104,   share: 92.0,  urban: 83.32937379 },
  { country: 'Japan',          group: 'Underperformers', gapLog: -2.242678889165072,  evSales: 103000.0,   expected: 970116.8763120743,   share: 2.8,   urban: 92.1901718  },
  { country: 'Russia',         group: 'Underperformers', gapLog: -2.2457514614949634, evSales: 32600.0,    expected: 307997.3495156479,   share: 2.9,   urban: 75.11191362 },
  { country: 'Chile',          group: 'Underperformers', gapLog: -2.302633941898481,  evSales: 5600.0,     expected: 56011.73609396444,   share: 2.1,   urban: 88.99509085 },
  { country: 'Bulgaria',       group: 'Underperformers', gapLog: -2.3544106320455223, evSales: 2170.0,     expected: 22863.79800763309,   share: 5.0,   urban: 73.94993569 },
  { country: 'South Africa',   group: 'Underperformers', gapLog: -3.171768298867426,  evSales: 1940.0,     expected: 46291.113094663655,  share: 0.61, urban: 63.69179849 },
  { country: 'Iceland',        group: 'Underperformers', gapLog: -3.799534268282775,  evSales: 4300.0,     expected: 192169.27386935623,  share: 42.0,  urban: 94.18190399 }
];

// Full 2024 set (from adoption_gap_2024.csv) for the actual-vs-expected scatter.
// expected/actual on the raw EV-sales scale; gapLog = sign of over/under-performance.
const ADOPTION_GAP_2024 = [
  { country: 'Luxembourg',     evSales: 16800.0,    expected: 1106.3086044932193,  gapLog: 2.7195060180581425 },
  { country: 'United Kingdom', evSales: 550000.0,   expected: 120208.46190957763,  gapLog: 1.5206843593539467 },
  { country: 'Portugal',       evSales: 70000.0,    expected: 15722.237935817855,  gapLog: 1.4933697863096658 },
  { country: 'China',          evSales: 11300000.0, expected: 2868460.0397231984,  gapLog: 1.3710271513543155 },
  { country: 'Belgium',        evSales: 197000.0,   expected: 54681.85321997273,   gapLog: 1.2816586140514605 },
  { country: 'Denmark',        evSales: 96100.0,    expected: 28418.7935862495,    gapLog: 1.2183138620818266 },
  { country: 'Costa Rica',     evSales: 11022.0,    expected: 3530.6097530452407,  gapLog: 1.1382302112891072 },
  { country: 'Ireland',        evSales: 30000.0,    expected: 9976.98488704111,    gapLog: 1.1008495596303174 },
  { country: 'Uzbekistan',     evSales: 22600.0,    expected: 7536.142470047644,   gapLog: 1.0981510256514966 },
  { country: 'Indonesia',      evSales: 49150.0,    expected: 17046.295429870024,  gapLog: 1.0589056269331145 },
  { country: 'Thailand',       evSales: 80400.0,    expected: 28272.958674606394,  gapLog: 1.0450854210788183 },
  { country: 'Viet Nam',       evSales: 69084.0,    expected: 25841.04815094145,   gapLog: 0.9833346919280306 },
  { country: 'Germany',        evSales: 570000.0,   expected: 256134.5168536585,   gapLog: 0.799931448086868 },
  { country: 'Lithuania',      evSales: 3500.0,     expected: 1749.4716115304857,  gapLog: 0.6931633980404985 },
  { country: 'Netherlands',    evSales: 182000.0,   expected: 119053.05852223319,  gapLog: 0.4244345183104645 },
  { country: 'India',          evSales: 92095.0,    expected: 65105.63372627846,   gapLog: 0.34680506668461497 },
  { country: 'Italy',          evSales: 118000.0,   expected: 86666.32683705314,   gapLog: 0.3086161393370084 },
  { country: 'Romania',        evSales: 9800.0,     expected: 7505.61171563625,    gapLog: 0.2667002270075809 },
  { country: 'Austria',        evSales: 62000.0,    expected: 57535.25007918654,   gapLog: 0.07473532862560006 },
  { country: 'Colombia',       evSales: 13100.0,    expected: 12801.792022717698,  gapLog: 0.02302528925732794 },
  { country: 'Australia',      evSales: 112000.0,   expected: 109531.24467251604,  gapLog: 0.022288822023323718 },
  { country: 'Hungary',        evSales: 14300.0,    expected: 14120.890324115118,  gapLog: 0.012603366140700345 },
  { country: 'Latvia',         evSales: 2100.0,     expected: 2252.7632612697676,  gapLog: -0.07018795774607156 },
  { country: 'Poland',         evSales: 32000.0,    expected: 35788.93297044466,   gapLog: -0.11189949960763279 },
  { country: 'Brazil',         evSales: 125000.0,   expected: 145185.95583569503,  gapLog: -0.14970052524259359 },
  { country: 'France',         evSales: 450000.0,   expected: 524775.2527154583,   gapLog: -0.15372218146084826 },
  { country: 'Estonia',        evSales: 2600.0,     expected: 3111.9181986101926,  gapLog: -0.17966462729793964 },
  { country: 'Turkiye',        evSales: 105700.0,   expected: 131310.6748108749,   gapLog: -0.21695934085331636 },
  { country: 'Spain',          evSales: 128000.0,   expected: 172054.94128118013,  gapLog: -0.295781587552149 },
  { country: 'Croatia',        evSales: 3200.0,     expected: 4393.035971574311,   gapLog: -0.3167848994624194 },
  { country: 'USA',            evSales: 1520000.0,  expected: 2199055.318906478,   gapLog: -0.369317329636333 },
  { country: 'Israel',         evSales: 76400.0,    expected: 110686.63789016395,  gapLog: -0.37071637621116516 },
  { country: 'Cyprus',         evSales: 1860.0,     expected: 2829.904076343453,   gapLog: -0.4194821445834993 },
  { country: 'Canada',         evSales: 252000.0,   expected: 430390.6221127346,   gapLog: -0.5352624875491507 },
  { country: 'Switzerland',    evSales: 67000.0,    expected: 115149.96407602569,  gapLog: -0.541536453928261 },
  { country: 'Finland',        evSales: 37000.0,    expected: 69499.4572374379,    gapLog: -0.6303883921990181 },
  { country: 'Slovenia',       evSales: 4300.0,     expected: 8712.345154773437,   gapLog: -0.7060082224324216 },
  { country: 'Greece',         evSales: 17000.0,    expected: 38126.179745283065,  gapLog: -0.8076552410844027 },
  { country: 'Malaysia',       evSales: 27300.0,    expected: 70056.09993265667,   gapLog: -0.942387291303044 },
  { country: 'New Zealand',    evSales: 9700.0,     expected: 25209.15956209203,   gapLog: -0.9550180975180673 },
  { country: 'Czech Republic', evSales: 15800.0,    expected: 42021.013280095154,  gapLog: -0.9781203775246485 },
  { country: 'Slovakia',       evSales: 4400.0,     expected: 11926.395085558024,  gapLog: -0.9970060745277447 },
  { country: 'Mexico',         evSales: 27100.0,    expected: 84301.98990461408,   gapLog: -1.134846704238143 },
  { country: 'Sweden',         evSales: 157000.0,   expected: 523405.0328109966,   gapLog: -1.2041053414708642 },
  { country: 'Korea',          evSales: 127900.0,   expected: 545715.7545813076,   gapLog: -1.4508435494744276 },
  { country: 'Norway',         evSales: 113500.0,   expected: 573262.2619519104,   gapLog: -1.6195334086891489 },
  { country: 'Japan',          evSales: 103000.0,   expected: 970116.8763120743,   gapLog: -2.242678889165072 },
  { country: 'Russia',         evSales: 32600.0,    expected: 307997.3495156479,   gapLog: -2.2457514614949634 },
  { country: 'Chile',          evSales: 5600.0,     expected: 56011.73609396444,   gapLog: -2.302633941898481 },
  { country: 'Bulgaria',       evSales: 2170.0,     expected: 22863.79800763309,   gapLog: -2.3544106320455223 },
  { country: 'South Africa',   evSales: 1940.0,     expected: 46291.113094663655,  gapLog: -3.171768298867426 },
  { country: 'Iceland',        evSales: 4300.0,     expected: 192169.27386935623,  gapLog: -3.799534268282775 }
];

// ---------- Granger causality (China, urbanization -> EV sales share) - real values from granger_china_results.csv ----------
const GRANGER = [{
  lag: 1,
  F: 1.021,
  p: 0.334,
  signif: false
}, {
  lag: 2,
  F: 1.208,
  p: 0.348,
  signif: false
}];

// ---------- Model comparison from model_comparison_results.csv (log-target metrics) ----------
// Metric is MAE on log(EV sales), so RMSE/MAE values are in log units (~e^x backs out to sales).
// Lasso narrowly tops the table; tree-based models trail.
const MODEL_COMPARE = [{
  model: 'Lasso',
  r2: 0.490,
  mae: 1.105,
  rmse: 1.459
}, {
  model: 'Ridge',
  r2: 0.484,
  mae: 1.112,
  rmse: 1.468
}, {
  model: 'Linear Regression',
  r2: 0.471,
  mae: 1.125,
  rmse: 1.485
}, {
  model: 'Random Forest',
  r2: 0.449,
  mae: 1.268,
  rmse: 1.517
}, {
  model: 'Gradient Boosting',
  r2: 0.390,
  mae: 1.298,
  rmse: 1.596
}];

// ---------- Year-on-year anomalies (synchronized global moves) ----------
const ANOMALY_YEARS = {
  2020: {
    dir: 'down',
    label: 'COVID-19 demand shock'
  },
  2021: {
    dir: 'up',
    label: 'Post-COVID rebound + EU Green Deal'
  },
  2022: {
    dir: 'up',
    label: 'Oil-price spike (Ukraine war)'
  }
};

// ---------- Forecasting ----------
// ARIMA(1,2,1) projected mean + CIs, 2024..2029, plus STEPS marker at 2030
const FORECAST = {
  years_hist: YEARS,
  hist_M: WORLD_EV_STOCK_M,
  fc_years: [2024, 2025, 2026, 2027, 2028, 2029],
  fc_mean: [58.1, 80.5, 109.0, 145.0, 188.0, 240.0],
  ci80_lo: [58.1, 76.0, 100.0, 130.0, 165.0, 207.7],
  ci80_hi: [58.1, 85.0, 118.0, 161.0, 211.0, 284.7],
  ci95_lo: [58.1, 72.5, 92.0, 118.0, 148.0, 184.0],
  ci95_hi: [58.1, 88.5, 126.0, 173.0, 228.0, 308.0],
  steps_2030: 232.2
};

// Expose globally for other Babel scripts
Object.assign(window, {
  PALETTE,
  REGION_COLORS,
  YEARS,
  WORLD_EV_STOCK_M,
  WORLD_SALES_SHARE,
  WORLD_STOCK_SHARE,
  STEPS_2030,
  WORLD_STOCK_BY_POWERTRAIN,
  STEPS_STOCK_BY_POWERTRAIN_2030,
  WORLD_CHARGERS,
  STEPS_CHARGERS_2030,
  MODE_SHARE_2024,
  COUNTRY_STOCK_M,
  COUNTRY_SALES_2024_M,
  REGION_AGGS_2024,
  COUNTRY_SMALL_2024,
  REGION_BY_PT,
  CN_US_SALES,
  POLICY_EVENTS,
  TOP20_MIX,
  STRESS_2024,
  CONTINENT_COLORS,
  INCOME_COLORS,
  SOCIO_2024,
  INCOME_MEDIANS,
  FORECAST,
  CHOROPLETH_2024,
  URBAN_PCT_WORLD,
  GAS_PRICE_USD_L,
  TRANSPORT_CO2_GT,
  CHINA_DUAL,
  URBAN_VS_EV_2024,
  OLS_COEFS,
  OLS_FIT,
  GRANGER,
  MODEL_COMPARE,
  ADOPTION_GAP_TOP_BOTTOM,
  ADOPTION_GAP_2024,
  ANOMALY_YEARS
});
