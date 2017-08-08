'use strict';

angular.module("cummins-supervisorio").factory('collapseManager', function () {
    var service = {};

    service.ToggleDetail = function (_id, _class){
        toggleJ(_id, _class);       
    };
    return service;
});

var toggleJ = function(vid, vclass){
    var _class = "."+vclass+":not(#"+vid+")";
    $(_class).slideUp();
    $('#'+vid).slideToggle();
};