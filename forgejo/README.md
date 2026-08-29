# Forgejo

Git hosting on the Orkid NetBird address, ports 3000 (web) and 2222 (ssh).

- Image pinned by digest (forgejo 12)
- SQLite storage at /var/lib/forgejo
- OAuth2 enabled for upstream IdP integration
- Bound to the Orkid NetBird IP only

## Registration

Open registration is enabled. Kanidm users in the `forgejo_users` group can sign up via the kanidm SSO button, or register directly.
