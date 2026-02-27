import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

export interface JWTPayload {
  userId: string;
  role: string;
}

/**
 * Génère un access token JWT
 */
export const generateAccessToken = (userId: string, role: string): string => {
  // @ts-ignore - expiresIn accepts string despite strict type checking
  const options: SignOptions = { expiresIn: process.env.JWT_EXPIRES_IN || '7d' };
  return jwt.sign(
    { userId, role },
    process.env.JWT_SECRET!,
    options
  );
};

/**
 * Génère un refresh token JWT
 */
export const generateRefreshToken = (userId: string): string => {
  // @ts-ignore - expiresIn accepts string despite strict type checking
  const options: SignOptions = { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' };
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    options
  );
};

/**
 * Vérifie et décode un token JWT
 */
export const verifyToken = (token: string, type: 'access' | 'refresh'): JWTPayload => {
  const secret = type === 'access' ? process.env.JWT_SECRET! : process.env.JWT_REFRESH_SECRET!;
  return jwt.verify(token, secret) as JWTPayload;
};

/**
 * Hash un mot de passe
 */
export const hashPassword = async (password: string): Promise<string> => {
  const rounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
  return bcrypt.hash(password, rounds);
};

/**
 * Compare un mot de passe en clair avec un hash
 */
export const comparePassword = async (plainPassword: string, hashedPassword: string): Promise<boolean> => {
  return bcrypt.compare(plainPassword, hashedPassword);
};
