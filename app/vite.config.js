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
      server.middlewares.use('/data', (req, res, next) => {
        const url = req.url || ''
        const rel = url.replace(/^\/?data\/?/, '')
        const filePath = path.resolve(__dirname, '../data', rel)
        fs.readFile(filePath, (err, data) => {
          if (err) {
            res.statusCode = 404
            res.end('Not found')
            return
          }
          // naive content type handling; JSON is sufficient for our use
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
        })
      })
    }
  }
}

export default defineConfig({
  plugins: [react(), serveRootDataPlugin()],
  base: '/beta/',
  build: { outDir: '../beta', emptyOutDir: true }
})
