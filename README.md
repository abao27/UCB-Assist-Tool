# ASSIST.org UC Berkeley Transfer Scraper

This project scrapes [ASSIST.org](https://assist.org) to collect articulation agreements between **California Community Colleges** (sending institutions) and **UC Berkeley** (receiving institution). It extracts course mappings that show which community college courses transfer to UC Berkeley courses.

## Features
- Iterates through all California Community Colleges on ASSIST
- Collects **By Department** agreements with UC Berkeley
- Extracts **CC course → UC Berkeley course** mappings
- Saves results as CSV and Parquet
- Checkpointing system (resume after interruption)

---

# Run commands

Mac:
python -m venv .venv
source .venv/bin/activate
pip install selenium webdriver-manager beautifulsoup4 pandas

python src/scraper.py --links links.txt

or

python src/scraper.py --links links.txt --no-headless

