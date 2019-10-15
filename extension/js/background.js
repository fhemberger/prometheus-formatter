/* global chrome, console */

(function () {
  'use strict'

  const defaultPaths = [
    '^/metrics',
    '^/federate',
    '^/probe',
    '^/prometheus',
    '^/actuator/prometheus'
  ]

  // Listen for requests from content pages wanting to set up a port
  chrome.extension.onConnect.addListener(port => {
    if (port.name !== 'promformat') {
      console.error(`[Prometheus Formatter] unknown port name "${port.name}". Aborting.`)
      return
    }

    port.onMessage.addListener(msg => {
      if (msg.name !== 'SENDING TEXT') {
        return
      }

      let html = msg.payload
        .split(/\r?\n/)
        .map(line => {
          // line is a comment
          if (/^#/.test(line)) {
            return `<span class="comment">${line}</span>`
          }

          // line is a metric
          let tmp = line.match(/^(?<metric>[\w_]+)(?:\{(?<tags>.*)\})?\x20(?<value>.+)/)
          if (tmp && tmp.length > 1) {
            let { metric, tags, value } = tmp.groups
            if (tags) {
              tags = tags.replace(/([^,]+?)="(.*?)"/g, '<span class="label-key">$1</span>="<span class="label-value">$2</span>"')
              tags = `{${tags}}`
            }

            return `<span class="metric">${metric}</span>${tags || ''} <span class="value">${value}</span>`
          }

          // line is something else, do nothing
          return line
        })
        .join('<br>')

      // Post the HTML string to the content script
      port.postMessage({
        name: 'FORMATTED',
        payload: html
      })

      // Disconnect
      port.disconnect()
    })
  })

  // Set default paths on extension installation and update
  chrome.runtime.onInstalled.addListener(() => {
    chrome.storage.sync.get({ paths: [] }, data => {
      if (!data.paths.length) {
        chrome.storage.sync.set({ paths: defaultPaths })
      }
    })
  })
}())
