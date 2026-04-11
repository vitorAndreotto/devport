import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

const HANDLE_REGEX = /^[a-z0-9][a-z0-9-]{1,38}[a-z0-9]$/;

@Injectable()
export class ParseHandlePipe implements PipeTransform<string, string> {
  transform(value: string): string {
    if (!HANDLE_REGEX.test(value)) {
      throw new BadRequestException('Handle inválido.');
    }
    return value;
  }
}
