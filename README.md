# CORSWorker.js

## CORS Web Workers
Wrapper class around the Worker object. Uses the Blob api to build Workers from scripts in different domains. The worker is assemble asynchronously, but things can be done in a synchronous manner.

### Post messages to your worker before it's created. 
#### The messages will be queued until the worker is ready.
```javascript
var worker = new CORSWorker('http://example.com/js/worker.js');
worker.postMessage('test');

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
