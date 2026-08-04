# Backrest

Backrest `v1.14.1` with SQLite tooling for application-consistent snapshots.

The UI is available only over NetBird at `http://orkid.network.orcachill.in:9898`.

## Initial Setup

1. Create the Backrest administrator account on first launch.
2. Populate `/etc/komodo/secrets/backrest.env` from Infisical with `B2_ACCOUNT_ID`, `B2_ACCOUNT_KEY`, and `RESTIC_PASSWORD`.
3. Add a repository using `b2:<bucket>/orkid`. Leave the repository password blank so Backrest uses `RESTIC_PASSWORD` from its environment.
4. Add a plan for `/staging/current`.
5. Add `/hooks/prepare-snapshot.sh` as a `CONDITION_SNAPSHOT_START` command hook with `ON_ERROR_FATAL`.

Suggested retention is seven daily, four weekly, twelve monthly, and three yearly snapshots. Run an integrity check monthly and prune after retention cleanup.

The snapshot hook copies non-database files, creates SQLite online backups, verifies them with `PRAGMA quick_check`, and atomically replaces the staging tree. Backrest's repository password must also be stored outside Orkid for disaster recovery.

The application database directories are mounted read-write because SQLite may create or update WAL shared-memory files while opening a live database. The automated hook only reads the source databases through SQLite's online backup API and writes output under `/staging`.
