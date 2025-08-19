# UC Berkeley Assist Tool

This project provides an easy way to explore **course articulation agreements** between UC Berkeley and California community colleges.  
It combines a **React + Tailwind frontend** with a **Python Selenium scraper** that fetches data from [assist.org](https://assist.org).

---

## Features

### Frontend
- **Two browsing modes**
  - *By Berkeley Course*: Choose a UC Berkeley course and see all equivalent community college courses.
  - *By Community College*: Select a community college and view all of its courses that articulate with UC Berkeley.
- **Interactive UI**
  - Tabbed navigation between modes.
  - Dropdown selectors for quick search.
  - Tables with widened layout and styled headers.
- **Branding**
  - UC Berkeley theme colors (Berkeley Blue `#002676`, California Gold `#FDB515`).
  - Fonts: Serif 4 + Barlow.
  - Disclaimer pinned at bottom of the page.

### Scraper
- Scrapes [assist.org](https://assist.org) to collect articulation agreements between **California Community Colleges** (sending institutions) and **UC Berkeley** (receiving institution).
- Collects **By Department** agreements with UC Berkeley.
- Extracts **CC course → UC Berkeley course** mappings.
- Saves results as `CSV` (used by the frontend).
- Removes duplicates and sorts by Berkeley course.
- Configurable scrolling, headless mode, and Chrome driver options.

---

## Tech Stack
- **Frontend**
  - React + Vite
  - Tailwind CSS
  - PapaParse (for CSV parsing)
- **Backend / Scraping**
  - Python 3
  - Selenium
  - WebDriver Manager (for managing ChromeDriver)
  - BeautifulSoup4 + Pandas (optional post-processing)

---

## Project Structure
├── public/
├── src/
│ ├── data/
│ │ └── articulations.csv # Scraped articulation data consumed by frontend
│ ├── App.jsx # Main React app
│ ├── Tabs.jsx # Tab navigation component
│ ├── main.jsx # React entry point
│ └── index.css # Tailwind styles
├── tailwind.config.js
├── index.html # Loads fonts + root div
├── package.json
└── scraper.py # Python Selenium scraper for ASSIST.org

---

## Data Flow
1. **Scraper (`scraper.py`)**
   - Navigates to ASSIST.org articulation pages.
   - Extracts Berkeley courses, community college courses, and college names.
   - Removes duplicates and sorts results.
   - Writes output to `src/data/articulations.csv` with columns:
     ```
     b_course, cc_name, cc_course
     ```

2. **Frontend (`App.jsx`)**
   - Loads CSV data using PapaParse.
   - Provides dropdowns for either a Berkeley course or a community college.
   - Displays results in styled, responsive tables.

---

## Usage

### Frontend
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Scraper
```bash
python -m venv .venv
source .venv/bin/activate
pip install selenium webdriver-manager beautifulsoup4 pandas
python src/scraper.py --links links.txt
```
Output will be saved to src/data/articulations.csv

### Disclaimer
This project is an independent tool and is not affiliated with UC Berkeley or ASSIST.org.
Always confirm transfer agreements through [official sources](https://assist.org).