import express from 'express'
import multer from 'multer'
import { put } from '@vercel/blob'
import { authenticate } from '../middleware/auth.js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const _dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

const router = express.Router()

// 使用内存存储
// 增加文件大小限制 10MB
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024
  }
})

router.post('/', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' })

    const originalName = Buffer.from(req.file.originalname, 'latin1').toString('utf8')
    const safeName = originalName.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${Date.now()}-${safeName}`

    const token = process.env.BLOB_READ_WRITE_TOKEN
    
    if (token) {
      // Vercel Blob 上传
      const blob = await put(`uploads/${filename}`, req.file.buffer, {
        access: 'public', 
        token: token
      })
      return res.json({ url: blob.url })
    } else {
      // 本地回退上传
      console.warn('BLOB_READ_WRITE_TOKEN is missing. Falling back to local file storage for development.')
      
      const uploadsDir = path.join(_dirname, '../../public/uploads')
      
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true })
      }
      
      const filePath = path.join(uploadsDir, filename)
      fs.writeFileSync(filePath, req.file.buffer)
      
      return res.json({ url: `/uploads/${filename}` })
    }
  } catch (error) {
    console.error('Upload error:', error)
    res.status(500).json({ error: 'Upload failed', details: String(error) })
  }
})

export default router
