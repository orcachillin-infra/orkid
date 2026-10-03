# MailFlow on Orkid

Webmail is separate from Stalwart and from the Luna-to-Orkid mail migration. The frontend listens only on Orkid's NetBird address at `100.114.67.239:3780`. Dora's `webmail.orcachill.in` site proxies it over NetBird and initially only admits NetBird client IPs. Mail protocols remain on their own server/ports; adding an account to MailFlow will make IMAP/SMTP connections and may cause state changes on the currently selected mail server.

From `/etc/komodo/repos/infra-orkid/mailflow` on Orkid:

```sh
docker-compose config --quiet
docker-compose ps
docker-compose logs --tail=100 backend frontend
```

`/etc/komodo/repos/infra-orkid/mailflow/.env` contains the generated session, PostgreSQL and encryption secrets and is mode `0600` and ignored by git. Protect it in an encrypted off-host backup. Back up the `postgres_data` and `redis_data` volumes. Losing or changing `ENCRYPTION_KEY` makes saved account credentials unreadable.

The first registered user becomes the MailFlow admin. Keep Dora's NetBird restriction in place until that account is claimed, open registration is closed in Settings > Users, and 2FA is enabled. Do not attach live mail accounts during the server migration unless intentional writes and sync behavior are understood. If the public site is later opened, review auth, rate limits, logging and exposure first.

MailFlow is pinned to `2.7.0` for frontend and backend; Postgres/Redis use major tags and should be pinned to immutable digests after validation. The stack uses Podman via Orkid's `docker-compose` compatibility layer, not a Docker daemon. No HTTP/S port is published publicly on Orkid.
