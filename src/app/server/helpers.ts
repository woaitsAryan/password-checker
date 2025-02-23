import crypto from "node:crypto"

const SALT_LENGTH = 16
const KEY_LENGTH = 64
const TOKEN_SECRET = process.env.TOKEN_SECRET || "secret"

export function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(SALT_LENGTH).toString('hex')
    crypto.scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) reject(err)
      resolve(`${salt}:${derivedKey.toString('hex')}`)
    })
  })
}

/**
 * Verify password with crypto
 */
export function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(':')
    crypto.scrypt(password, salt, KEY_LENGTH, (err, derivedKey) => {
      if (err) reject(err)
      resolve(key === derivedKey.toString('hex'))
    })
  })
}

/**
 * Generate token using crypto
 */
export function generateToken(payload: object): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url')
  const content = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(`${header}.${content}`)
    .digest('base64url')
  return `${header}.${content}.${signature}`
}

/**
 * Verify token using crypto
 */
export function verifyToken(token: string): { userId: string, email: string } | null {
  try {
    const [header, content, signature] = token.split('.')
    const expectedSignature = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(`${header}.${content}`)
      .digest('base64url')

    if (signature !== expectedSignature) {
      return null
    }

    return JSON.parse(Buffer.from(content, 'base64url').toString())
  } catch {
    return null
  }
}

export type DecryptedPassword = {
  id: string;
  service: string;
  username: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}