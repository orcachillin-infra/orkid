"""Teach ics_caldav_sync to accept an absolute collection path.

Upstream resolves LOCAL_CALENDAR_NAME against the display name of the
calendars directly below the principal, so a nested collection such as
max/work/shifts is unreachable. When the name contains a slash we build the
Calendar from the full URL instead. Radicale serves nested collections, and
with its from_file rights backend they are allowed.
"""

import pathlib
import sys

TARGET = pathlib.Path("/usr/local/lib/python3.14/site-packages/ics_caldav_sync.py")

OLD = '''        self.local_calendar = self.local_client.principal().calendar(
            local_calendar_name
        )'''

NEW = '''        if "/" in local_calendar_name.strip("/"):
            self.local_calendar = self.local_client.principal().calendar(
                cal_url=f"{local_url.rstrip('/')}/{local_calendar_name.strip('/')}/"
            )
        else:
            self.local_calendar = self.local_client.principal().calendar(
                local_calendar_name
            )'''

source = TARGET.read_text()
if OLD not in source:
    sys.exit(f"anchor not found in {TARGET}; upstream layout changed, re-check the patch")
TARGET.write_text(source.replace(OLD, NEW, 1))
print(f"patched {TARGET}")
