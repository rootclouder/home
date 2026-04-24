import { prisma } from '../db.js'

export const RESERVED_PROFILE_KEYS = new Set([
  'api',
  'admin',
  'console-center',
  'projects',
  'articles',
  'uploads',
  'assets',
])

export async function getOrCreateDefaultProfile() {
  const existing = await prisma.profile.findFirst({ where: { isDefault: true } })
  if (existing) return existing

  const created = await prisma.profile.create({
    data: {
      key: 'default',
      name: '默认',
      isDefault: true,
    },
  })

  return created
}

export async function resolveProfileByKey(profileKey?: string | null) {
  if (profileKey) {
    const found = await prisma.profile.findUnique({ where: { key: profileKey } })
    if (found) return found
  }

  const defaultProfile = await getOrCreateDefaultProfile()
  await ensureDefaultProfileData(defaultProfile.id)
  return defaultProfile
}

export async function ensureDefaultProfileData(defaultProfileId: string) {
  const settings = await prisma.setting.findFirst({ where: { profileId: defaultProfileId } })
  if (!settings) {
    await prisma.setting.create({
      data: {
        profileId: defaultProfileId,
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

  await prisma.project.updateMany({
    where: { profileId: null },
    data: { profileId: defaultProfileId },
  })
  await prisma.category.updateMany({
    where: { profileId: null },
    data: { profileId: defaultProfileId },
  })
  await prisma.post.updateMany({
    where: { profileId: null },
    data: { profileId: defaultProfileId },
  })
  await prisma.workExperience.updateMany({
    where: { profileId: null },
    data: { profileId: defaultProfileId },
  })
  await prisma.projectExperience.updateMany({
    where: { profileId: null },
    data: { profileId: defaultProfileId },
  })
  await prisma.skillMatrixItem.updateMany({
    where: { profileId: null },
    data: { profileId: defaultProfileId },
  })
}
