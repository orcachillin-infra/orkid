# pmtiles

Vector tiles for the launcher's map background, out of a protomaps `.pmtiles` archive.

maplibre native (android) has no `pmtiles://` protocol like the js client does, so this serves
plain xyz tiles out of the archive and hands out a style that points at itself.

## the archive

```
pmtiles extract https://build.protomaps.com/YYYYMMDD.pmtiles /var/lib/pmtiles/wa.pmtiles \
  --bbox=-124.9,45.5,-116.9,49.05
```

range requests pull only washington out of the planet build. washington is ~640mb and takes
about fifteen seconds. refresh it when you want newer osm data.

## endpoints

- `GET /style.json` - dark maplibre style, tiles are relative so it works from any host
- `GET /tiles/{z}/{x}/{y}.mvt` - vector tile
- `GET /health`

## client

point maplibre (or the launcher) at `http://100.114.67.239:8090/style.json`.
tiles are z0-15, so anything closer than z15 is overzoomed.
