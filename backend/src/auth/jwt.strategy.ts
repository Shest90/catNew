// src/auth/jwt.strategy.ts
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      // Берём секрет из ConfigService
      secretOrKey: config.get<string>('JWT_SECRET', 'fallback-secret'),
    });
  }

  async validate(payload: any) {
    // payload — это то, что вы подписываете в AuthService (id, role и т.д.)
    return {
      id: payload.sub,
      role: payload.role,
      workerId: payload.role === 'worker' ? payload.sub : null,
      adminId: payload.adminId ?? null,
    };
  }
}
