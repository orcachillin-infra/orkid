# Orkid Infrastructure

Komodo-managed services running on Orkid.

## Stacks

- `aiostreams`: AIOStreams on the Orkid NetBird address, port 3600.
- `prowlarr`: Prowlarr on the Orkid NetBird address, port 9696, with an internal FlareSolverr sidecar.

## Runtime State

Runtime data and secrets are deliberately kept outside this repository:

- AIOStreams data: `/var/lib/aiostreams/data`
- AIOStreams environment: `/etc/komodo/secrets/aiostreams.env`
- Prowlarr data: `/var/lib/prowlarr/config`

The AIOStreams environment file must be mode `600` and owned by root. Public ports are bound only to Orkid's NetBird address.
