import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const user = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
    },
  })

  console.log('Admin user created/verified:', user.username)

  // Create default settings
  const existingSetting = await prisma.setting.findFirst()
  if (!existingSetting) {
    await prisma.setting.create({
      data: {
        siteTitle: '我的个人主页',
        heroTitle: '你好，我是独立开发者',
        heroSubtitle: '探索未知，创造可能',
        themeColor: '#000000',
      },
    })
    console.log('Default settings created.')
  } else {
    console.log('Settings already exist.')
  }

  // Create default categories
  const categoriesCount = await prisma.category.count()
  if (categoriesCount === 0) {
    const techCategory = await prisma.category.create({
      data: {
        name: '技术随笔',
        sortOrder: 1,
      }
    })
    
    const lifeCategory = await prisma.category.create({
      data: {
        name: '生活日常',
        sortOrder: 2,
      }
    })

    console.log('Default categories created:', techCategory.name, lifeCategory.name)
    
    // Create some default posts
    await prisma.post.create({
      data: {
        categoryId: techCategory.id,
        title: '如何构建一个全栈应用',
        content: '这是一个关于全栈开发的示例文本。你可以通过后台管理系统修改这些内容。',
      }
    })
    
    console.log('Default post created.')
  }

  // Create default projects
  const projectsCount = await prisma.project.count()
  if (projectsCount === 0) {
    await prisma.project.create({
      data: {
        title: '示例开源项目',
        description: '一个在 Github 上开源的实用工具。',
        projectUrl: 'https://github.com',
        sortOrder: 1,
      }
    })
    console.log('Default project created.')
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
