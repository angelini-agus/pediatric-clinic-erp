import { loginSchema } from '@pediatric-erp/schemas';
import { createZodDto } from 'nestjs-zod';

export class LoginDto extends createZodDto(loginSchema) {}
