import express from 'express'
import { prisma } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import { resolveProfileByKey } from '../utils/profile.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const categories = await prisma.category.findMany({
    where: { profileId: profile.id },
    orderBy: { sortOrder: 'asc' }
  })
  res.json(categories)
})

router.post('/', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  if (req.body?.parentId) {
    const parent = await prisma.category.findFirst({ where: { id: String(req.body.parentId), profileId: profile.id } })
    if (!parent) return res.status(400).json({ error: 'Invalid parentId' })
  }

  // Get max sortOrder for the new item
  const maxSort = await prisma.category.findFirst({
    where: { profileId: profile.id },
    orderBy: { sortOrder: 'desc' }
  })
  const sortOrder = maxSort ? maxSort.sortOrder + 1 : 0
  
  const category = await prisma.category.create({ 
    data: { ...req.body, sortOrder, profileId: profile.id } 
  })
  res.json(category)
})

router.put('/reorder', authenticate, async (req, res) => {
  const { items } = req.body // [{ id: '...', sortOrder: 0 }, ...]
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)
  
  try {
    const ids = Array.isArray(items) ? items.map((i: any) => i.id).filter(Boolean) : []
    const count = await prisma.category.count({ where: { id: { in: ids }, profileId: profile.id } })
    if (count !== ids.length) return res.status(400).json({ error: 'Invalid items' })

    await prisma.$transaction(
      items.map((item: any) => 
        prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder, profileId: profile.id }
        })
      )
    )
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder categories' })
  }
})

router.put('/:id', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const existing = await prisma.category.findFirst({ where: { id: req.params.id, profileId: profile.id } })
  if (!existing) return res.status(404).json({ error: 'Not found' })

  if (req.body?.parentId) {
    const parent = await prisma.category.findFirst({ where: { id: String(req.body.parentId), profileId: profile.id } })
    if (!parent) return res.status(400).json({ error: 'Invalid parentId' })
  }

  const category = await prisma.category.update({ where: { id: req.params.id }, data: { ...req.body, profileId: profile.id } })
  res.json(category)
})

router.delete('/:id', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const existing = await prisma.category.findFirst({ where: { id: req.params.id, profileId: profile.id } })
  if (!existing) return res.status(404).json({ error: 'Not found' })

  await prisma.category.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

export default router
