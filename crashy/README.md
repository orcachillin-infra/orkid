# Crashy

Self-hosted rebuild of crashy.net: upload a Minecraft crash report and get it parsed and
annotated instead of raw. The original site went down in December 2023, but the source is
still up at [natanfudge/Crashy](https://github.com/natanfudge/Crashy). This stack runs a
fork with small changes so it works off AWS.

## Patches on the fork

Upstream hardcodes an S3 region, reads its secrets from a gitignored `resources/secrets`
folder and needs a keystore before it will start TLS. The fork changes three things:

- S3 endpoint, region and static credentials come from `CRASHY_S3_ENDPOINT`,
  `CRASHY_S3_REGION`, `CRASHY_S3_ACCESS_KEY` and `CRASHY_S3_SECRET_KEY`. Setting a custom
  endpoint also switches the client to path-style addressing, which MinIO needs to resolve
  bucket names.
- `CRASHY_ADMIN_USER` / `CRASHY_ADMIN_PASS` replace the bundled secret resources. They
  gate the server's `/logs` page only.
- A `selfhostJar` Gradle task ships the Linux natives with no `release.txt`, so the server
  starts in the project's "Local" mode: HTTP on port 80 with no HTTPS redirect. TLS is
  terminated in front of it.

## Build and run

```sh
docker compose up -d --build
```

The image build runs the client's `npm ci` and then Gradle `selfhostJar`, so it needs
network access to npm, Maven Central and the Gradle plugin portal. The first build takes
several minutes on four cores; later builds reuse the dependency layer.

## How storage works

Crash logs are written to disk first. A daily task moves anything untouched for 30 days
into the S3 bucket, and a cache miss pulls it back out and stores it locally again. The
bucket has to exist before the server starts.

## Known limitations

- The MinIO image is a `bitnamilegacy` snapshot (server build 2025.7.23). MinIO pulled its
  own images from Docker Hub and now requires authentication on quay.io, so this archived
  Bitnami build is the last freely pullable one. It is frozen and unpatched.
- MinIO runs on root credentials and Crashy authenticates with the same pair, because
  creating a scoped MinIO user needs `mc` or the admin API, and neither image is available
  any more.
- The upstream tiered-storage path (`RestoreObject`, Glacier) is dead code against MinIO.
  It only triggers for objects archived to a cold tier, which MinIO does not do.
- The only upload throttle is the server's own `UploadLimiter`. Crash logs contain
  filesystem paths and full mod lists.
