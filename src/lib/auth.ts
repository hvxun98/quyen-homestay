import jwt from 'jsonwebtoken';
export const signAccess = (sub: string, role: string) => jwt.sign({ sub, role }, process.env.JWT_SECRET!, { expiresIn: '15m' });
export const verifyAccess = (token: string) =>
  jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; role: string; iat: number; exp: number };
