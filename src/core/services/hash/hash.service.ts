import { Injectable } from '@nestjs/common';
import * as argon from 'argon2';

@Injectable()
export class HashService {
  /**
   * Returns hashed value
   *
   * @param value
   */
  public get(value: string): Promise<string> {
    return argon.hash(value);
  }

  public verify(hash: string, plain: string, options?: argon.Options) {
    return argon.verify(hash, plain, options);
  }
}
