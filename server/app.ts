// @ts-nocheck
/**
 * This is a API server
 */
import 'express-async-errors'

import express from 'express'
import { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import path from 'path'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import authRoutes from './routes/auth.js'
import settingsRoutes from './routes/settings.js'
import projectsRoutes from './routes/projects.js'
import categoriesRoutes from './routes/categories.js'
import postsRoutes from './routes/posts.js'
import uploadRoutes from './routes/upload.js'
import workExperiencesRoutes from './routes/work-experiences.js'

// fallback for CommonJS or ESM
const _dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url))

// load env
dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))

/**
 * API Routes
 */
app.use('/api/auth', authRoutes)
app.use('/api/settings', settingsRoutes)
app.use('/api/projects', projectsRoutes)
app.use('/api/categories', categoriesRoutes)
app.use('/api/posts', postsRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/work-experiences', workExperiencesRoutes)

// Serve uploads statically (only needed for local development if not using Blob, but we use Blob now)
// app.use('/uploads', express.static(path.join(_dirname, '../uploads')))

/**
 * health
 */
app.use(
  '/api/health',
  (req: Request, res: Response, next: NextFunction): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    })
  },
)

/**
 * error handler middleware
 */
app.use((error: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Server error:', error)
  res.status(500).json({
    success: false,
    error: 'Server internal error',
    message: error.message
  })
})

/**
 * 404 handler
 */
app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
  })
})

export default app
