/* global chrome */

const pathsElement = document.getElementById('paths-to-handle')

pathsElement.addEventListener('keyup', element => {
  const paths = element.target.value.trim()
  let sliced = []
  if (paths !== '') {
    sliced = paths.split('\n')
  }
  chrome.storage.sync.set({ paths: sliced })
})

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.sync.get({ paths: [] }, data => {
    pathsElement.value = data.paths.join('\n')
  })
})
