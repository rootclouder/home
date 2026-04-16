import express from 'express'
import { Readable } from 'stream'

const router = express.Router()

router.get('/proxy', async (req, res) => {
  const urlParam = typeof req.query.url === 'string' ? req.query.url : null
  if (!urlParam) return res.status(400).json({ error: 'Missing url' })

  let url: URL
  try {
    url = new URL(urlParam)
  } catch {
    return res.status(400).json({ error: 'Invalid url' })
  }

  if (url.protocol !== 'https:') return res.status(400).json({ error: 'Invalid url' })
  if (!url.hostname.endsWith('.blob.vercel-storage.com')) return res.status(400).json({ error: 'Invalid url' })
  if (!url.pathname.startsWith('/uploads/')) return res.status(400).json({ error: 'Invalid url' })

  const upstream = await fetch(url.toString())
  if (!upstream.ok || !upstream.body) {
    return res.status(502).json({ error: 'Upstream failed' })
  }

  const contentType = upstream.headers.get('content-type')
  if (contentType) res.setHeader('Content-Type', contentType)

  const cacheControl = upstream.headers.get('cache-control') || 'public, max-age=86400'
  res.setHeader('Cache-Control', cacheControl)

  const etag = upstream.headers.get('etag')
  if (etag) res.setHeader('ETag', etag)

  const lastModified = upstream.headers.get('last-modified')
  if (lastModified) res.setHeader('Last-Modified', lastModified)

  Readable.fromWeb(upstream.body as any).pipe(res)
})

export default router

