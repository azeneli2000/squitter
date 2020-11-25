```js
var timeframeToSeconds = require('timeframe-to-seconds');

timeframeToSeconds('1m'); // 60
timeframeToSeconds('3m'); // 180
timeframeToSeconds('1h'); // 3600
timeframeToSeconds('2h'); // 7200
timeframeToSeconds('1d'); // 86400
timeframeToSeconds('1w'); // 604800
```

```sh
$ node timeframe-to-seconds 12h
43200
```
