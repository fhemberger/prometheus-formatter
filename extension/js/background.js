/* global chrome, console */

const defaultPaths = [
  '^/metrics',
  '^/federate',
  '^/probe',
  '^/prometheus',
  '^/actuator/prometheus'
]

// https://adrianroselli.com/2022/12/brief-note-on-description-list-support.html
const formatPrometheusMetrics = (body) => {
  let previousMetricName = ''
  return body
    .split(/\r?\n/)
    .map(line => {
      let tmp

      // line is a comment
      tmp = line.match(/^# (?:HELP|TYPE) ([^ ]+)/)
      if (tmp && tmp.length > 1) {
        let metricName = tmp[1]

        // First comment, don't render closing </section>
        if (previousMetricName == '') {
          previousMetricName = metricName
          return `<section aria-label="${metricName}">\n<span class="comment">${line}</span>`
        }

        if (metricName != previousMetricName) {
          previousMetricName = metricName
          return `</section>\n<section aria-label="${metricName}">\n<span class="comment">${line}</span>`
        }

        return `<span class="comment">${line}</span>`
      }

      // line is a metric
      tmp = line.match(/^([\w_]+)(?:\{(.*)\})?\x20(.+)/)
      if (tmp && tmp.length > 1) {
        let [_, metricName, labels, value] = tmp // eslint-disable-line no-unused-vars

        if (labels) {
          labels = labels.replace(/([^,]+?)="(.*?)",?/g, '<dt class="label-key" role="associationlistitemkey">$1</dt><dd class="label-value" role="associationlistitemvalue">$2</dd>')
          labels = `<dl class="labels" role="associationlist">${labels}</dl>`
        }

        return `<span class="metric-name">${metricName}</span>${labels || ''} <span class="value">${value}</span>`
      }

      // line is something else, do nothing
      return line
    })
    .join('<br>') + '</section>'
  }

// Listen for requests from content pages wanting to set up a port
chrome.runtime.onConnect.addListener(port => {
  if (port.name !== 'promformat') {
    console.error(`[Prometheus Formatter] unknown port name "${port.name}". Aborting.`)
    return
  }

  port.onMessage.addListener(msg => {
    if (msg.name !== 'PROMETHEUS_METRICS_RAW_BODY') {
      return
    }

    // Post the HTML string back to the content script
    port.postMessage({
      name: 'PROMETHEUS_METRICS_FORMATTED_BODY',
      payload: formatPrometheusMetrics(msg.payload)
    })

    // Disconnect
    port.disconnect()
  })
})

// Set default paths on extension installation and update
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.get({ paths: [] }, storedData => {
    if (!storedData.paths.length) {
      chrome.storage.sync.set({ paths: defaultPaths })
    }
  })
})
