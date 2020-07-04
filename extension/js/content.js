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
      display: none;
    }
    #promformat {
      font-family: SFMono-Regular,Consolas,Liberation Mono,Menlo,monospace;
      word-wrap: break-word;
      white-space: pre-wrap;
    }
    .comment {
      display: inline-block;
    }
    br + .comment {
      padding-top: 1em;
    }
    .comment + br + .comment {
      padding-top: 0;
    }

    body         { background-color: #fff; color: #000 }
    .metric      { color: #de3121 }
    .value       { color: #a625a4 }
    .label-key   { color: #2d6bf0 }
    .label-value { color: #418240 }
    .comment     { color: #73747d }

    @media (prefers-color-scheme:dark) {
      body         { background-color: #1d2025; color: #fff }
      .metric      { color: #de6a73 }
      .value       { color: #98c379 }
      .label-key   { color: #60afef }
      .label-value { color: #98c379 }
      .comment     { color: #9297a0 }
    }
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
