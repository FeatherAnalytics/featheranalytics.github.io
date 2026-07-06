---
layout: page
title: Projects
subtitle: Data visualizations and tools
---

A collection of data projects.

---

## [Capital Flow Cityscape](https://www.featheranalytics.dev/capital-flows-city/)

A 3D cityscape where buildings represent financial securities, districts represent asset classes, and the flows of capital between them become visible paths through a living city. Built on Two.js with randomized data.

- **Buildings** = Individual tickers (QQQ, AAPL, SPY, etc.)
- **Neighborhoods** = Asset sub-types (Bond ETF, REIT, Money Market, etc.)
- **Districts** = Asset classes (Stocks, ETFs, Bonds, Mutual Funds, Options, Futures)

Hovering a building reveals curved arcs connecting it to every ticker it exchanged capital with — thicker arcs for larger flows, with animated dots during timelapse playback.

* [Late February to early March, 2026](https://www.featheranalytics.dev/capital-flows-city/)
* [Selloff View](https://www.featheranalytics.dev/capital-flows-city/selloff.html)
* [Single Day View](https://www.featheranalytics.dev/capital-flows-city/one_day.html)

---

## [UrbanStack](https://www.featheranalytics.dev/urbanstack)

A multi-layer urban data platform combining transportation, infrastructure spending, walkability, demographics, and economic data. Built with Next.js and deck.gl.

Data layers include Census ACS demographics, FHWA traffic volumes, EPA walkability scores, federal infrastructure spending, GTFS transit routes, and traffic fatality data from NHTSA.

Geographical areas include:

* Austin
* Boston
* Chicago
* Dallas Fort Worth
* Houston 
* New York City
* San Antonio

---

## [World Cup 2026: Where Players Come From](https://www.featheranalytics.dev/worldcup-2026)

An interactive map exploring where every player in the 2026 FIFA World Cup was born versus which national team they represent. Nearly 1 in 4 players represents a country they weren't born in.

Three views reveal different facets of the data:

- **Diaspora** — Arc map showing the flow of talent from birth countries to national teams, color-coded by confederation
- **Squads** — Per-team dot map showing where each squad's 26 players were born
- **Origins** — Choropleth highlighting which countries export the most players to other teams

Data sourced from Wikipedia and Wikidata. Built with Next.js, deck.gl, and MapLibre.
