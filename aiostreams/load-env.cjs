const fs = require("node:fs");

const contents = fs.readFileSync("/run/secrets/aiostreams.env", "utf8");

for (const line of contents.split(/\r?\n/)) {
  if (!line || line.startsWith("#")) continue;

  const separator = line.indexOf("=");
  if (separator <= 0) throw new Error("Invalid AIOStreams environment file");

  process.env[line.slice(0, separator)] = line.slice(separator + 1);
}

for (const key of [
  "BASE_URL",
  "SECRET_KEY",
  "AIOSTREAMS_AUTH",
  "ADMIN_PASSWORD",
]) {
  if (!(key in process.env)) throw new Error(`Missing required setting: ${key}`);
}

require("/app/packages/server/dist/server.js");
