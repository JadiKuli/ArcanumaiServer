import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { IPayload } from '../../types/payload/auth.payload';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private _configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey:
        _configService.get<string>('JWT_SECRET', { infer: true }) || 'secret',
      ignoreExpiration: false,
    });
  }

  validate(payload: IPayload) {
    return payload;
  }
}
