# E-Mobility Global Transition Dashboard

This repository contains a Shiny for Python app that visualizes key EV metrics from the IEA Global EV Outlook 2025 dataset.

## Files

- `app.py` - main Shiny app source file.
- `EVDataExplorer2025.xlsx` - data source file used by the app.
- `requirements.txt` - required Python packages.

## Setup

1. Create and activate a virtual environment:

```powershell
python -m venv venv
.\\venv\\Scripts\\Activate.ps1
```

2. Install dependencies:

```powershell
pip install -r requirements.txt
```

## Run

```powershell
python app.py
```

Then open the local URL shown in the terminal to view the app.

## Notes

- The app expects `EVDataExplorer2025.xlsx` to be located alongside `app.py`.
- If the workbook is missing, add it to the project root.
