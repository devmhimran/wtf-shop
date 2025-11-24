import {
  PrismaClientKnownRequestError,
  PrismaClientValidationError,
} from '@prisma/client/runtime/client';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';

export class AppError extends Error {
  statusCode: number;
  constructor(statusCode: number, message: string, stack?: string) {
    super(message);
    this.statusCode = statusCode;
    if (stack) this.stack = stack;
    else Error.captureStackTrace(this, this.constructor);
  }
}

type RouteParams = { params?: Promise<Record<string, string | string[]>> };

type ErrorDetail = {
  path: string;
  message: string;
};

export const catchAsyncNext = <T = RouteParams>(
  fn: (req: NextRequest, context?: T) => Promise<NextResponse>
) => {
  return async (req: NextRequest, context?: T) => {
    try {
      return await fn(req, context);
    } catch (err: unknown) {
      let statusCode = 500;
      let message = 'Internal server error';
      let errorDetails: ErrorDetail[] = [];

      if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validation error';
        errorDetails = err.issues.map((issue) => ({
          path: issue?.path[issue.path.length - 1] as string,
          message: issue.message,
        }));
      } else if (err instanceof PrismaClientKnownRequestError) {
        // P2002 = unique, P2003 = FK, P2025 = not found
        if (err.code === 'P2002') {
          statusCode = 409;
          message = 'Duplicate field value';
          errorDetails = [
            {
              path: (err.meta?.target as string[])?.join(', ') || '',
              message: 'Already exists',
            },
          ];
        } else if (err.code === 'P2003') {
          statusCode = 400;
          message = 'Foreign key constraint failed';
          errorDetails = [
            {
              path: (err.meta?.field_name as string) || '',
              message: 'Related record not found',
            },
          ];
        } else if (err.code === 'P2025') {
          statusCode = 404;
          message = 'Record not found';
          errorDetails = [
            { path: '', message: (err.meta?.cause as string) || 'Not found' },
          ];
        } else {
          statusCode = 400;
          message = err.message;
        }
      } else if (err instanceof PrismaClientValidationError) {
        statusCode = 400;
        message = 'Prisma validation error';
        errorDetails = [
          { path: '', message: err.message.split('\n').pop() || err.message },
        ];
      } else if (err instanceof AppError) {
        statusCode = err.statusCode;
        message = err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }

      console.error(err);

      return NextResponse.json(
        {
          success: false,
          message,
          error: errorDetails,
        },
        { status: statusCode }
      );
    }
  };
};
