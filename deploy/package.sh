#!/bin/sh
# Menyusun paket deploy frontend dari hasil `npm run build` (folder dist/) ke folder release/.
# Paket dibuat agar berjalan pada berbagai cara platform menyajikan website:
#   - nginx menyajikan root paket      -> index.html & assets/ ada di root
#   - nginx menyajikan dist/ atau build/ -> salinan lengkap tersedia di keduanya
#   - platform menjalankan npm install / npm run build / npm start
#     -> package.json tanpa dependensi, build no-op, start = server statis Node (server.cjs)
set -e

if [ ! -f dist/index.html ]; then
    echo "ERROR: dist/index.html tidak ditemukan, jalankan npm run build terlebih dahulu"
    exit 1
fi

rm -rf release
mkdir -p release

cp -R dist/. release/
cp -R dist release/dist
cp -R dist release/build
cp deploy/server.cjs release/server.cjs

cat > release/package.json <<'EOF'
{
  "name": "delcom-blog-frontend-dist",
  "private": true,
  "version": "1.0.0",
  "description": "Hasil build statis Delcom Blog (React SPA).",
  "scripts": {
    "build": "echo \"Hasil build sudah tersedia (prebuilt), tidak perlu build ulang\"",
    "start": "node server.cjs"
  }
}
EOF

cat > release/package-lock.json <<'EOF'
{
  "name": "delcom-blog-frontend-dist",
  "version": "1.0.0",
  "lockfileVersion": 3,
  "requires": true,
  "packages": {
    "": {
      "name": "delcom-blog-frontend-dist",
      "version": "1.0.0"
    }
  }
}
EOF

echo "=== Isi paket release/ ==="
ls -la release
