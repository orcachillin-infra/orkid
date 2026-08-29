# Forgejo Runner

Actions runner for the Forgejo instance on Orkid.

- Image pinned by digest (runner 13.0.0)
- Connects to the host podman socket (/run/podman/podman.sock) for job containers, runs as root for socket access
- Registration token generated via `forgejo actions generate-runner-token`
- Config and job data at /var/lib/forgejo-runner
