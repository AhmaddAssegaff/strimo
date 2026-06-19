import { NodeSDK } from '@opentelemetry/sdk-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc';
import { AsyncLocalStorageContextManager } from '@opentelemetry/context-async-hooks';
import {
  CompositePropagator,
  W3CTraceContextPropagator,
  W3CBaggagePropagator,
} from '@opentelemetry/core';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { PinoInstrumentation } from '@opentelemetry/instrumentation-pino';
import { NestInstrumentation } from '@opentelemetry/instrumentation-nestjs-core';
import { PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { PrismaInstrumentation } from '@prisma/instrumentation';

export const OtelSDK = new NodeSDK({
  traceExporter: new OTLPTraceExporter(),

  metricReader: new PeriodicExportingMetricReader({
    exporter: new OTLPMetricExporter(),
    exportIntervalMillis: 60000,
  }),

  contextManager: new AsyncLocalStorageContextManager(),

  textMapPropagator: new CompositePropagator({
    propagators: [new W3CTraceContextPropagator(), new W3CBaggagePropagator()],
  }),

  instrumentations: [
    new HttpInstrumentation({
      ignoreOutgoingRequestHook: (request) => {
        return request.hostname === 'otel-collector';
      },
    }),
    new IORedisInstrumentation(),
    new PinoInstrumentation({
      logKeys: {
        traceFlags: 'trace_flags',
        traceId: 'trace_id',
        spanId: 'span_id',
      },
    }),
    new NestInstrumentation(),
    new PrismaInstrumentation(),
    getNodeAutoInstrumentations({
      '@opentelemetry/instrumentation-fs': { enabled: false },
      '@opentelemetry/instrumentation-net': { enabled: false },
    }),
  ],
});

process.on('SIGTERM', () => {
  OtelSDK.shutdown()
    .then(
      () => console.log('OTel shut down successfully'),
      (err) => console.log('Error shutting down OTel', err),
    )
    .finally(() => process.exit(0));
});
