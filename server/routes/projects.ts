import express from 'express'
import { prisma } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import { resolveProfileByKey } from '../utils/profile.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const projects = await prisma.project.findMany({
    where: { profileId: profile.id },
    orderBy: { sortOrder: 'asc' },
  })
  res.json(projects)
})

router.post('/', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const project = await prisma.project.create({ data: { ...req.body, profileId: profile.id } })
  res.json(project)
})

router.put('/:id', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const existing = await prisma.project.findFirst({ where: { id: req.params.id, profileId: profile.id } })
  if (!existing) return res.status(404).json({ error: 'Not found' })

  const project = await prisma.project.update({ where: { id: req.params.id }, data: { ...req.body, profileId: profile.id } })
  res.json(project)
})

router.delete('/:id', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const existing = await prisma.project.findFirst({ where: { id: req.params.id, profileId: profile.id } })
  if (!existing) return res.status(404).json({ error: 'Not found' })

  await prisma.project.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

export default router
