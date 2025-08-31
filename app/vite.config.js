import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

// Simple dev-only middleware to serve JSON from the repo's root-level `data/` folder
// so that `npm run dev` works without changing fetch URLs used in production.
function serveRootDataPlugin() {
  return {
    name: 'serve-root-data',
    configureServer(server) {
      const handler = (req, res) => {
        const url = req.url || ''
        const rel = url.replace(/^\/?data\/?/, '')
        const filePath = path.resolve(__dirname, '../data', rel)
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.statusCode = 404
            res.end('Not found')
            return
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
        })
      }
      server.middlewares.use('/data', handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/data', (req, res) => {
        const url = req.url || ''
        const rel = url.replace(/^\/?data\/?/, '')
        const filePath = path.resolve(__dirname, '../data', rel)
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.statusCode = 404
            res.end('Not found')
            return
          }
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
        })
      })
    }
  }
}

const BASE = process.env.BUILD_BASE || '/cv/'
const OUT_DIR = process.env.BUILD_OUT || '../cv'

export default defineConfig({
  plugins: [react(), serveRootDataPlugin()],
  base: BASE,
  build: { outDir: OUT_DIR, emptyOutDir: true }
})
