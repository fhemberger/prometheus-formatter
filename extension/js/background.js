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
      tmp = line.match(/^(?<metric_name>[\w_]+)(?:\{(?<metric_labels>.*?)\})?\x20(?<metric_value>[^\s]+)(?<exemplar>\x20?#\x20?(?:\{(?<exemplar_labels>.*?)\})?\x20(?<exemplar_value>(.+)))?/)
      if (tmp && tmp.length > 1) {
        if (tmp.groups.metric_labels) {
          tmp.groups.metric_labels = tmp.groups.metric_labels.replace(/([^,]+?)="(.*?)",?/g, '<dt class="label-key" role="associationlistitemkey">$1</dt><dd class="label-value" role="associationlistitemvalue">$2</dd>')
          tmp.groups.metric_labels = `<dl class="labels" role="associationlist">${tmp.groups.metric_labels}</dl>`
        }

        let exemplar = ''
        if (tmp.groups.exemplar) {
          if (tmp.groups.exemplar_labels) {
            tmp.groups.exemplar_labels = tmp.groups.exemplar_labels.replace(/([^,]+?)="(.*?)",?/g, '<dt class="label-key" role="associationlistitemkey">$1</dt><dd class="label-value" role="associationlistitemvalue">$2</dd>')
            tmp.groups.exemplar_labels = `<dl class="labels" role="associationlist">${tmp.groups.exemplar_labels}</dl>`
          }

          exemplar = `<span class="exemplar aria-label="Exemplar"> <span aria-hidden="true">#</span> ${tmp.groups.exemplar_labels || ''} ${tmp.groups.exemplar_value}</span>`
        }

        return `<span class="metric-name">${tmp.groups.metric_name}</span>${tmp.groups.metric_labels || ''} <span class="value">${tmp.groups.metric_value}</span>${exemplar}`
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
