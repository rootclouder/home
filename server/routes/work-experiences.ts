import express from 'express'
import { authenticate } from '../middleware/auth.js'
import { prisma } from '../db.js'
import { resolveProfileByKey } from '../utils/profile.js'

const router = express.Router()

// Public route to get all work experiences
router.get('/', async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const experiences = await prisma.workExperience.findMany({
    where: { profileId: profile.id },
    orderBy: { sortOrder: 'asc' }
  })
  res.json(experiences)
})

// Protected routes
router.post('/', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const experience = await prisma.workExperience.create({
    data: { ...req.body, profileId: profile.id }
  })
  res.json(experience)
})

router.put('/:id', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const existing = await prisma.workExperience.findFirst({ where: { id: req.params.id, profileId: profile.id } })
  if (!existing) return res.status(404).json({ error: 'Not found' })

  const experience = await prisma.workExperience.update({
    where: { id: req.params.id },
    data: { ...req.body, profileId: profile.id }
  })
  res.json(experience)
})

router.delete('/:id', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const existing = await prisma.workExperience.findFirst({ where: { id: req.params.id, profileId: profile.id } })
  if (!existing) return res.status(404).json({ error: 'Not found' })

  await prisma.workExperience.delete({
    where: { id: req.params.id }
  })
  res.json({ success: true })
})

export default router
