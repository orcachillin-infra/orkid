# Orkid Infrastructure

Komodo-managed services running on Orkid.

## Stacks

- `aiostreams`: AIOStreams on the Orkid NetBird address, port 3600.
- `backrest`: Restic backup orchestration on the Orkid NetBird address, port 9898.
- `monitoring`: Grafana, Prometheus, and Orkid's node exporter on NetBird-only ports 3100, 9090, and 9100.
- `prowlarr`: Prowlarr on the Orkid NetBird address, port 9696, with an internal FlareSolverr sidecar.

## Runtime State

Runtime data and secrets are deliberately kept outside this repository:

- AIOStreams data: `/var/lib/aiostreams/data`
- AIOStreams environment: `/etc/komodo/secrets/aiostreams.env`
- Backrest state and staging: `/var/lib/backrest`
- Backrest storage credentials: `/var/lib/infisical-agent/rendered/backrest/backrest.env`
- Grafana data: `/var/lib/grafana/data`
- Prometheus data: `/var/lib/prometheus/data`
- Prowlarr data: `/var/lib/prowlarr/config`

The AIOStreams environment file must be mode `600` and owned by root. Public ports are bound only to Orkid's NetBird address.
