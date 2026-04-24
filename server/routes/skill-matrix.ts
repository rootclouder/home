import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { prisma } from '../db.js'
import { resolveProfileByKey } from '../utils/profile.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const items = await prisma.skillMatrixItem.findMany({
    where: { profileId: profile.id },
    orderBy: { sortOrder: 'asc' },
  })
  res.json(items)
})

router.post('/', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const item = await prisma.skillMatrixItem.create({
    data: { ...req.body, profileId: profile.id },
  })
  res.json(item)
})

router.put('/:id', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const existing = await prisma.skillMatrixItem.findFirst({ where: { id: req.params.id, profileId: profile.id } })
  if (!existing) return res.status(404).json({ error: 'Not found' })

  const item = await prisma.skillMatrixItem.update({
    where: { id: req.params.id },
    data: { ...req.body, profileId: profile.id },
  })
  res.json(item)
})

router.delete('/:id', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const existing = await prisma.skillMatrixItem.findFirst({ where: { id: req.params.id, profileId: profile.id } })
  if (!existing) return res.status(404).json({ error: 'Not found' })

  await prisma.skillMatrixItem.delete({
    where: { id: req.params.id },
  })
  res.json({ success: true })
})

export default router
