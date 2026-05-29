import { Module } from '@nestjs/common';
import { LoggerModule } from 'nestjs-pino';
import { trace, context } from '@opentelemetry/api';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        mixin() {
          const span = trace.getSpan(context.active());
          if (!span) return {};

          const ctx = span.spanContext();
          return {
            trace_id: ctx.traceId,
            span_id: ctx.spanId,
          };
        },
      },
    }),
  ],
})
export class PinoModule {}
