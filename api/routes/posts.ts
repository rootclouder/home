import express from 'express'
import { prisma } from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const { categoryId } = req.query
  const filter = categoryId ? { categoryId: String(categoryId) } : {}
  const posts = await prisma.post.findMany({
    where: filter,
    include: { category: true },
    orderBy: { createdAt: 'desc' }
  })
  res.json(posts)
})

router.post('/', authenticate, async (req, res) => {
  const { category, ...createData } = req.body
  const post = await prisma.post.create({ data: createData })
  res.json(post)
})

router.put('/:id', authenticate, async (req, res) => {
  const { category, ...updateData } = req.body
  const post = await prisma.post.update({ 
    where: { id: req.params.id }, 
    data: updateData 
  })
  res.json(post)
})

router.delete('/:id', authenticate, async (req, res) => {
  await prisma.post.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

export default router
