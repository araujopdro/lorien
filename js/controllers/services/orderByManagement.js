'use strict';

angular.module("cummins-supervisorio").factory('orderByManagement', function () {
    var service = {};

    service.orderBy = function ($scope, field, _id) {
        $scope.orderCrit = field;
        $scope.orderDir = !$scope.orderDir;
        toggleOrderIcon(_id, $scope.orderDir);
    };


    service.orderBySpecificDir1 = function (_scope,  field, _id) {
        _scope.orderCrit1 = field;
        _scope.orderDir1 = !_scope.orderDir1;
        toggleOrderIcon(_id, _scope.orderDir1);
    };

    
    service.orderBySpecificDir2 = function (_scope, field, _id) {
        _scope.orderCrit2 = field;
        _scope.orderDir2 = !_scope.orderDir2;
        toggleOrderIcon(_id, _scope.orderDir2);
    };

    return service;
});

var toggleJ = function(vid, vclass){
    var _class = "."+vclass+":not(#"+vid+")";
    $(_class).slideUp();
    $('#'+vid).slideToggle();
};

/**
 * Toggles (up and down) the OrderBy Icon on the Headers
 * @param {string} _id
 * @param {boolean} bool
 * @returns {undefined}
 */
var toggleOrderIcon = function (_id, bool){
    var _class = '.list-header:not(#'+_id+')';
    if(bool){
        $('#'+_id).find('.glyphicon').removeClass('glyphicon-triangle-bottom glyphicon-triangle-top');
        $('#'+_id).find('.glyphicon').addClass('glyphicon-triangle-top');
    }else{
        $('#'+_id).find('.glyphicon').removeClass('glyphicon-triangle-bottom glyphicon-triangle-top');
        $('#'+_id).find('.glyphicon').addClass('glyphicon-triangle-bottom');
    }
    $(_class).find('.glyphicon').removeClass('glyphicon-triangle-bottom glyphicon-triangle-top');
};