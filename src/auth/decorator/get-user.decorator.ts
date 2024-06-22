import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const GetUser = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request: Request = context.switchToHttp().getRequest();
    if (data) {
      return request.user[data];
    }

    return request.user;
  },
);
