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
 * Detects whether an unknown exception is a Prisma `PrismaClientKnownRequestError`.
 *
 * Guards against `instanceof` failing across duplicated Prisma client
 * copies (pnpm workspaces), so identification is done structurally:
 * the constructor name plus the presence of a Prisma error code
 * (e.g. `P2002`, `P2025`).
 */
function getPrismaErrorCode(exception: unknown): string | undefined {
  if (typeof exception !== 'object' || exception === null) {
    return undefined;
  }
  const candidate = exception as {
    code?: unknown;
    constructor?: { name?: string };
  };
  if (candidate.constructor?.name !== 'PrismaClientKnownRequestError') {
    return undefined;
  }
  return typeof candidate.code === 'string' ? candidate.code : undefined;
}

/**
 * Maps a Prisma error code to an HTTP status, or 500 for unhandled codes.
 */
function mapPrismaCodeToStatus(code: string): HttpStatus {
  switch (code) {
    case 'P2002':
      return HttpStatus.CONFLICT;
    case 'P2025':
      return HttpStatus.NOT_FOUND;
    default:
      return HttpStatus.INTERNAL_SERVER_ERROR;
  }
}

/**
 * Safe, DB-agnostic message per Prisma error code — NEVER includes
 * `meta` (target fields, unique constraints, record ids, model names)
 * or any other database detail.
 */
function mapPrismaCodeToMessage(code: string): string {
  switch (code) {
    case 'P2002':
      return 'Resource already exists (unique constraint violation)';
    case 'P2025':
      return 'Resource not found';
    default:
      return 'Internal server error';
  }
}

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

    const prismaCode = getPrismaErrorCode(exception);
    const isPrismaError = prismaCode !== undefined;

    const isHttpException = exception instanceof HttpException;
    const statusCode = prismaCode
      ? mapPrismaCodeToStatus(prismaCode)
      : isHttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const httpResponse = isHttpException ? exception.getResponse() : null;

    const message: string | string[] = ((): string | string[] => {
      if (isPrismaError) {
        return mapPrismaCodeToMessage(prismaCode);
      }
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

    const errorName: string | undefined = ((): string | undefined => {
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

