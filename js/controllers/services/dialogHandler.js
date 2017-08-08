'use strict';
angular.module("cummins-supervisorio").factory('dialogHandler', function () {
    var service = {};

    var layout;

    service.setConfig = function (_layout) {
        layout = _layout;
    };

    service.getConfig = function () {
        return layout;
    };

    return service;
});