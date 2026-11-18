// Server statis minimal tanpa dependensi untuk hasil build (dipakai jika platform
// menjalankan `npm start`). Semua rute SPA yang tidak berupa file diarahkan ke index.html.
const http = require('node:http')
const fs = require('node:fs')
const path = require('node:path')

const root = __dirname
const port = Number(process.env.PORT || process.env.APP_PORT) || 4173

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
}

function send(res, file) {
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      res.end('Not found')
      return
    }
    const isAsset = file.includes(`${path.sep}assets${path.sep}`)
    res.writeHead(200, {
      'Content-Type': TYPES[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': isAsset ? 'public, max-age=31536000, immutable' : 'no-cache',
    })
    res.end(data)
  })
}

http
  .createServer((req, res) => {
    let urlPath
    try {
      urlPath = decodeURIComponent(req.url.split('?')[0])
    } catch {
      urlPath = '/'
    }
    const file = path.join(root, path.normalize(urlPath))
    if (!file.startsWith(root)) {
      res.writeHead(403)
      res.end()
      return
    }
    fs.stat(file, (err, stat) => send(res, err || stat.isDirectory() ? path.join(root, 'index.html') : file))
  })
  .listen(port, '0.0.0.0', () => console.log(`Delcom Blog frontend berjalan di port ${port}`))
