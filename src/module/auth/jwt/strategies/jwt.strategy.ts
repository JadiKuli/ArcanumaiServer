import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { IPayload } from '../../types/payload/auth.payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private _configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return (
            req?.cookies?.access_token ||
            req?.headers?.authorization?.replace('Bearer ', '') ||
            null
          );
        },
      ]),
      secretOrKey:
        _configService.get<string>('JWT_SECRET', { infer: true }) || 'secret',
      ignoreExpiration: false,
    });
  }

  validate(payload: IPayload) {
    return payload;
  }
}
