angular.module("cummins-supervisorio")// This service keeps track of pending requests
.service('pendingRequests', function () {
    var pending = [];
    this.get = function () {
        return pending;
    };
    this.add = function (request) {
        pending.push(request);
    };
    this.remove = function (request) {
        pending = _.filter(pending, function (p) {
            return p.url !== request;
        });
    };
    this.cancelAll = function () {
        angular.forEach(pending, function (p) {
            p.canceller.promise.abortedStatus = true;
            p.canceller.resolve();
        });
        pending.length = 0;
    };
})
// This service wraps $http to make sure pending requests are tracked 
.service('httpService', ['$http', '$q', 'pendingRequests', function ($http, $q, pendingRequests) {
    this.get = function (url) {
        var canceller = $q.defer();
        pendingRequests.add({
            url: url,
            canceller: canceller
        });
        //Request gets cancelled if the timeout-promise is resolved
        var requestPromise = $http.get(url, { timeout: canceller.promise });
        //Once a request has failed or succeeded, remove it from the pending list
        requestPromise.finally(function () {
            pendingRequests.remove(url);
        });
        return requestPromise;
    }
}])
