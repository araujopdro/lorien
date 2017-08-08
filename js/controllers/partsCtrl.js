'use strict';

angular.module("cummins-supervisorio").controller("partsCtrl", function ($scope, portsAPI, imageSrc, orderByManagement) {
    $scope.app = "Parts";
    $scope.partsList = [];
    var getParts = function () {
        $scope.dataLoading = true;
        portsAPI.getParts().success(function (data) {
            $scope.partsList = data;
            $scope.dataLoading = false;
        });
    };
    getParts();

    $scope.dateFilter = function (_part, _date) {
        var newDate = new Date(_date);
        var year = newDate.getFullYear();

        var pad = "00";
        var month = "" + (newDate.getMonth() + 1);//getMonth is zero based;
        var formattedMonth = pad.substring(0, pad.length - month.length) + month;
        var day = "" + newDate.getDate();
        var formattedDay = pad.substring(0, pad.length - day.length) + day;

        var formattedDate = year + "-" + formattedMonth + "-" + formattedDay + "T00:00:00";

        if (formattedDate == _part.dtavailable) {
            _part.dtavailable = null;
            _part.flagAvailable = 'false'
        }
        else {
            _part.dtavailable = formattedDate;
            _part.flagAvailable = 'true';
        }
        console.log(_part);
        putPart(_part);
    }

    var putPart = function (part) {
        portsAPI.putParts(part.id, part).success(function (data) {
            getParts();
        });
    };

    $scope.openPick = function () {
        toggle();
    };
    $scope.closePick = function () {
        hide();
    };

    $scope.selectPart = function (part) {
        $scope.selectedPart = part;
    };

    $scope.loadingSrc = imageSrc.LoadingSrc;

    $scope.orderBy = function (field, _id) {
        console.log('orderBy1');
        console.log(_id);
        console.log(field);
        orderByManagement.orderBy($scope, field, _id);
    };
})
.directive('lastItem', function () {
    return function (scope) {
        if (scope.$last) {
            ad(scope);
        }
    };
});

var toggle = function () {
    $("#datepicker").toggle();
};
var hide = function () {
    $("#datepicker").hide();
};
var ad = function (_$scope) {
    $.datepicker.setDefaults($.datepicker.regional['pt-BR']);

    $("#datepicker").datepicker({
        minDate: '20/07/2016',
        onSelect: function (dateText) {
            _$scope.$apply(function () {
                _$scope.selectedPart.statusAvailibility = 'available';
                _$scope.selectedPart.dateAvailiablePart = dateText;
                _$scope.putPart(_$scope.selectedPart);
            });
            toggle();
        }
    });
};