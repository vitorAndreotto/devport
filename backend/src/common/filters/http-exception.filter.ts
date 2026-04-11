import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

interface ValidationErrorResponse {
  statusCode: number;
  message: string | string[];
  error?: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as ValidationErrorResponse;

    const body: Record<string, unknown> = {
      statusCode: status,
      message: this.extractMessage(exceptionResponse),
    };

    const errors = this.extractErrors(exceptionResponse);
    if (errors) {
      body['errors'] = errors;
    }

    response.status(status).json(body);
  }

  private extractMessage(res: ValidationErrorResponse): string {
    if (typeof res === 'string') return res;
    if (typeof res.message === 'string') return res.message;
    if (Array.isArray(res.message)) return 'Erro de validação.';
    return 'Erro interno.';
  }

  private extractErrors(res: ValidationErrorResponse): Record<string, string[]> | null {
    if (typeof res !== 'object' || !Array.isArray(res.message)) return null;

    const grouped: Record<string, string[]> = {};
    for (const msg of res.message) {
      const field = this.extractFieldFromMessage(msg);
      if (!grouped[field]) grouped[field] = [];
      grouped[field].push(msg);
    }
    return grouped;
  }

  private extractFieldFromMessage(msg: string): string {
    const match = msg.match(/^(\w+)\s/);
    return match ? match[1] : 'general';
  }
}
