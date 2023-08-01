/* global chrome */

// Don't process HTTP response bodies over 30MB
const MAX_BODY_SIZE_BYTES = 30 * 1024 * 1024

// OpenMetrics endpoints have a dedicated HTTP content-type, but Prometheus
// sends a plain-text response. Parsing all text/plain types is a too broad
// assumption, and the browser cannot access the 'version' part of the
// content-type to verify it's actually a Prometheus endpoint. Some exporters
// might not even include the version string. Thus, for text/plain responses,
// the current page's path *must* be contained in the allow list.
const isValidEndpoint = (allowedPaths) => {
  if (document.contentType === 'application/openmetrics-text') { return true }
  if (
    document.contentType === 'text/plain' &&
    allowedPaths.some(path => document.location.pathname.match(path))
  ) { return true }
  return false
}

const sendBodyToFormatter = (storedData) => {
  if (!isValidEndpoint(storedData.paths)) {
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
  const d = new DOMParser()

  const css = `
    :root {
      --bg: #fff;
      --fg: #000;

      /* https://github.com/atom/atom/blob/master/packages/one-light-syntax/styles/colors.less */

      /* Monochrome ------------------------------- */
      --mono-1: #383a42;
      --mono-2: #696c77;
      --mono-3: #a0a1a7;

      /* Colors ----------------------------------- */
      --cyan: #0184bc;
      --blue: #4078f2;
      --purple: #a626a4;
      --green: #50a14f;

      --red-1: #e45649;
      --red-2: #ca1243;

      --orange-1: #b76b01;
      --orange-1: #cb7701;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #1d2025;
        --fg: #fff;

        /* https://github.com/atom/atom/blob/master/packages/one-dark-syntax/styles/colors.less */

        /* Monochrome ----------------------------- */
        --mono-1: #abb2bf;
        --mono-2: #828997;
        --mono-3: #5c6370;

        /* Colors --------------------------------- */
        --cyan: #56b6c2;
        --blue: #61afef;
        --purple: #c678dd;
        --green: #98c379;

        --red-1: #e06c75;
        --red-2: #be5046;

        --orange-1: #d19a66;
        --orange-2: #e5c07b;
      }
    }

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

    body         { background-color: var(--bg); color: var(--fg) }
    .metric      { color: var(--red-1) }
    .value       { color: var(--purple) }
    .label-key   { color: var(--blue) }
    .label-value { color: var(--green) }
    .comment     { color: var(--mono-2) }
    `

  // Insert CSS
  const style = document.createElement('style')
  document.head.appendChild(style)
  style.textContent = css

  // Insert HTML content
  const doc = d.parseFromString(html, 'text/html')
  document.body = doc.body
  document.body.id = 'promformat'
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
