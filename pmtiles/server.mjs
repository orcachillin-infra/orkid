import fs from "node:fs";
import http from "node:http";
import { PMTiles } from "pmtiles";

/**
 * serves vector tiles out of a .pmtiles archive as plain xyz, plus a map style
 * pointing at itself. orkid holds the archive, the phone pulls tiles over netbird.
 *
 * maplibre native (android) has no pmtiles:// protocol, which is why this exists
 * at all instead of just pointing the client at the file.
 */

const FILE = process.env.PMTILES ?? "/data/wa.pmtiles";
const PORT = Number(process.env.PORT ?? 8090);

/** the pmtiles js source interface is browser shaped; this is the node version. */
class NodeFileSource {
  constructor(path) {
    this.fd = fs.openSync(path, "r");
    this.size = fs.fstatSync(this.fd).size;
  }
  getKey() {
    return `nodefile://${this.size}`;
  }
  getBytes(offset, length) {
    return new Promise((resolve, reject) => {
      const buf = Buffer.allocUnsafe(length);
      fs.read(this.fd, buf, 0, length, offset, (err, bytesRead) => {
        if (err) return reject(err);
        resolve({
          data: buf.buffer.slice(buf.byteOffset, buf.byteOffset + bytesRead),
        });
      });
    });
  }
}

const archive = new PMTiles(new NodeFileSource(FILE));

const STYLE = {
  version: 8,
  name: "wa-dark",
  glyphs: "https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf",
  sources: {
    pm: {
      type: "vector",
      tiles: ["/tiles/{z}/{x}/{y}.mvt"],
      minzoom: 0,
      maxzoom: 15,
      attribution: "\u00a9 OpenStreetMap",
    },
  },
  layers: [
    { id: "bg", type: "background", paint: { "background-color": "#080809" } },
    { id: "earth", type: "fill", source: "pm", "source-layer": "earth",
      paint: { "fill-color": "#101013" } },
    { id: "landuse", type: "fill", source: "pm", "source-layer": "landuse",
      paint: { "fill-color": "#131318", "fill-opacity": 0.8 } },
    { id: "water", type: "fill", source: "pm", "source-layer": "water",
      paint: { "fill-color": "#0b1622" } },
    { id: "buildings", type: "fill", source: "pm", "source-layer": "buildings", minzoom: 13,
      paint: { "fill-color": "#1a1a1f" } },
    { id: "road-minor", type: "line", source: "pm", "source-layer": "roads", minzoom: 12,
      filter: ["in", "kind", "minor_road", "path"],
      paint: { "line-color": "#232327", "line-width": ["interpolate", ["linear"], ["zoom"], 12, 0.4, 16, 1.4] } },
    { id: "road-mid", type: "line", source: "pm", "source-layer": "roads", minzoom: 8,
      filter: ["in", "kind", "major_road", "medium_road"],
      paint: { "line-color": "#3a3a41", "line-width": ["interpolate", ["linear"], ["zoom"], 8, 0.4, 16, 2.6] } },
    { id: "road-hwy", type: "line", source: "pm", "source-layer": "roads",
      filter: ["==", "kind", "highway"],
      paint: { "line-color": "#4c4c55", "line-width": ["interpolate", ["linear"], ["zoom"], 6, 0.6, 16, 3.6] } },
    { id: "place", type: "symbol", source: "pm", "source-layer": "places", minzoom: 10,
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Regular"],
        "text-size": ["interpolate", ["linear"], ["zoom"], 10, 10, 16, 14],
      },
      paint: { "text-color": "#8c8c94", "text-halo-color": "#000000", "text-halo-width": 1 } },
    { id: "road-label", type: "symbol", source: "pm", "source-layer": "roads", minzoom: 14,
      filter: ["has", "name"],
      layout: {
        "text-field": ["get", "name"],
        "text-font": ["Noto Sans Regular"],
        "symbol-placement": "line",
        "text-size": 9,
      },
      paint: { "text-color": "#6a6a72", "text-halo-color": "#000000", "text-halo-width": 1 } },
  ],
};

function json(res, code, body) {
  res.writeHead(code, {
    "content-type": "application/json",
    "access-control-allow-origin": "*",
  });
  res.end(JSON.stringify(body));
}

http.createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", "http://x");
  try {
    if (url.pathname === "/health") {
      return json(res, 200, { ok: true, file: FILE, bytes: (archive).fileSize ?? null });
    }
    if (url.pathname === "/style.json") {
      return json(res, 200, STYLE);
    }
    const m = url.pathname.match(/^\/tiles\/(\d+)\/(\d+)\/(\d+)\.mvt$/);
    if (m) {
      const z = Number(m[1]), x = Number(m[2]), y = Number(m[3]);
      const tile = await archive.getZxy(z, x, y);
      if (!tile || !tile.data) {
        res.writeHead(204, { "access-control-allow-origin": "*" });
        return res.end();
      }
      const buf = Buffer.from(tile.data);
      res.writeHead(200, {
        "content-type": "application/x-protobuf",
        "content-length": buf.length,
        "access-control-allow-origin": "*",
        "cache-control": "public, max-age=3600",
      });
      return res.end(buf);
    }
    res.writeHead(404, { "access-control-allow-origin": "*" });
    res.end("nope");
  } catch (e) {
    json(res, 500, { error: String(e) });
  }
}).listen(PORT, () => {
  console.error(`pmtiles serving ${FILE} on :${PORT}`);
  console.error(`  /style.json   /tiles/{z}/{x}/{y}.mvt`);
});
