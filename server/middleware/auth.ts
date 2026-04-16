// @ts-nocheck
import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'

export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ error: 'Missing token' })

  const [scheme, token] = authHeader.split(' ')
  if (scheme !== 'Bearer' || !token || token === 'null' || token === 'undefined') {
    return res.status(401).json({ error: 'Missing token' })
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    ;(req as any).user = decoded
    next()
  } catch (err) {
    res.status(401).json({ error: 'Invalid token' })
  }
}
