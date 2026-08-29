# Forgejo Runner

Actions runner for the Forgejo instance on Orkid.

- Image pinned by digest (runner 13.0.0)
- Shares the host docker socket for job containers
- Registration token generated via `forgejo actions generate-runner-token`
- Config and job data at /var/lib/forgejo-runner
