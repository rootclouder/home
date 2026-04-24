import express from 'express'
import { prisma } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import { resolveProfileByKey } from '../utils/profile.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const { categoryId } = req.query
  const filter = categoryId ? { categoryId: String(categoryId), profileId: profile.id } : { profileId: profile.id }
  const posts = await prisma.post.findMany({
    where: filter,
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  })
  res.json(posts)
})

router.post('/', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const { category, ...createData } = req.body
  const categoryId = String(createData.categoryId || '')
  if (!categoryId) return res.status(400).json({ error: 'Missing categoryId' })
  const categoryExists = await prisma.category.findFirst({ where: { id: categoryId, profileId: profile.id } })
  if (!categoryExists) return res.status(400).json({ error: 'Invalid categoryId' })

  const post = await prisma.post.create({ data: { ...createData, profileId: profile.id } })
  res.json(post)
})

router.put('/:id', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const existing = await prisma.post.findFirst({ where: { id: req.params.id, profileId: profile.id } })
  if (!existing) return res.status(404).json({ error: 'Not found' })

  const { category, ...updateData } = req.body
  if (updateData.categoryId) {
    const categoryExists = await prisma.category.findFirst({ where: { id: String(updateData.categoryId), profileId: profile.id } })
    if (!categoryExists) return res.status(400).json({ error: 'Invalid categoryId' })
  }
  const post = await prisma.post.update({ 
    where: { id: req.params.id }, 
    data: { ...updateData, profileId: profile.id } 
  })
  res.json(post)
})

router.delete('/:id', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const existing = await prisma.post.findFirst({ where: { id: req.params.id, profileId: profile.id } })
  if (!existing) return res.status(404).json({ error: 'Not found' })

  await prisma.post.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

export default router
