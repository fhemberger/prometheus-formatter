# Prometheus Formatter

Chrome Extension which makes plain Prometheus metrics easier to read.

This extension is a simple syntax highlighter for plain text Prometheus metrics. 
By default it works on URL paths matching '/metrics', '/federate', '/probe', '/prometheus' and '/actuator/prometheus'. By clicking on the extension's icon, you can define your own paths (Regular Expressions are suppported), which will override the default list.

###### before:
![](_images/before.png)

###### after:
![](_images/after.png)


## Installation

**Option 1** – just install it from the [Chrome Web Store](https://chrome.google.com/webstore/detail/prometheus-formatter/jhfbpphccndhifmpfbnpobpclhedckbb).

**Option 2** – install it from source:

* clone/download this repo,
* open Chrome and go to `chrome://chrome/extensions/`,
* enable "Developer mode",
* click "Load unpacked extension",
* select the `extension` folder in this repo.


## License

[MIT](extension/LICENSE.txt)

