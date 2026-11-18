# MailFlow on Orkid

Webmail is separate from Stalwart and from the Luna-to-Orkid mail migration. The frontend is the Caddy-based MailFlow image with `TLS_MODE=off`, so it serves plain HTTP on Orkid's NetBird address at `100.114.67.239:3780`. Dora's `webmail.orcachill.in` site proxies it over NetBird, terminates TLS and only admits NetBird client IPs. Mail protocols remain on their own server/ports; adding an account to MailFlow will make IMAP/SMTP connections and may cause state changes on the currently selected mail server.

Since 4.4 the stack has no Redis: sessions and short-lived keys live in Postgres. The frontend proxies the API itself, so there is no nginx and no separate Caddy container.

From `/etc/komodo/repos/infra-orkid/mailflow` on Orkid:

```sh
docker-compose config --quiet
docker-compose ps
docker-compose logs --tail=100 backend frontend
```

`/etc/komodo/repos/infra-orkid/mailflow/.env` contains the generated session, PostgreSQL and encryption secrets and is mode `0600` and ignored by git. Protect it in an encrypted off-host backup. Back up the `postgres_data` volume.

Losing or changing `ENCRYPTION_KEY` makes saved account credentials unreadable.

The first registered user becomes the MailFlow admin. Keep Dora's NetBird restriction in place until that account is claimed, open registration is closed in Settings > Users, and 2FA is enabled. Do not attach live mail accounts during the server migration unless intentional writes and sync behavior are understood. If the public site is later opened, review auth, rate limits, logging and exposure first.

Frontend and backend are pinned to `4.4.0`, Postgres to a `16-alpine` digest. `TRUST_PROXY_HOPS=2` accounts for the two hops between a client and the backend (Dora caddy, then the MailFlow frontend). The stack uses Podman via Orkid's `docker-compose` compatibility layer, not a Docker daemon. No HTTP/S port is published publicly on Orkid.
