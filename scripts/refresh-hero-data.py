#!/usr/bin/env python3
"""Refresh the hero and cinemetrics JSON snapshots from the sibling DuckDB databases.
Run by hand: uv run --with duckdb python scripts/refresh-hero-data.py"""

import json
from pathlib import Path

import duckdb

SITE_ROOT = Path(__file__).resolve().parent.parent
ZNHSTRY_DB = SITE_ROOT.parent / "znhstry" / "data" / "znhstry.duckdb"
CINEMETRICS_DB = SITE_ROOT.parent / "cinemetrics" / "data" / "movies.duckdb"
OUT_DIR = SITE_ROOT / "src" / "data"


def refresh_zone_history():
    con = duckdb.connect(str(ZNHSTRY_DB), read_only=True)
    rows = con.sql("""
        WITH monthly AS (
            SELECT
                date_trunc('month', activity_date)::DATE AS month,
                SUM(event_count)::BIGINT AS events,
                arg_max(legion_bots, activity_date)::DOUBLE AS legion,
                arg_max(swarm_bots, activity_date)::DOUBLE AS swarm,
                arg_max(faceless_bots, activity_date)::DOUBLE AS faceless
            FROM main.fct_global_daily
            WHERE activity_date < date_trunc('month', current_date)::DATE
            GROUP BY 1
        )
        SELECT * FROM monthly
        WHERE events > 0 AND month >= DATE '2012-05-01'
        ORDER BY month
    """).fetchall()
    con.close()

    data = [
        {
            "month": month.strftime("%Y-%m"),
            "events": int(events),
            "legion": round(legion / s * 100, 1),
            "swarm": round(swarm / s * 100, 1),
            "faceless": round(faceless / s * 100, 1),
        }
        for month, events, legion, swarm, faceless in rows
        if (s := legion + swarm + faceless) > 0
    ]

    out = OUT_DIR / "zone-history-months.json"
    out.write_text(json.dumps(data, separators=(",", ":")))
    print(f"zone-history-months.json: {len(data)} rows, {out.stat().st_size:,} bytes")


def refresh_cinemetrics():
    con = duckdb.connect(str(CINEMETRICS_DB), read_only=True)
    rows = con.sql("""
        SELECT
            w.film_title,
            w.film_year,
            w.rating_100::INTEGER AS rating,
            w.watched_date,
            f.genres ILIKE '%horror%' AS is_horror
        FROM marts.fct_watches w
        JOIN marts.dim_film f ON w.tmdb_id = f.tmdb_id
        WHERE w.rating_100 IS NOT NULL
        ORDER BY w.watched_date
    """).fetchall()
    con.close()

    data = [
        {
            "title": title,
            "year": year,
            "rating": int(rating),
            "watched": watched.strftime("%Y-%m-%d"),
            "horror": bool(is_horror),
        }
        for title, year, rating, watched, is_horror in rows
    ]

    out = OUT_DIR / "cinemetrics-watches.json"
    out.write_text(json.dumps(data, separators=(",", ":")))
    print(f"cinemetrics-watches.json: {len(data)} rows, {out.stat().st_size:,} bytes")


if __name__ == "__main__":
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    refresh_zone_history()
    refresh_cinemetrics()
