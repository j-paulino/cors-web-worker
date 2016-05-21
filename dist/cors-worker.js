(function () {
    "use strict";
    // Creating a promise
    //TODO; ADD more support for more VERBS
    var http = {
        get: request('get')
    };

    // Return the promise
    window.http = http;

    function request(verb) {
        return function (url) {
            var promise = new Promise(function (resolve, reject) {
                var request = new XMLHttpRequest();

                request.open(verb, url);
                request.send();

                request.onload = function () {
                    if (this.status >= 200 && this.status < 305) {
                        resolve(this.responseText);
                    } else {
                        reject(this.statusText);
                    }
                };

                request.onerror = function () {
                    reject(this.statusText);
                };
            });

            return promise;
        }
    }
})();

(function () {
    "use strict";

    function CORSWorker(url, scriptsToImport, dontFetchImmediately) {
        var self = this;
        scriptsToImport = scriptsToImport || [];
        this.url = url;
        this.__msgQueue = [];
        this.__eventsQueue = [];

        buildImportList(self, scriptsToImport).then(function (blobImportStr) {
            if (!dontFetchImmediately) self.fetch(blobImportStr);
        });
    }

    /**
     * Method fetches js file from its url and create and in memory copy of the file.
     * Once in memory (as a Blob) the file can be run as a WebWorker. The method returns a
     * promise.
     *
     * @method fetch
     * @return {Boolean} Promise
     */
    CORSWorker.prototype.fetch = function (blobImportStr) {
        var self = this,
            blobImportStr = blobImportStr || '';

        return (
            http.get(this.url).then(function (resText) {
                var workerText, blob;

                workerText = blobImportStr + resText;

                blob = new Blob([workerText], {type: 'application/javascript'});

                self.worker = new Worker(window.URL.createObjectURL(blob));

                processQueues(self);

                return self.worker;
            })
        );
    }

    /**
     * Wrapper around Worker.postMessage. While the Worker's js file is being retrieved,
     * any calls to postMessage will be queued to be processed once the worker is ready.
     *
     * @method postMessage
     */
    CORSWorker.prototype.postMessage = function () {
        if (this.worker) {
            this.worker.postMessage.apply(this.worker, arguments);
        } else {
            this.__msgQueue.push(arguments);
        }
    }

    /**
     * Wrapper around Worker.addEventListener. While the Worker's js file is being retrieved,
     * any calls to addEventListener will be queued to be processed once the worker is ready.
     *
     * @method addEventListener
     */
    CORSWorker.prototype.addEventListener = function () {
        if (this.worker) {
            this.worker.addEventListener.apply(this.worker, arguments);
        } else {
            this.__eventsQueue.push(arguments);
        }
    }

    /**
     * Wrapper around Worker.terminate. While the Worker's js file is being retrieved,
     * calls to terminate will be queued to be processed once the worker is ready.
     *
     * @method terminate
     */
    CORSWorker.prototype.terminate = function () {
        if (this.worker) {
            this.worker.terminate();
        } else {
            this.__msgQueue.push('__terminate__');
        }
    }

    function createBlobFromJSFile(url) {
        return http.get(url).then(function (resText) {
            var blob = new Blob([resText], {type: 'application/javascript'});
            return window.URL.createObjectURL(blob);
        });
    }

    function buildImportList(CORSWorker, urlList) {
        var importListPromises = [];

        urlList.forEach(function (url) {
            importListPromises.push(createBlobFromJSFile(url));
        });

        return Promise.all(importListPromises).then(function (values) {
            CORSWorker.blobUrls = values;
            return getImportString(values);
        });
    }

    function getImportString(blobUrlList) {
        var buffer = [],
            windowSelf = 'window = self;\n';

        blobUrlList.forEach(function (url) {
            buffer.push('"' + url + '"');
        });

        return buffer.length ? windowSelf + "importScripts(" + buffer.join(',') + ");\n" : '';
    }

    //Insure the eventListeners and eventHandlers get setup properly
    function processQueues(foreignWorker) {
        var msgArgs, i,
            msgQueueLen = foreignWorker.__msgQueue.length,
            worker = foreignWorker.worker;

        if (typeof foreignWorker.onmessage === 'function') {
            worker.onmessage = foreignWorker.onmessage;
        }

        if (typeof foreignWorker.onerror === 'function') {
            worker.onerror = foreignWorker.onerror;
        }

        foreignWorker.__eventsQueue.forEach(function (eventArgs) {
            worker.addEventListener.apply(foreignWorker.worker, eventArgs);
        });

        for (i = 0; i < msgQueueLen; i++) {
            msgArgs = foreignWorker.__msgQueue[i];
            //TODO: Change this...
            if (msgArgs === '__terminate__') {
                worker.terminate();
                break;
            }

            worker.postMessage.apply(foreignWorker.worker, msgArgs);
        }

        foreignWorker.__msgQueue = null;
        foreignWorker.__eventsQueue = null;
    }

    window.CORSWorker = CORSWorker;
})();

