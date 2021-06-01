# Prometheus Formatter

Browser extension which makes plain Prometheus/OpenMetrics output easier to read.

This extension is a simple syntax highlighter for Prometheus and OpenMetrics formats. For the highlighting to work, metric endpoints **must** use either HTTP Content-Type [`application/openmetrics-text`](https://github.com/OpenObservability/OpenMetrics/blob/main/specification/OpenMetrics.md#overall-structure) or [text/plain](https://prometheus.io/docs/instrumenting/exposition_formats/#text-based-format). 
For plain-text metrics, parsing is limited by default on URL paths matching '/metrics', '/federate', '/probe', '/prometheus' and '/actuator/prometheus'. By clicking on the extension's icon, you can define your own paths (Regular Expressions are suppported), which will override the default list.

###### Before:
![](_images/before.png)

###### After:
![](_images/after.png)

For highlighting in the terminal: [promcolor](https://github.com/fhemberger/promcolor).


## Installation

**Option 1** – install it from the web store:
* [Google Chrome](https://chrome.google.com/webstore/detail/prometheus-formatter/jhfbpphccndhifmpfbnpobpclhedckbb)
* [Firefox](https://addons.mozilla.org/addon/prometheus-formatter/)


**Option 2** – install it from source:

* Clone or download this repo
* **Google Chrome** or **Microsoft Edge**:
  * Go to `chrome://extensions/` respectively `edge://extensions/`,
  * enable "Developer mode",
  * click "Load unpacked extension",
  * select the `extension` folder in this repo.
* **Firefox**:
  * Go to `about:addons`
  * From the Cog-Menu on the right choose "Install Add-On From File …"

## License

[MIT](extension/LICENSE.txt)

