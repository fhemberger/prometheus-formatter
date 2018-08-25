let pathsElement = document.getElementById('paths-to-handle');

pathsElement.addEventListener('keyup', function(element) {
	let paths = element.target.value;
	let sliced = []
	if (paths != "") {
		sliced = paths.split("\n")
	}
	chrome.storage.sync.set({paths: sliced}) 
});

document.addEventListener('DOMContentLoaded', function() {
	chrome.storage.sync.get({paths: []}, function(data) {
		pathsElement.value = data.paths.join("\n")
	})
});