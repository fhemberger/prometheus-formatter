/* global chrome */

// Don't process HTTP response bodies over 30MB
const MAX_BODY_SIZE_BYTES = 30 * 1024 * 1024

const sendBodyToFormatter = (storedData) => {
  // Check if it is a Prometheus plain text response
  // This is quite a basic assumption, as the browser cannot access the
  // 'version' part of the content type to verify.
  if (document.contentType !== 'text/plain') {
    port.disconnect()
    return
  }

  // Check if the current page's paths matches one of our whitelist
  if (!storedData.paths.some(path => document.location.pathname.match(path))) {
    port.disconnect()
    return
  }

  // Check if plain text wrapped in <pre> element exists and doesn't exceed
  // MAX_BODY_SIZE_BYTES
  const pre = document.body.querySelector('pre')
  const rawBody = pre && pre.innerText

  if (!rawBody || rawBody.length > MAX_BODY_SIZE_BYTES) {
    port.disconnect()
    return
  }

  // Post the contents of the PRE
  port.postMessage({
    name: 'PROMETHEUS_METRICS_RAW_BODY',
    payload: rawBody
  })
}

const renderFormattedHTML = (html) => {
  const style = `
    pre {
      display:none
    }
    #promformat {
      font-family: monospace;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
    .comment {
      color: #6a737d;
      display: inline-block;
    }
    br + .comment {
      padding-top: 1em;
    }
    .comment + br + .comment {
        padding-top: 0;
    }

    .metric      { color: #000 }
    .value       { color: #ff20ed }
    .label-key   { color: blue }
    .label-value { color: green }
    `

  // Insert CSS
  const promformatStyle = document.createElement('style')
  document.head.appendChild(promformatStyle)
  promformatStyle.insertAdjacentHTML('beforeend', style)

  // Insert HTML content
  const promformatContent = document.createElement('div')
  promformatContent.id = 'promformat'
  document.body.appendChild(promformatContent)

  promformatContent.innerHTML = html
}

const port = chrome.runtime.connect({ name: 'promformat' })

// Add listener to receive response from background when ready
port.onMessage.addListener(msg => {
  if (msg.name !== 'PROMETHEUS_METRICS_FORMATTED_BODY') {
    return
  }

  renderFormattedHTML(msg.payload)
})

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get({ paths: [] }, sendBodyToFormatter)
})
