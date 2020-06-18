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
  const link = document.createElement('link');
  link.href='https://fonts.googleapis.com/css2?family=Source+Code+Pro&display=swap';
  link.rel='stylesheet';
  document.getElementsByTagName('head')[0].appendChild(link)

  const style = `
    pre {
      display:none
    }
    #promformat {
      font-family: 'Source Code Pro', monospace;
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

    body         { background-color: #FAFAFA; color: #383A42 }
    .metric      { color: #E45649 }
    .value       { color: #A625A4 }
    .label-key   { color: #4078F2 }
    .label-value { color: #50A14F }
    .comment     { color: #A0A1A7 }

    @media (prefers-color-scheme:dark) {
      body         { background-color: #282C34; color: #ABB2BF }
      .metric      { color: #DE6A73 }
      .value       { color: #C678DD }
      .label-key   { color: #60AFEF }
      .label-value { color: #98C379 }
      .comment     { color: #5A616E }
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
