(function () {
    "use strict";
    //TODO; ADD more support for more VERBS
    var http = {
        get: request('get')
    };

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
