const fs = require('fs')
const pkg = require('./package.json')
const manifest = require('./extension/manifest.json')

manifest.version = pkg.version
fs.writeFileSync('./extension/manifest.json', JSON.stringify(manifest, null, 2), 'utf8')
