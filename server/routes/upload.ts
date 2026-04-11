import express from 'express'
import multer from 'multer'
import { put } from '@vercel/blob'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// 使用内存存储，因为 Vercel 的文件系统是只读的
// 增加文件大小限制 10MB
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
})

// 导出为 ES Module 并在顶部声明为 Vercel Serverless Function 可能会有问题，但其实这是路由模块，不是入口点。
router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    // 生成唯一的文件名，清理掉非英文字符防止 Vercel Blob 报错
    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8')
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${Date.now()}-${safeName}`

    // 上传到 Vercel Blob
    const blob = await put(`uploads/${filename}`, req.file.buffer, {
      access: 'public',
      // 这里确保使用了正确的 token
      token: process.env.BLOB_READ_WRITE_TOKEN
    })

    res.json({ url: blob.url })
  } catch (error) {
    console.error('Vercel Blob upload error:', error)
    res.status(500).json({ error: 'Upload failed', details: String(error) })
  }
})

export default router
