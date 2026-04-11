import { ApiError } from './api.service';

export function extractErrorMessage(err: ApiError): string {
  return Array.isArray(err.message) ? err.message[0] : err.message;
}
