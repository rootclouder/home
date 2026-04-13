import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const prisma = new PrismaClient()
const router = express.Router()

router.get('/', async (req, res) => {
  const experiences = await prisma.projectExperience.findMany({
    orderBy: { sortOrder: 'asc' },
  })
  res.json(experiences)
})

router.post('/', authenticate, async (req, res) => {
  const experience = await prisma.projectExperience.create({
    data: req.body,
  })
  res.json(experience)
})

router.put('/:id', authenticate, async (req, res) => {
  const experience = await prisma.projectExperience.update({
    where: { id: req.params.id },
    data: req.body,
  })
  res.json(experience)
})

router.delete('/:id', authenticate, async (req, res) => {
  await prisma.projectExperience.delete({
    where: { id: req.params.id },
  })
  res.json({ success: true })
})

export default router
