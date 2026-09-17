#!/usr/bin/env python3
"""Refresh hero and cinemetrics data snapshots from sibling DuckDB databases.

Run by hand when data should be refreshed; not part of the build.
Requires: pip install duckdb (or use uv from either sibling repo).

Environment variables (with defaults pointing at sibling repos):
  ZNHSTRY_DB    path to znhstry DuckDB database
  CINEMETRICS_DB path to cinemetrics DuckDB database
"""

import json
import os
from pathlib import Path

import duckdb

SCRIPT_DIR = Path(__file__).parent
SITE_ROOT = SCRIPT_DIR.parent

ZNHSTRY_DB = os.environ.get(
    "ZNHSTRY_DB",
    str(SITE_ROOT.parent / "znhstry" / "data" / "znhstry.duckdb"),
)
CINEMETRICS_DB = os.environ.get(
    "CINEMETRICS_DB",
    str(SITE_ROOT.parent / "cinemetrics" / "data" / "movies.duckdb"),
)

OUT_DIR = SITE_ROOT / "src" / "data"


def refresh_zone_history():
    con = duckdb.connect(ZNHSTRY_DB, read_only=True)
    rows = con.sql("""
        SELECT
            date_trunc('month', activity_date)::DATE AS month,
            SUM(event_count)::BIGINT AS events,
            SUM(legion_bots)::DOUBLE AS legion,
            SUM(swarm_bots)::DOUBLE AS swarm,
            SUM(faceless_bots)::DOUBLE AS faceless,
            SUM(total_bots)::DOUBLE AS total
        FROM fct_global_daily
        WHERE activity_date < date_trunc('month', current_date)::DATE
        GROUP BY 1
        HAVING SUM(event_count) > 0
            AND month >= '2012-05-01'
        ORDER BY 1
    """).fetchall()
    con.close()

    data = []
    for month, events, legion, swarm, faceless, total in rows:
        if total <= 0:
            continue
        raw_l = legion / total * 100
        raw_s = swarm / total * 100
        raw_f = faceless / total * 100
        s = raw_l + raw_s + raw_f
        data.append({
            "month": month.strftime("%Y-%m"),
            "events": int(events),
            "legion": round(raw_l / s * 100, 1),
            "swarm": round(raw_s / s * 100, 1),
            "faceless": round(raw_f / s * 100, 1),
        })

    out = OUT_DIR / "zone-history-months.json"
    out.write_text(json.dumps(data, separators=(",", ":")))
    print(f"zone-history-months.json: {len(data)} rows, {out.stat().st_size:,} bytes")


def refresh_cinemetrics():
    con = duckdb.connect(CINEMETRICS_DB, read_only=True)
    rows = con.sql("""
        SELECT
            w.film_title,
            w.film_year,
            w.rating_100::INTEGER AS rating,
            w.watched_date,
            CASE WHEN lower(f.genres) LIKE '%horror%' THEN true ELSE false END AS is_horror
        FROM marts.fct_watches w
        JOIN marts.dim_film f ON w.tmdb_id = f.tmdb_id
        WHERE w.rating_100 IS NOT NULL
        ORDER BY w.watched_date
    """).fetchall()
    con.close()

    data = []
    for title, year, rating, watched, is_horror in rows:
        data.append({
            "title": title,
            "year": year,
            "rating": int(rating),
            "watched": watched.strftime("%Y-%m-%d"),
            "isHorror": is_horror,
        })

    out = OUT_DIR / "cinemetrics-watches.json"
    out.write_text(json.dumps(data, separators=(",", ":")))
    print(f"cinemetrics-watches.json: {len(data)} rows, {out.stat().st_size:,} bytes")


if __name__ == "__main__":
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    refresh_zone_history()
    refresh_cinemetrics()
