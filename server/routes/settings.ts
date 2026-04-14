import express from 'express'
import { prisma } from '../db.js'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  let settings = await prisma.setting.findFirst()
  if (!settings) {
    settings = await prisma.setting.create({
      data: { siteTitle: 'My Portfolio', heroTitle: 'Hello', heroSubtitle: 'Welcome', themeColor: '#000', badgeText: 'AVAILABLE FOR NEW OPPORTUNITIES', heroBgOpacity: 1.0, projectsBgOpacity: 1.0, blogBgOpacity: 1.0, skillsMatrixTitle: '技能矩阵', projectsSubtitle: '这里展示了我近期参与开发或主导的核心项目，涵盖前端交互、全栈开发与用户体验设计。', blogSubtitle: 'AIGC 实践心得、开发经验、技术探索笔记', faviconUrl: null }
    })
  }
  res.json(settings)
})

router.put('/', authenticate, async (req, res) => {
  const existing = await prisma.setting.findFirst()
  if (!existing) return res.status(404).json({ error: 'Not found' })

  const updated = await prisma.setting.update({
    where: { id: existing.id },
    data: req.body,
  })
  res.json(updated)
})

export default router
