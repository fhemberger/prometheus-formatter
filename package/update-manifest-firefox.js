#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const manifestPath = path.join(__dirname, '..', 'extension-firefox', 'manifest.json')
const manifest = require(manifestPath)

// Firefox needs additional keys in the manifest.json which are not allowed in Chrome
manifest.browser_specific_settings = {
  gecko: {
    id: 'prometheus-formatter@frederic-hemberger.de',
    strict_min_version: '72.0'
  }
}

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
