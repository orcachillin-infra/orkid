# Infisical Agent

The agent runs on Orkid and renders root-only Backrest credentials from the `infra` project, `prod` environment.

Install paths:

- Configuration: `/etc/infisical-agent/agent-config.yaml`
- Universal Auth client ID: `/etc/infisical-agent/client-id`
- Universal Auth client secret: `/etc/infisical-agent/client-secret`
- Systemd unit: `/etc/systemd/system/infisical-agent.service`
- Rendered Backrest environment: `/var/lib/infisical-agent/rendered/backrest/backrest.env`

The client credentials and rendered files must not be committed. The service applies `UMask=0077`, so rendered files are mode `600`.
