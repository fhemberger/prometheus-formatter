/* global chrome, console */

(function () {
  'use strict'

  const compress = (text) => text.replace(/\s+/g, '')

  const maxBodyLength = 3000000 // 3MB

  const style = compress(`
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
    `)

  const port = chrome.extension.connect({name: 'promformat'})

  // Add listener to receive response from BG when ready
  port.onMessage.addListener(function (msg) {
    switch (msg.name) {
      case 'FORMATTED' :
        // Insert CSS
        const promformatStyle = document.createElement('style')
        document.head.appendChild(promformatStyle)
        promformatStyle.insertAdjacentHTML('beforeend', style)

        // Insert HTML content
        const promformatContent = document.createElement('div')
        promformatContent.id = 'promformat'
        document.body.appendChild(promformatContent)

        promformatContent.innerHTML = msg.payload
        break

      default :
        throw new Error('Message not understood: ' + msg.name)
    }
  })

  function ready (data) {
    // Check if it is a Prometheus plain text response
    // This is quite a basic assumption, as the browser cannot access the
    // 'version' part of the content type to verify.
    let paths = data.paths.length ? data.paths : []
    
    if (document.contentType !== 'text/plain') {
      return
    }
    
    for (var i = 0; i < paths.length; ++i) {
      if (document.location.pathname.match(paths[i])) {
        format()
        break
      }
    }
  }

  function format() {
    // Check if plain text wrapped in <pre> element exists and doesn't exceed maxBodyLength
    const pre = document.body.querySelector('pre')
    const rawBody = pre && pre.innerText

    if (!rawBody || rawBody.length > maxBodyLength) {
      port.disconnect()
      return
    }

    // Post the contents of the PRE
    port.postMessage({
      name: 'SENDING TEXT',
      payload: rawBody
    })
  }

  document.addEventListener('DOMContentLoaded', function() {
    chrome.storage.sync.get({paths: []}, ready);
  });
})()
