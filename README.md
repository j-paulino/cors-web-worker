# CORSWorker.js

## CORS Web Workers
Wrapper class around the Worker object. Uses the Blob api to build Workers from scripts in different domains. The Worker
script can be hosted at domain A and you can import scripts from domain B, C, D...etc. The worker is assemble asynchronously, but things can be done in a synchronous matter.

### Post messages to your worker before it's created. The messages will be queued until the worker is ready.
```javascript
var importScriptsList = ['script1.js', 'http://example.com/js/script2.js'];

// You can pass scripts to import on instantiation 
var worker = new CORSWorker(workerUrl, importScriptsList);
worker.postMessage('test');

// Or you can Import them in your worker file using importScripts
// worker.js
importScripts('script1.js');
importScripts('http://example.com/js/script2.js');
...
```

### Event handler can be declared before the worker has loaded, but will be attached once the worker is ready.
```javascript
var worker = new CORSWorker(workerUrl, importScriptsList);

worker.onmessage = function (e) {
    var target = document.querySelector('#target');
    var html = e.data + "<br />";
    target.innerHTML += html;
};

worker.addEventListener('error', function (event) {
    console.log('Error');
});
```
NOTE: At this point I am just checking my progress, still need to clean things up and add some tests.
