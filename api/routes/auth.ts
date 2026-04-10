import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../db.js'

const router = Router()
const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'

router.post('/login', async (req, res) => {
  const { username, password } = req.body
  const user = await prisma.user.findUnique({ where: { username } })
  if (!user) return res.status(401).json({ error: 'Invalid credentials' })

  const isValid = await bcrypt.compare(password, user.password)
  if (!isValid) return res.status(401).json({ error: 'Invalid credentials' })

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '1d' })
  res.json({ token, user: { id: user.id, username: user.username } })
})

export default router
