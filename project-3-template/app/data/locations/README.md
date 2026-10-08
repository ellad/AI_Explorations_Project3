# Location data

The generated JSON files in this directory come from the US Census Bureau's 2026 Gazetteer release:

- [National Places Gazetteer](https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_Gaz_place_national.zip)
- [National ZIP Code Tabulation Areas Gazetteer](https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2026_Gazetteer/2026_Gaz_zcta_national.zip)
- [2020 ZCTA-to-place relationship file](https://www2.census.gov/geo/docs/maps-data/data/rel2020/zcta520/tab20_zcta520_place20_natl.txt)
- [2026 Gazetteer documentation](https://www.census.gov/geographies/reference-files/2026/geo/gazetter-file.html)

Run `npm run build:locations` from `app/` to download the pinned source archives and regenerate the files. The archives are cached in `app/.cache/census/` and are not committed. `metadata.json` records the release, source URLs, archive checksums, record counts, coverage, and compact array formats.

Place files are split by postal state abbreviation. ZIP Code Tabulation Areas are split by first digit. Coordinates are Census representative internal points rather than street addresses or guaranteed USPS delivery points. When a ZCTA intersects one or more named Census places, its display label uses the place with the largest land-area overlap in the 2020 relationship file. This is a representative Census place, not a USPS preferred mailing city. ZCTAs without a named-place relationship retain a ZIP-only label. Puerto Rico is not included because this prototype's selector covers the 50 states and District of Columbia.
