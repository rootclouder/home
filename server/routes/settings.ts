import express from 'express'
import { prisma } from '../db.js'
import { authenticate } from '../middleware/auth.js'
import { resolveProfileByKey } from '../utils/profile.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  let settings = await prisma.setting.findFirst({ where: { profileId: profile.id } })
  if (!settings) {
    settings = await prisma.setting.create({
      data: {
        profileId: profile.id,
        siteTitle: 'My Portfolio',
        heroTitle: 'Hello',
        heroSubtitle: 'Welcome',
        themeColor: '#000',
        badgeText: 'AVAILABLE FOR NEW OPPORTUNITIES',
        heroBgOpacity: 1.0,
        projectsBgOpacity: 1.0,
        blogBgOpacity: 1.0,
        skillsMatrixTitle: '技能矩阵',
        projectsSubtitle: '这里展示了我近期参与开发或主导的核心项目，涵盖前端交互、全栈开发与用户体验设计。',
        blogSubtitle: 'AIGC 实践心得、开发经验、技术探索笔记',
        faviconUrl: null,
      },
    })
  }

  res.json(settings)
})

router.put('/', authenticate, async (req, res) => {
  const profileKey = typeof req.query.profileKey === 'string' ? req.query.profileKey : null
  const profile = await resolveProfileByKey(profileKey)

  const existing = await prisma.setting.findFirst({ where: { profileId: profile.id } })
  if (!existing) {
    const created = await prisma.setting.create({ data: { ...req.body, profileId: profile.id } })
    return res.json(created)
  }

  const updated = await prisma.setting.update({
    where: { id: existing.id },
    data: req.body,
  })

  res.json(updated)
})

export default router
