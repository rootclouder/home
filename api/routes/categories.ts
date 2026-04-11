import express from 'express'
import { prisma } from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' }
  })
  res.json(categories)
})

router.post('/', authenticate, async (req, res) => {
  // Get max sortOrder for the new item
  const maxSort = await prisma.category.findFirst({
    orderBy: { sortOrder: 'desc' }
  })
  const sortOrder = maxSort ? maxSort.sortOrder + 1 : 0
  
  const category = await prisma.category.create({ 
    data: { ...req.body, sortOrder } 
  })
  res.json(category)
})

router.put('/reorder', authenticate, async (req, res) => {
  const { items } = req.body // [{ id: '...', sortOrder: 0 }, ...]
  
  try {
    await prisma.$transaction(
      items.map((item: any) => 
        prisma.category.update({
          where: { id: item.id },
          data: { sortOrder: item.sortOrder }
        })
      )
    )
    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder categories' })
  }
})

router.put('/:id', authenticate, async (req, res) => {
  const category = await prisma.category.update({ where: { id: req.params.id }, data: req.body })
  res.json(category)
})

router.delete('/:id', authenticate, async (req, res) => {
  await prisma.category.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

export default router
