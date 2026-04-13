import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res) => {
  const items = await prisma.skillMatrixItem.findMany({
    orderBy: { sortOrder: 'asc' },
  })
  res.json(items)
})

router.post('/', authenticate, async (req, res) => {
  const item = await prisma.skillMatrixItem.create({
    data: req.body,
  })
  res.json(item)
})

router.put('/:id', authenticate, async (req, res) => {
  const item = await prisma.skillMatrixItem.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json(item)
})

router.delete('/:id', authenticate, async (req, res) => {
  await prisma.skillMatrixItem.delete({
    where: { id: req.params.id },
  })
  res.json({ success: true })
})

export default router

