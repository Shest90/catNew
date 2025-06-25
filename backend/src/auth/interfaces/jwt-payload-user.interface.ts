export interface JwtPayloadUser {
  id: number; // ID из payload.sub
  role: 'admin' | 'worker';
  workerId?: number | null;
  adminId?: number | null;
}
