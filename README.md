# Orkid Infrastructure

Komodo-managed services running on Orkid.

## Stacks

- `aiostreams`: AIOStreams on the Orkid NetBird address, port 3600.
- `backrest`: Restic backup orchestration on the Orkid NetBird address, port 9898.
- `monitoring`: Grafana, Prometheus, and Orkid's node exporter on NetBird-only ports 3100, 9090, and 9100.
- `crashy`: self-hosted crashy.net rebuild, a Ktor server plus MinIO, on the Orkid NetBird address, port 8081, with its S3 API on port 9000. Fronted by `crashy.orcachill.in` and `us-west.s3.orcachill.in` on dora. See `crashy/README.md`.
- `forgejo`: Forgejo git hosting on the Orkid NetBird address, ports 3000 (web) and 2222 (ssh).
- `forgejo-runner`: Actions runner for the Forgejo instance, shares the host docker socket.
- `pelican`: Pelican game server panel on the Orkid NetBird address, port 8100, with its own PostgreSQL and Redis. Fronted by `panel.orcachill.in` on dora.
- `pelican` also runs Wings as a host service (`wings.service`) against a second, dedicated Docker engine, so Podman keeps `/var/run/docker.sock`. The node answers at `orkid.console.orcachill.in:8095` through dora and stores servers in `/var/lib/pelican/volumes`. See `pelican/README.md`.
- `prowlarr`: Prowlarr on the Orkid NetBird address, port 9696, with an internal FlareSolverr sidecar.

## Runtime State

Runtime data and secrets are deliberately kept outside this repository:

- AIOStreams data: `/var/lib/aiostreams/data`
- AIOStreams environment: `/etc/komodo/secrets/aiostreams.env`
- Backrest state and staging: `/var/lib/backrest`
- Backrest storage credentials: `/var/lib/infisical-agent/rendered/backrest/backrest.env`
- Grafana data: `/var/lib/grafana/data`
- Prometheus data: `/var/lib/prometheus/data`
- Pelican panel data: `/var/lib/pelican/panel`
- Pelican database: `/var/lib/pelican/database`
- Pelican Redis data: `/var/lib/pelican/redis`
- Pelican server volumes: `/var/lib/pelican/volumes`
- Pelican database credentials: `/etc/komodo/secrets/pelican-db.env`
- Pelican admin credentials: `/etc/komodo/secrets/pelican-admin.env`
- Wings configuration: `/etc/pelican/config.yml`
- Retired PufferPanel data, kept until the migration is signed off: `/var/lib/pufferpanel`
- Prowlarr data: `/var/lib/prowlarr/config`
- Crashy crash log cache: `/var/lib/crashy/data`
- Crashy S3 data: `/var/lib/crashy/minio`
- Crashy source checkout: `/var/lib/crashy/src`
- Crashy credentials: `/etc/komodo/secrets/crashy.env`
- Forgejo data: `/var/lib/forgejo`

The AIOStreams environment file must be mode `600` and owned by root. Public ports are bound only to Orkid's NetBird address.
