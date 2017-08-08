'use strict';

angular.module("cummins-supervisorio").factory('EndpointManagement', function (portsAPI, $timeout) {
    var service = {};

    service.PutEndpoint = function (gruposelecionado, url, usersList) {
        var endpoint = {
            "environment": "homolog",
            "permissions": [
                {
                    "permission": "GET"
                },
                {
                    "permission": "PUT"
                },
                {
                    "permission": "DELETE"
                },
                {
                    "permission": "POST"
                }
            ],
            "displayUrl": url.displayUrl,
            "url": url.url
        };
        var endpoint2 = {
            "environment": "prod",
            "permissions": [
                {
                    "permission": "GET"
                },
                {
                    "permission": "PUT"
                },
                {
                    "permission": "DELETE"
                },
                {
                    "permission": "POST"
                }
            ],
            "displayUrl": url.displayUrl,
            "url": url.url
        };
        gruposelecionado['Endpoints'].push(endpoint);
        gruposelecionado['Endpoints'].push(endpoint2);
    };


    service.PutDisplayTimeOrderEndpoint = function (gruposelecionado, url, time, order, usersList) {
        var endpoint = {
            "environment": "homolog",
            "permissions": [
                {
                    "permission": "GET"
                },
                {
                    "permission": "PUT"
                },
                {
                    "permission": "DELETE"
                },
                {
                    "permission": "POST"
                }
            ],
            "order": order,
            "time": time,
            "displayUrl": url.displayUrl,
            "url": url.url,

        };
        var endpoint2 = {
            "environment": "prod",
            "permissions": [
                {
                    "permission": "GET"
                },
                {
                    "permission": "PUT"
                },
                {
                    "permission": "DELETE"
                },
                {
                    "permission": "POST"
                }
            ],
            "order": order,
            "time": time,
            "displayUrl": url.displayUrl,
            "url": url.url
        };
        gruposelecionado['Endpoints'].push(endpoint);
        gruposelecionado['Endpoints'].push(endpoint2);
    };

    service.RemoveEndpoint = function (gruposelecionado, url) {
        ///---Tira o elemento do JSON do Grupo
        var newArray = gruposelecionado['Endpoints'].filter(function (el) {
            return el.displayUrl !== url.displayUrl;
        });
        gruposelecionado['Endpoints'] = newArray;
    };

    ////////////// GROUP - USERS

    service.AddUserToJSON_AddedUsers = function (_gruposelecionado, _usersList) {
        var userGroup = _usersList.filter(function (el) {
            return el.groupId === _gruposelecionado.groupId;
        });
        if (_gruposelecionado['addedUsers'] == null) {
            _gruposelecionado['addedUsers'] = [];
        };
        angular.forEach(userGroup, function (user) {
            user.groupId = _gruposelecionado.groupId;
            _gruposelecionado['addedUsers'].push({ "userId": user.userId });
        });
    };

    service.AddUserToJSON_RemovedUsers = function (_gruposelecionado, _usersList, _grupoDefault) {
        var userGroup = _usersList.filter(function (el) {
            return el.groupId === _grupoDefault.groupId;
        });
        console.log(userGroup);
        if (_gruposelecionado['removedUsers'] == null) {
            _gruposelecionado['removedUsers'] = [];
        };
        angular.forEach(userGroup, function (user) {
            _gruposelecionado['removedUsers'].push({ "userId": user.userId });
        });
    };

    ////////////// DISPLAY - PROFILE

    service.AddDisplayToJSON_AddedDisplays = function (_selectedprofile, _displayList) {
        var displayProfile = _displayList.filter(function (el) {
            return el.profileId == _selectedprofile.profileId;
        });
        if ((_selectedprofile['addedDisplays'] === undefined) || (_selectedprofile['addedDisplays'] === null)) {
            _selectedprofile['addedDisplays'] = [];
        };
        angular.forEach(displayProfile, function (display) {
            display.profileId = _selectedprofile.profileId;
            _selectedprofile['addedDisplays'].push({ "displayId": display.displayId });
        });
    };


    service.AddDisplayToJSON_RemovedDisplays = function (_selectedprofile, _displayList, _defaultProfile) {
        var displayProfile = _displayList.filter(function (el) {
            return el.profileId == _defaultProfile.profileId;
        });
        console.log(displayProfile);
        if (_selectedprofile['removedDisplays'] == null) {
            _selectedprofile['removedDisplays'] = [];
        };
        angular.forEach(displayProfile, function (display) {
            _selectedprofile['removedDisplays'].push({ "displayId": display.displayId });
        });
    };

    ////////////// CHILDTHING - THING

    service.AddChildThingToJSON_childrenThings = function (_selectedThing, _thingList) {
        //console.log("Entrou no AddChildThingToJSON_childrenThings");
        if (_selectedThing.thingLvl - 2 >= 0) {
            var childrenThings = _thingList[_selectedThing.thingLvl - 2].filter(function (el) {
                return el.parentThingId === _selectedThing.thingId;
            });
            if (!_selectedThing['childrenThings']) {
                _selectedThing['childrenThings'] = [];
            };
            angular.forEach(childrenThings, function (childThing) {
                childThing.parentThingId = _selectedThing.thingId;
                _selectedThing['childrenThings'].push({ "thingBindId": childThing.thingId });
            });
        };
    };


    service.AddChildThingToJSON_removedChildrenThings = function (_selectedThing, _thingList) {
        //console.log("Entrou no AddChildThingToJSON_removedChildrenThings");
        if (_selectedThing.thingLvl - 2 >= 0) {
            var childrenThings = _thingList[_selectedThing.thingLvl - 2].filter(function (el) {
                return el.parentThingId === 0; //No parent
            });
            console.log(childrenThings);
            if (!_selectedThing['removedChildrenThings']) {
                _selectedThing['removedChildrenThings'] = [];
            };
            angular.forEach(childrenThings, function (childThing) {
                _selectedThing['removedChildrenThings'].push({ "thingBindId": childThing.thingId });
            });
        };
    };

    return service;
});