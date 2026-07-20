# In this folder there is an editable text config consisting of several configs for deploy.

## What is this config about?

- Prometheus
- Tempo
- Loki
- Opentelemetry-collector
- nginx
- ci-cd
- certbot
- postgresql

## read this for documentation sources

### Postgresql configuration

- https://www.pgconfig.org/

### Open-telemetry collector docs

- https://opentelemetry.io/docs/collector/configuration/

### Otel receiver

- https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/redisreceiver
- https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/receiver/postgresqlreceiver

### Metric exporter

- https://github.com/prometheus-community/postgres_exporter
- https://github.com/oliver006/redis_exporter
- https://docs.min.io/sidekick/operations/monitoring/prometheus-metrics/
- https://github.com/google/cadvisor

### Note

- Minio has opened its own metrics
