# The upstream image, pinned by digest, with one local patch (patch-calendar-path.py):
# the sync can target an absolute collection path such as max/work/shifts, not just a
# display name among the direct children of the principal.
FROM docker.io/przemub/ics_caldav_sync@sha256:c69a43819aca5540791e9e88522c04964359874820c57c66a2c2b753d043ceca

COPY patch-calendar-path.py /tmp/patch-calendar-path.py
RUN python /tmp/patch-calendar-path.py && rm /tmp/patch-calendar-path.py
