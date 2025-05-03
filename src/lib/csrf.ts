// utils/csrf.ts
import { randomBytes } from 'crypto'
import { serialize, parse } from 'cookie'
import { NextApiRequest, NextApiResponse } from 'next'

// Constants for CSRF token settings
const CSRF_TOKEN_NAME = 'XSRF-TOKEN'
const CSRF_HEADER_NAME = 'X-CSRF-Token'
const TOKEN_LENGTH = 32
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'strict' as const,
  path: '/'
}

// Generate a cryptographically secure random token
export function generateCSRFToken(): string {
  return randomBytes(TOKEN_LENGTH).toString('hex')
}

// Middleware to set CSRF token if it doesn't exist
export function setCsrfToken(req: NextApiRequest, res: NextApiResponse): string {
  // Check existing token in cookies
  const existingToken = req.cookies[CSRF_TOKEN_NAME]
  if (existingToken) return existingToken

  // Generate and set new token
  const newToken = generateCSRFToken()
  res.setHeader('Set-Cookie', serialize(CSRF_TOKEN_NAME, newToken, COOKIE_OPTIONS))
  return newToken
}

// Middleware to validate CSRF token
export function validateCSRFToken(req: NextApiRequest, res: NextApiResponse): boolean {
  const cookie = req.cookies[CSRF_TOKEN_NAME]
  const header = req.headers[CSRF_HEADER_NAME.toLowerCase()]

  if (!cookie || !header || Array.isArray(header)) {
    return false
  }

  // Constant-time comparison to prevent timing attacks
  return timingSafeEqual(cookie, header)
}

// Constant-time string comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false
  }
  
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// API route wrapper for CSRF protection
export function withCSRF(handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>) {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    // Only validate POST, PUT, DELETE, PATCH requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method ?? '')) {
      if (!validateCSRFToken(req, res)) {
        return res.status(403).json({ error: 'Invalid CSRF token' })
      }
    }

    // Set new token for next request
    setCsrfToken(req, res)
    
    // Call original handler
    return handler(req, res)
  }
}