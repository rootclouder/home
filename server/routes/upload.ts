import express from 'express'
import multer from 'multer'
import { put } from '@vercel/blob'
import { authenticate } from '../middleware/auth.js'

const router = express.Router()

// 使用内存存储，因为 Vercel 的文件系统是只读的
const upload = multer({ storage: multer.memoryStorage() })

router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    // 生成唯一的文件名
    const filename = `${Date.now()}-${Buffer.from(req.file.originalname, 'latin1').toString('utf8')}`

    // 上传到 Vercel Blob
    const blob = await put(`uploads/${filename}`, req.file.buffer, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN
    })

    res.json({ url: blob.url })
  } catch (error) {
    console.error('Vercel Blob upload error:', error)
    res.status(500).json({ error: 'Upload failed' })
  }
})

export default router
