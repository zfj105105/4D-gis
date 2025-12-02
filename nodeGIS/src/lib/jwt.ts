import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-secret-key';
const JWT_EXPIRES_IN = 3600; // 1 hour

export function generateToken(userId: bigint): string {
  return jwt.sign({ sub: userId.toString() }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });
}

export function verifyToken(token: string): { sub: string } {
  try {
    return jwt.verify(token, JWT_SECRET) as { sub: string };
  } catch (error) {
    throw new Error('Invalid token');
  }
}

export { JWT_EXPIRES_IN };

