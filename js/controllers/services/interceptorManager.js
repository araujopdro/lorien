'use strict';
angular.module("cummins-supervisorio").factory('interceptorManager', function () {
    var service = {};

    var loading = false

    service.startLoading = function () {
        loading = true;
    };

    service.stopLoading = function () {
        loading = false;
    };

    service.getStatus = function () {
        return loading;
    };

    return service;
});