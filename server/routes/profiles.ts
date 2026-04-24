import express from 'express'
import { prisma } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import { RESERVED_PROFILE_KEYS, getOrCreateDefaultProfile } from '../utils/profile.js'

const router = express.Router()

const normalizeKey = (key: string) => key.trim().toLowerCase()

const isValidKey = (key: string) => /^[a-z0-9-]{2,32}$/.test(key)

router.get('/', async (req, res) => {
  const defaultProfile = await getOrCreateDefaultProfile()
  const profiles = await prisma.profile.findMany({ orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }] })
  if (!profiles.find(p => p.id === defaultProfile.id)) {
    profiles.unshift(defaultProfile)
  }
  res.json(profiles)
})

router.post('/', authenticate, async (req, res) => {
  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : ''
  const rawKey = typeof req.body?.key === 'string' ? req.body.key : ''
  const key = normalizeKey(rawKey)
  const isDefault = Boolean(req.body?.isDefault)

  if (!name) return res.status(400).json({ error: 'Missing name' })
  if (!key) return res.status(400).json({ error: 'Missing key' })
  if (!isValidKey(key)) return res.status(400).json({ error: 'Invalid key' })
  if (RESERVED_PROFILE_KEYS.has(key)) return res.status(400).json({ error: 'Reserved key' })

  const created = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.profile.updateMany({ data: { isDefault: false } })
    }
    return tx.profile.create({ data: { name, key, isDefault } })
  })

  res.json(created)
})

router.put('/:id', authenticate, async (req, res) => {
  const id = req.params.id
  const existing = await prisma.profile.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Not found' })

  const name = typeof req.body?.name === 'string' ? req.body.name.trim() : existing.name
  const rawKey = typeof req.body?.key === 'string' ? req.body.key : existing.key
  const key = normalizeKey(rawKey)
  const isDefault = typeof req.body?.isDefault === 'boolean' ? req.body.isDefault : existing.isDefault

  if (!name) return res.status(400).json({ error: 'Missing name' })
  if (!key) return res.status(400).json({ error: 'Missing key' })
  if (!isValidKey(key)) return res.status(400).json({ error: 'Invalid key' })
  if (RESERVED_PROFILE_KEYS.has(key)) return res.status(400).json({ error: 'Reserved key' })

  const updated = await prisma.$transaction(async (tx) => {
    if (isDefault) {
      await tx.profile.updateMany({ data: { isDefault: false } })
    }
    return tx.profile.update({ where: { id }, data: { name, key, isDefault } })
  })

  res.json(updated)
})

router.delete('/:id', authenticate, async (req, res) => {
  const id = req.params.id
  const existing = await prisma.profile.findUnique({ where: { id } })
  if (!existing) return res.status(404).json({ error: 'Not found' })
  if (existing.isDefault) return res.status(400).json({ error: 'Cannot delete default' })

  const [projects, categories, posts, workExperiences, projectExperiences, skillMatrixItems, settings] =
    await Promise.all([
      prisma.project.count({ where: { profileId: id } }),
      prisma.category.count({ where: { profileId: id } }),
      prisma.post.count({ where: { profileId: id } }),
      prisma.workExperience.count({ where: { profileId: id } }),
      prisma.projectExperience.count({ where: { profileId: id } }),
      prisma.skillMatrixItem.count({ where: { profileId: id } }),
      prisma.setting.count({ where: { profileId: id } }),
    ])

  if (projects + categories + posts + workExperiences + projectExperiences + skillMatrixItems + settings > 0) {
    return res.status(400).json({ error: 'Profile not empty' })
  }

  await prisma.profile.delete({ where: { id } })
  res.json({ success: true })
})

export default router

