'use strict';
angular.module("cummins-supervisorio").controller("dashboardCtrl", function ($scope, layoutNavigation, $interval, $location, messagesHandler) {

    $scope.$dashboardContentIndex = 0;

    $scope.currentLocation = $location.path();
    $scope.pause = true;
    var updateNavigationTimer;

    $interval(updateTime, 5000);
    function updateTime() {
        $scope.date = new Date();
        //$scope.testeMessage = messagesHandler.getMessages();
    };

    function startUpdateNavigationTimer() {
        updateNavigationTimer = $interval(updateNavigation, 1000);
    };

    function cancelNavigationTimer() {
        $interval.cancel(updateNavigationTimer);
    };

    function updateNavigation() {
        //Check if 'PLAY' was enabled from the service, so the ICON can be updated
        //if (layoutNavigation.getIfPresentationMode()) {
            cancelNavigationTimer();
            var pause = !layoutNavigation.getIfPresentationMode();
            $scope.pause = pause;
            startUpdateNavigationTimer();
        //}
    };

    var navigation = function (n, pause) {
        if (n == 0 && pause) {
            layoutNavigation.pause();
        } else if (n == 0 && !pause) {
            layoutNavigation.play();
        } else if (n > 0) {
            layoutNavigation.moveForward();
            pause = true;
        } else if (n < 0) {
            layoutNavigation.moveBackward();
            pause = true;
        }
        $scope.pause = pause;
    };

    startUpdateNavigationTimer();
    $scope.navigation = navigation;
});