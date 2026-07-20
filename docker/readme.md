
# Docker Compose Configuration Documentation

This directory contains the multi-environment Docker Compose configurations for the **Point of sales** infrastructure. The setup isolates applications, system dependencies, using containerized environments.

## Directory Structure

```text
docker/
├── docker.dev.yml             # Development environment configuration
├── docker.staging.yml         # Staging environment configuration (matches production tightly)
├── docker.production.yml      # Production environment configuration (highly optimized, secure)
└── readme.md                  # This documentation file
```

---

## Environment Separation Strategy

### 1. `docker.dev.yml` (Development)
*   **Purpose:** Local development, hot-reloading, and deep debugging.
*   **Characteristics:**
    *   Exposes database ports (`5432` for PostgreSQL, `6379` for Redis) directly to `localhost` for GUI client connections (e.g., DBeaver, TablePlus).
    *   Mounts local source code volumes to allow instant hot-reloading (e.g., NestJS in watch mode).
    *   Keeps resources unbounded for fast build times.
    *   Observability stack is minimal or streamlined to reduce local laptop resource consumption.

### 2. `docker.staging.yml` (Staging)
*   **Purpose:** Replicating production behavior exactly for pre-deployment validation, integrated with CI/CD.
*   **Characteristics:**
    *   Exposes ports only via the Nginx Reverse Proxy.
    *   Connects to a isolated staging database matching production specifications.

### 3. `docker.prod.yml` (Production)
*   **Purpose:** Live customer-facing deployment.
*   **Characteristics:**
    *   Strict security constraints: internal application networks are locked down and no internal database ports are exposed publicly.
    *   Persistent volume definitions ensure telemetry and transaction data survive container restarts.
    *   Auto-restart policies (`unless-stopped`) handle system level reboots gracefully.

---

## Core Services & Architecture

The compose files organize infrastructure into distinct technological pillars:

### A. Routing & Gateway
*   **Nginx:** Functions as the public-facing Reverse Proxy, handling incoming traffic, SSL/TLS termination via Certbot certificates, and securely forwarding traffic to internal application networks.

### B. Observability Pillar with OpenTelemetry
To save RAM on low-spec VPS servers, telemetry data routes efficiently through a unified architecture:
1.  **OpenTelemetry Collector (`otel-collector`):** Acts as the high-performance central ingestion point. It receives metrics, logs, and traces natively over OTLP (gRPC).
2.  **Prometheus:** Stores metric data scraped from application endpoints and infrastructure collectors.
3.  **Loki:** A lightweight, log-aggregation engine designed to compress system and application logs with indexing.
4.  **Tempo:** A high-scale distributed tracing backend to track request chains through services.
5.  **Grafana:** The unified visualization layer linking metrics, logs, and traces together.

### C. Telemetry Exporters
*   **postgres-exporter & redis-exporter:** Connect directly to state backends to stream real-time query metrics, cache misses, and memory statistics.
*   **cAdvisor:** Monitors container-level resource statistics (CPU, memory, storage utilization) directly from the host Linux kernel.

---

## Deployment & Usage Instructions

### Running an Environment
To execute a specific deployment configuration, use the `-f` flag to target the desired environment file:

```bash
# Start Development Environment
docker compose -f docker/docker.dev.yml up -d

# Start Staging Environment
docker compose -f docker/docker.staging.yml up -d

# Start Production Environment
docker compose -f docker/docker.production.yml up -d
```

## Docker docs
Feel free to create your own docker compose 

- https://docs.docker.com/reference/compose-file/
