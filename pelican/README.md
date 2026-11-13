# Pelican

Game server panel and Wings node.

## Stacks

- `panel`: `ghcr.io/pelican/panel`, published on Orkid's NetBird address port 8100 and fronted by `panel.orcachill.in` on dora. Runs with `BEHIND_PROXY=true` so TLS terminates at dora; dora's NetBird address is the only trusted proxy.
- `database`: PostgreSQL 18, the panel's database.
- `redis`: cache, sessions and queue for the panel.

The panel image runs as `www-data` and its built-in Caddy binds port 80, but Podman drops `NET_BIND_SERVICE` for non-root users. The stack sets `net.ipv4.ip_unprivileged_port_start=0` so Caddy can listen without elevated capabilities.

## Wings

Wings runs on the host as `wings.service`, not as a container, because it needs to control a Docker engine.

The panel node is `orkid`, served at `wings.orcachill.in:8095` through dora. Browsers open the console websocket against that same address, so the name must stay publicly resolvable even though Wings itself only listens on the NetBird address.

Wings also serves SFTP on port 2022 (panel users use it to upload files) and binds game allocations on the public interface.

## Two Docker engines

Orkid's containers are Podman, reached through `/var/run/docker.sock` (a symlink to `/run/podman/podman.sock`). Wings requires Docker CE, so it gets its own engine instead:

- `dockerd-pelican.service` runs `/usr/bin/dockerd` on `/run/docker-pelican.sock`, with a separate container set and network.
- `wings.service` sets `DOCKER_HOST=unix:///run/docker-pelican.sock`.
- `docker.socket` and `docker.service` from the `docker.io` package are masked, so the package cannot claim `/var/run/docker.sock` and pull Komodo's stacks over to Docker.

## Runtime state

- Panel data and `.env` (including `APP_KEY`): `/var/lib/pelican/panel`
- PostgreSQL data: `/var/lib/pelican/database`
- Redis AOF: `/var/lib/pelican/redis`
- Server volumes, managed by Wings: `/var/lib/pelican/volumes`
- Wings config, generated from the panel node: `/etc/pelican/config.yml`
- Database and admin credentials: `/etc/komodo/secrets/pelican-db.env`, `/etc/komodo/secrets/pelican-admin.env`
