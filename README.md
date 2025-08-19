# UC Berkeley Assist Tool

This project provides an easy way to explore **course articulation agreements** between UC Berkeley and California community colleges.  
It combines a **React + Tailwind frontend** with a **Python Selenium scraper** that fetches data from [Assist.org](https://assist.org).

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
- Scrapes [Assist.org](https://assist.org) to collect articulation agreements between **California Community Colleges** (sending institutions) and **UC Berkeley** (receiving institution).
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
```bash
├── public/
├── src/
│ ├── in/
│ │ │── homepages.csv
│ │ └── links.txt
│ ├── out/
│ │ └── articulations.csv
│ ├── App.jsx
│ ├── index.css
│ ├── main.jsx
│ ├── scraper.py
│ └── Tabs.jsx
├── index.html
├── launch.json
├── package.json
├── postcss.config.js
├── requirements.txt
├── tailwind.config.js
└── vite.config.js
```

---

## Data Flow
1. **Scraper (`scraper.py`)**
   - Navigates to Assist.org articulation pages.
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
npm install

npm run dev
```

### Scraper
```bash
python -m venv .venv
source .venv/bin/activate
pip install selenium webdriver-manager beautifulsoup4 pandas

python src/scraper.py --links src/in/links.txt
```
Output will be saved to `src/data/articulations.csv`. Currently takes ***13-14 minutes*** to scrape all colleges.

---

### Disclaimer
This project is an independent tool and is not affiliated with UC Berkeley or Assist.org.
Always confirm transfer agreements through [official sources](https://assist.org).