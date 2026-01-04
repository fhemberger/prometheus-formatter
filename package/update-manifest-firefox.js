#!/usr/bin/env node

const fs = require('fs')
const path = require('path')
const manifestPath = path.join(__dirname, '..', 'extension-firefox', 'manifest.json')
const manifest = require(manifestPath)

// Firefox needs additional keys in the manifest.json which are not allowed in Chrome
// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Browser_compatibility_for_manifest.json
manifest.browser_specific_settings = {
  gecko: {
    id: 'prometheus-formatter@frederic-hemberger.de',
    strict_min_version: '142.0',
    // https://extensionworkshop.com/documentation/develop/firefox-builtin-data-consent/
    data_collection_permissions: {
      required: ['none']
    }
  }
}

// Firefox will migrate from background scripts to Service Workers later
manifest.background.scripts = [
  'js/background.js'
]

delete manifest.background.service_worker

fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
