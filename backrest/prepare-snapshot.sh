#!/bin/sh
set -eu

umask 077

staging=/staging
next="$staging/next"
current="$staging/current"
previous="$staging/previous"

rm -rf "$next"
mkdir -p \
  "$next/aiostreams" \
  "$next/prowlarr" \
  "$next/komodo-secrets" \
  "$next/backrest"

cp -a /sources/aiostreams/. "$next/aiostreams/"
cp -a /sources/prowlarr/. "$next/prowlarr/"
cp -a /sources/komodo-secrets/. "$next/komodo-secrets/"

find "$next/aiostreams" "$next/prowlarr" -type f \
  \( -name '*.db' -o -name '*.db-*' -o -name '*.sqlite' -o -name '*.sqlite-*' \) \
  -delete

backup_sqlite() {
  source=$1
  destination=$2

  [ -f "$source" ] || return 0
  sqlite3 "$source" ".timeout 30000" ".backup '$destination'"
  [ "$(sqlite3 "$destination" 'PRAGMA quick_check;')" = ok ]
}

for database in /sources/aiostreams/*.db /sources/aiostreams/*.sqlite; do
  [ -f "$database" ] || continue
  backup_sqlite "$database" "$next/aiostreams/$(basename "$database")"
done

for database in /sources/prowlarr/*.db /sources/prowlarr/*.sqlite; do
  [ -f "$database" ] || continue
  backup_sqlite "$database" "$next/prowlarr/$(basename "$database")"
done

if [ -f /config/config.json ]; then
  cp -a /config/config.json "$next/backrest/config.json"
fi

date -u +%Y-%m-%dT%H:%M:%SZ > "$next/snapshot-created-at"

rm -rf "$previous"
if [ -d "$current" ]; then
  mv "$current" "$previous"
fi
mv "$next" "$current"
rm -rf "$previous"
