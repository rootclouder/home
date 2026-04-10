import { Router } from 'express'
import { prisma } from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = Router()

router.get('/', async (req, res) => {
  const projects = await prisma.project.findMany({ orderBy: { sortOrder: 'asc' } })
  res.json(projects)
})

router.post('/', authenticate, async (req, res) => {
  const project = await prisma.project.create({ data: req.body })
  res.json(project)
})

router.put('/:id', authenticate, async (req, res) => {
  const project = await prisma.project.update({ where: { id: req.params.id }, data: req.body })
  res.json(project)
})

router.delete('/:id', authenticate, async (req, res) => {
  await prisma.project.delete({ where: { id: req.params.id } })
  res.json({ success: true })
})

export default router
