import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authenticate } from '../middleware/auth.js'

const prisma = new PrismaClient()
const router = express.Router()

// Public route to get all work experiences
router.get('/', async (req, res) => {
  const experiences = await prisma.workExperience.findMany({
    orderBy: { sortOrder: 'asc' }
  })
  res.json(experiences)
})

// Protected routes
router.post('/', authenticate, async (req, res) => {
  const experience = await prisma.workExperience.create({
    data: req.body
  })
  res.json(experience)
})

router.put('/:id', authenticate, async (req, res) => {
  const experience = await prisma.workExperience.update({
    where: { id: req.params.id },
    data: req.body
  })
  res.json(experience)
})

router.delete('/:id', authenticate, async (req, res) => {
  await prisma.workExperience.delete({
    where: { id: req.params.id }
  })
  res.json({ success: true })
})

export default router