import {
  type ArgumentsHost,
  Catch,
  type ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import type { FastifyReply, FastifyRequest } from 'fastify';

type ErrorResponse = {
  readonly statusCode: number;
  readonly timestamp: string;
  readonly path: string;
  readonly method: string;
  readonly message: string | string[];
  readonly error?: string;
};

/**
 * Global Exception Filter
 *
 * Catches ALL unhandled exceptions in the application and transforms them
 * into consistent JSON responses.
 *
 * Error response format:
 * {
 *   "statusCode": 400,
 *   "timestamp": "2024-01-01T00:00:00.000Z",
 *   "path": "/api/v1/patients",
 *   "method": "POST",
 *   "message": "Error description",
 *   "error": "Bad Request"  // for HttpExceptions only
 * }
 *
 * RULE: Validation errors from nestjs-zod are HttpExceptions (400)
 * and will be caught and formatted correctly by this filter.
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    @InjectPinoLogger(AllExceptionsFilter.name)
    private readonly logger: PinoLogger,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const reply = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<FastifyRequest>();

    const isHttpException = exception instanceof HttpException;
    const statusCode = isHttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const httpResponse = isHttpException ? exception.getResponse() : null;

    const message: string | string[] = (() => {
      if (
        httpResponse !== null &&
        typeof httpResponse === 'object' &&
        'message' in httpResponse
      ) {
        return (httpResponse as { message: string | string[] }).message;
      }
      if (isHttpException) {
        return exception.message;
      }
      return 'Internal server error';
    })();

    const errorName: string | undefined = (() => {
      if (
        httpResponse !== null &&
        typeof httpResponse === 'object' &&
        'error' in httpResponse
      ) {
        return (httpResponse as { error: string }).error;
      }
      return undefined;
    })();

    const responseBody: ErrorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      ...(errorName !== undefined ? { error: errorName } : {}),
    };

    // Log unexpected errors (5xx) as error, client errors (4xx) as warn
    if (statusCode >= 500) {
      this.logger.error({ exception, responseBody }, 'Unhandled exception');
    } else {
      this.logger.warn({ responseBody }, 'Client error');
    }

    void reply.status(statusCode).send(responseBody);
  }
}

