# JSON Diff Change
This tool is written to compare provided JSON data. The tool validates JSOM and provides result with statuses for new, updaets and removals.

### Install

```sh
npm install json-diff-change --save
```

### How to use
```js
var jdiff = require('json-diff-change');
var response  = jdiff.compare("<Old JSON String>", "<New JSON String>", true);
console.log(response);
```

### Issue
In case of facing issues, please reachout to me: koradia.savan@gmail.com


### Contribute on github
https://github.com/savankoradia/json-diff-change
