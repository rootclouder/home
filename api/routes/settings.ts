import express from 'express'
import { prisma } from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  let settings = await prisma.setting.findFirst()
  if (!settings) {
    settings = await prisma.setting.create({
      data: { siteTitle: 'My Portfolio', heroTitle: 'Hello', heroSubtitle: 'Welcome', themeColor: '#000' }
    })
  }
  res.json(settings)
})

router.put('/', authenticate, async (req, res) => {
  const existing = await prisma.setting.findFirst()
  if (!existing) return res.status(404).json({ error: 'Not found' })

  const updated = await prisma.setting.update({
    where: { id: existing.id },
    data: req.body,
  })
  res.json(updated)
})

export default router
