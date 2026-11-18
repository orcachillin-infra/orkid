# ICS to CalDAV Sync

[ics_caldav_sync](https://github.com/przemub/ics_caldav_sync) pulls an ICS feed and mirrors it into a CalDAV calendar on a schedule. Here it copies the Kronos ESS work schedule into the `max/work/shifts` collection on the Radicale instance running on Orkid.

There is no listener and no published port. The container runs a loop and only talks outbound to Kronos and to Radicale at `http://100.114.67.239:5232/`.

## The local patch

Upstream resolves `LOCAL_CALENDAR_NAME` against the display name of calendars directly below the principal, so a nested collection is unreachable. `patch-calendar-path.py` changes that: when the name contains a slash it builds the calendar from the full URL instead. The Dockerfile applies it to the upstream image, pinned by digest, and Komodo rebuilds the stack from this directory.

Drop the patch once upstream can address collections by path.

## Why a dedicated calendar

Kronos regenerates event UIDs on every download (the UID embeds the fetch timestamp), so each sync writes a fresh set of events. With `KEEP_LOCAL` unset, the stale copies from the previous run are deleted, which keeps the calendar stable. That same delete pass also removes anything else in the target collection, so the sync must not point at a collection that holds hand-entered events (`work/events`, `calendar`, `events`).

## Radicale requirements

- Nested collections are served over CalDAV, but Radicale's built-in `owner_only` rights backend refuses anything deeper than one level below the principal. The `radicale` stack therefore uses `rights.type = from_file` with `radicale/config/rights`, which grants each user full control of their own subtree at any depth and nothing else.
- The client resolves display names, so a collection without a `D:displayname` property is reported as its path (`max/work/shifts`). Keep that property unset in this layout, or the sync target has to be renamed to match.

## Configuration

Everything lives in `/etc/komodo/secrets/ics-caldav-sync.env`, mode `600`:

- `REMOTE_URL`: Kronos calendar sync link (treat as a secret, it grants read access to the schedule)
- `LOCAL_URL`: `http://100.114.67.239:5232/`
- `LOCAL_CALENDAR_NAME`: `max/work/shifts` (a path, thanks to the patch)
- `LOCAL_USERNAME` / `LOCAL_PASSWORD`: Radicale credentials
- `LOCAL_AUTH`: `basic` (Radicale htpasswd)
- `SYNC_EVERY`: `30 minutes`
- `TIMEZONE`: `America/Los_Angeles`
- `SYNC_ALL`: unset, so only future events are mirrored
- `KEEP_LOCAL`: leave unset, so shifts cancelled in Kronos disappear locally too
- `DEBUG`: leave empty, set to any non-empty value for verbose logs
