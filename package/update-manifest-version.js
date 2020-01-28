#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const pkg = require(path.join(__dirname, '..', 'package.json'))
const manifestPath = path.join(__dirname, '..', 'extension', 'manifest.json')
const manifest = require(manifestPath)

manifest.version = pkg.version
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
