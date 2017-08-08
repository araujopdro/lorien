'use strict';
angular.module("cummins-supervisorio").factory('messagesHandler', function () {
    var service = {};
    
    var messages;

    service.getMessages = function () {
        return messages
    };

    service.setMessages = function (_messages) {
        messages = _messages;
    };

    service.resetMessageList = function () {
        messages = [];
    };

    return service;
});