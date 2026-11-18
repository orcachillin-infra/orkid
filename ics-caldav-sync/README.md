# ICS to CalDAV Sync

[ics_caldav_sync](https://github.com/przemub/ics_caldav_sync) pulls an ICS feed and mirrors it into a CalDAV calendar on a schedule. Here it copies the Kronos ESS work schedule into the `max/shifts` calendar on the Radicale instance running on Orkid.

There is no listener and no published port. The container runs a loop and only talks outbound to Kronos and to Radicale at `http://100.114.67.239:5232/`.

## Why a dedicated calendar

Kronos regenerates event UIDs on every download (the UID embeds the fetch timestamp), so each sync writes a fresh set of events. With `KEEP_LOCAL` unset, the stale copies from the previous run are deleted, which keeps the calendar stable. That same delete pass also removes anything else in the target calendar, so the sync must not point at a calendar that holds hand-entered events (`work`, `calendar`, `events`).

Radicale stores no display name on collections by default and the client matches calendars by display name, so `max/shifts` must keep `D:displayname: Shifts`.

## Configuration

Everything lives in `/etc/komodo/secrets/ics-caldav-sync.env`, mode `600`:

- `REMOTE_URL`: Kronos calendar sync link (treat as a secret, it grants read access to the schedule)
- `LOCAL_URL`: `http://100.114.67.239:5232/`
- `LOCAL_CALENDAR_NAME`: `Shifts` (the display name, not the path)
- `LOCAL_USERNAME` / `LOCAL_PASSWORD`: Radicale credentials
- `LOCAL_AUTH`: `basic` (Radicale htpasswd)
- `SYNC_EVERY`: `30 minutes`
- `TIMEZONE`: `America/Los_Angeles`
- `SYNC_ALL`: unset, so only future events are mirrored
- `KEEP_LOCAL`: leave unset, so shifts cancelled in Kronos disappear locally too
- `DEBUG`: leave empty, set to any non-empty value for verbose logs

The image is pinned to the `v1.3.1` multi-arch digest.
