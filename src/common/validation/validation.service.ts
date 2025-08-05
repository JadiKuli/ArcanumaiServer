import { BadRequestException, Injectable } from '@nestjs/common';
import z, { ZodError, ZodType } from 'zod';

@Injectable()
export class ValidationService {
  validate<T>(zodType: ZodType<T>, data: unknown) {
    try {
      return zodType.parse(data);
    } catch (error) {
      if (error instanceof ZodError) {
        const terrifiedError = z.treeifyError(error);
        throw new BadRequestException(terrifiedError);
      }
      throw error;
    }
  }
}
