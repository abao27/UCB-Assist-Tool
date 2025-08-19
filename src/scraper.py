from __future__ import annotations

import argparse
import sys
import time
import csv
from dataclasses import dataclass
from typing import List, Tuple, Optional

from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options as ChromeOptions
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import TimeoutException, WebDriverException, JavascriptException

try:
    from webdriver_manager.chrome import ChromeDriverManager
    HAVE_WDM = True
except Exception:
    HAVE_WDM = False


def log(m: str) -> None:
    print(m, flush=True)

def warn(m: str) -> None:
    print(f"[warn] {m}", flush=True)

def err(m: str) -> None:
    print(f"[error] {m}", file=sys.stderr, flush=True)


# <---------------- Selenium bootstrap ---------------->

def make_webdriver(headless: bool = True,
                   driver_path: Optional[str] = None,
                   window_size: str = "1600,2200",
                   user_agent: Optional[str] = None):
    opts = ChromeOptions()
    if headless:
        opts.add_argument("--headless=new")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument(f"--window-size={window_size}")
    opts.add_argument("--disable-blink-features=AutomationControlled")
    if user_agent:
        opts.add_argument(f"--user-agent={user_agent}")

    if driver_path:
        service = Service(driver_path)
        return webdriver.Chrome(service=service, options=opts)

    if HAVE_WDM:
        path = ChromeDriverManager().install()
        service = Service(path)
        return webdriver.Chrome(service=service, options=opts)

    return webdriver.Chrome(options=opts)


def smart_scroll_to_load(driver, max_loops: int = 30, min_stalls: int = 3, pause: float = 0.35) -> None:
    last_h = 0
    stalls = 0
    for _ in range(max_loops):
        try:
            h = driver.execute_script(
                "return Math.max(document.body.scrollHeight, document.documentElement.scrollHeight);"
            )
        except JavascriptException:
            h = last_h
        if h == last_h:
            stalls += 1
            if stalls >= min_stalls:
                break
        else:
            stalls = 0
        driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
        time.sleep(pause)
        last_h = h
    try:
        driver.execute_script("window.scrollTo(0,0);")
    except Exception:
        pass


# <---------------- DOM-based extractor ---------------->

def extract_pairs(driver) -> Tuple[str, List[Tuple[str,str]]]:
    pairs: List[Tuple[str,str]] = []

    # Find community college name
    cc_name = ""
    try:
        inst = driver.find_element(By.CSS_SELECTOR, ".instSending .inst b")
        text = inst.text.strip()
        if text.lower().startswith("from:"):
            cc_name = text.split("From:",1)[1].strip()
        else:
            cc_name = text
    except Exception:
        cc_name = ""

    # Extract articulation rows
    rows = driver.find_elements(By.CSS_SELECTOR, ".articRow")

    for row in rows:
        # Skip geAreaCode rows
        if row.find_elements(By.CSS_SELECTOR, ".geAreaCode"):
            continue

        # Receiving (UC Berkeley)
        recv_tokens = row.find_elements(By.CSS_SELECTOR, ".rowReceiving .prefixCourseNumber")
        recv = " + ".join([t.text.strip() for t in recv_tokens if t.text.strip()])

        # Sending (Community College)
        if row.find_elements(By.XPATH, ".//div[@class='rowSending']//p[contains(text(),'No Course Articulated')]"):
            continue
        send_tokens = row.find_elements(By.CSS_SELECTOR, ".rowSending .prefixCourseNumber")
        send = " + ".join([t.text.strip() for t in send_tokens if t.text.strip()])

        if recv and send:
            pairs.append((recv, send))

    # Remove duplicates
    seen = set()
    final: List[Tuple[str,str]] = []
    for a,b in pairs:
        if (a,b) not in seen:
            seen.add((a,b))
            final.append((a,b))
    return cc_name, final


# <---------------- Per-URL ---------------->

def process_html_link(driver, url: str, scroll_passes: int = 10) -> List[Tuple[str,str,str]]:
    log(f"→ {url}")
    start_time = time.perf_counter()

    driver.get(url)
    try:
        WebDriverWait(driver, 25).until(EC.presence_of_element_located((By.TAG_NAME, "body")))
    except TimeoutException:
        warn("Timed out waiting for <body>")
    smart_scroll_to_load(driver, max_loops=max(20, scroll_passes * 3), min_stalls=3, pause=0.35)

    try:
        cc_name, pairs = extract_pairs(driver)
        elapsed = time.perf_counter() - start_time
        log(f"  + {len(pairs)} mappings from {cc_name} (took {elapsed:.2f}s)")
        return [(a, cc_name, b) for (a,b) in pairs]
    except Exception as e:
        warn(f"  · extract error: {e}")
        return []


# <---------------- CLI ---------------->

@dataclass
class Args:
    links: Optional[str]
    url: List[str]
    out: str
    no_headless: bool
    driver_path: Optional[str]
    scroll_passes: int
    window_size: str

def parse_args() -> Args:
    ap = argparse.ArgumentParser(description="ASSIST scraper (DOM-based)")
    ap.add_argument("--links", help="Text file with one non-PDF agreement URL per line.")
    ap.add_argument("--url", action="append", default=[], help="Add a single agreement URL (can repeat).")
    ap.add_argument("--out", default="src/out/articulations.csv", help="Output CSV file (default: src/out/articulations.csv).")
    ap.add_argument("--no-headless", action="store_true", help="Show browser window.")
    ap.add_argument("--driver-path", default=None, help="Path to chromedriver (optional).")
    ap.add_argument("--scroll-passes", type=int, default=10, help="Scroll intensity (default: 10).")
    ap.add_argument("--window-size", default="1600,2200", help='Window size "W,H" (default: 1600,2200)')
    a = ap.parse_args()

    urls: List[str] = []
    if a.links:
        try:
            with open(a.links, "r", encoding="utf-8") as f:
                for line in f:
                    s = line.strip()
                    if s and not s.startswith("#"):
                        urls.append(s)
        except OSError as e:
            err(f"Failed to read links file: {e}")
            sys.exit(1)
    urls.extend(a.url)
    if not urls:
        err("No URLs provided. Use --links links.txt or --url <agreement>.")
        sys.exit(2)

    return Args(
        links=a.links,
        url=urls,
        out=a.out,
        no_headless=a.no_headless,
        driver_path=a.driver_path,
        scroll_passes=max(1, a.scroll_passes),
        window_size=a.window_size,
    )


def main() -> None:
    args = parse_args()
    try:
        driver = make_webdriver(
            headless=not args.no_headless,
            driver_path=args.driver_path,
            window_size=args.window_size
        )
    except WebDriverException as e:
        err(f"Could not start Chrome: {e}")
        sys.exit(3)

    start_all = time.perf_counter()
    all_rows: List[Tuple[str,str,str]] = []
    try:
        for url in args.url:
            try:
                rows = process_html_link(driver, url, scroll_passes=args.scroll_passes)
            except Exception as e:
                warn(f"Failed on URL: {url} ({e})")
                rows = []
            all_rows.extend(rows)
    finally:
        try:
            driver.quit()
        except Exception:
            pass

    # Remove duplications, sort by b_course
    seen = set()
    unique: List[Tuple[str,str,str]] = []
    for row in all_rows:
        if row not in seen:
            seen.add(row)
            unique.append(row)
    unique.sort(key=lambda x: x[0])  # sort by b_course

    # Write CSV
    try:
        with open(args.out, "w", encoding="utf-8", newline="") as f:
            writer = csv.writer(f)
            writer.writerow(["b_course", "cc_name", "cc_course"])
            for ucb, cc_name, cc_course in unique:
                writer.writerow([ucb, cc_name, cc_course])
    except OSError as e:
        err(f"Failed to write {args.out}: {e}")
        sys.exit(4)

    total_time = time.perf_counter() - start_all
    log(f"✓ Wrote {len(unique)} rows to {args.out} in {total_time:.2f}s")


if __name__ == "__main__":
    main()
