import jwt from 'jsonwebtoken'
import { API_RESPONSE_CODES } from './responseHandler'

const JWT_SECRET = process.env.JWT_SECRET || 'e-learning-mjk-secret-key-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

export interface JWTPayload {
  userId: string
  email: string
  role: string
  iat?: number
  exp?: number
}

export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(
    payload,
    JWT_SECRET as jwt.Secret,
    { expiresIn: JWT_EXPIRES_IN } as jwt.SignOptions
  )
}

export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    throw new Error(API_RESPONSE_CODES.INVALID_OR_EXPIRED_TOKEN)
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null

  // Handle "Bearer token" format
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return authHeader
}

export function generateRefreshToken(): string {
  return crypto.randomUUID()
}