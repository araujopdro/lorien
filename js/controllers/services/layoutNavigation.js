'use strict';
angular.module("cummins-supervisorio").factory('layoutNavigation', function ($interval, portsAPI) {
    var service = {};

    var navigationPosition = 0;
    var moveNavigationTimer;
    var presentationMode;
    var layouts;
    var timer = null;

    function moveForward() {
        //console.log('Timer Elapsed - LayoutNavigation.moveForward');
        stopInterval();
        navigationPosition = 1;
    };

    var startInterval = function (customTimer) {
        stopInterval();
        if (customTimer) {
            timer = $interval(moveForward, customTimer * 1000);
            console.log('Start customTimer, timer = ' + customTimer * 1000);
        }
        else {
            timer = $interval(moveForward, moveNavigationTimer);
            console.log('Start navigationInterval, timer = ' + moveNavigationTimer);
        }
    }

    var resetNavigation = function () {
        navigationPosition = 0;
    };

    var stopInterval = function () {
        //console.log('Stop navigationInterval');
        $interval.cancel(timer);
    }

    service.moveForward = function () {
        //console.log('moveForward');
        navigationPosition = 1;
        pause();
    };

    service.moveBackward = function () {
        //console.log('moveBackward');
        navigationPosition = -1;
        pause();
    };

    var pause = function () {
        //console.log('Pause');
        presentationMode = false;
        stopInterval();
    };

    service.play = function () {
        $interval.cancel(timer); //For Safety. In case there is already one running, kill it before start another
        portsAPI.getJsonTimers().success(function (data) {
            //moveNavigationTimer = data.moveNavigationTimer;
            //console.log('Play');
            //console.log('moveNavigationTimer - ' + data.moveNavigationTimer);
            moveNavigationTimer = data.moveNavigationTimer;
        });
        presentationMode = true;
        startInterval();
    };

    service.getNavigation = function () {
        return navigationPosition;
    };

    service.getIfPresentationMode = function () {
        return presentationMode;
    };


    service.pause = pause;
    service.resetNavigation = resetNavigation;
    service.stopInterval = stopInterval;
    service.startInterval = startInterval;

    return service;
});