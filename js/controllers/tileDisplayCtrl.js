'use strict';
angular.module("cummins-supervisorio").controller("tileDisplayCtrl", function ($scope, $q, pendingRequests, TilePreview, portsAPI, $timeout, $interval, layoutNavigation, $location, messagesHandler, JsonHandler) {
    $scope.layouts = [];
    $scope.nextGridList = 0; // 0 is just for the start screen, no grid list is already loaded
    $scope.allowManualNavigation = false;
    $scope.plotGridList = true;
    $scope.nextGridList = 0; // 0 is just for the start screen, no grid list is already loaded
    $scope.header1 = true;
    $scope.tileLayoutShow;
    $scope.tempTileLayoutShow;
    $scope.tempTestCount = 0;
    $scope.showWelcomeMessage = false;
    $scope.marqueeTextClass;
    var play;
    var configuredDisplay = false;
    var secondCounter = 0;
    var layoutsToDisplay = [];
    var tileLayouts;
    var tileLayoutShow;
    var headerSave = {};
    var internalNavigation = false;
    var currentLayout = 0;
    var currentLayoutId = 0;
    var storedLastUpdate;
    var customTime;
    var retryGetLayoutCounter = 0;
    var requestConnectionRecovery = false;
    var connFailureCurrentScreen = false;
    var connFailureNextScreen = false;
    var next;
    var currentMessageList = [];
    var emptyMessageListCheckCounter = 0;
    var enableMessageUpdateCounter = 5; //First refresh screen must also refresh messages

    delete ($scope.tileLayoutShow); //Start by deleting old information

    var showNextGridList = function () {
        switch ($scope.nextGridList) {
            case (1):
                if (document.getElementById("mdGridList"))
                    document.getElementById("mdGridList").style.display = "none";
                applyTempHeader(angular.copy(headerSave)); //Because I want to retrieve HEADERS in the same moment that gridList is ploted                                         
                document.getElementById("mdGridList2").style.display = "inline";
                $scope.nextGridList = 2;
                break;
            default:
                if (document.getElementById("mdGridList2"))
                    document.getElementById("mdGridList2").style.display = "none";
                applyTempHeader(angular.copy(headerSave)); //Because I want to retrieve HEADERS in the same moment that gridList is ploted                                         
                document.getElementById("mdGridList").style.display = "inline";
                $scope.nextGridList = 1;
                break;
        }
        console.log('started refreshCurrentScreen timer');

        if (play)
            layoutNavigation.startInterval(tileLayoutShow.time); //If 'time' property is undefined, it will use the JSON standard time

        startIntervals(); //start updating the displayed screen
        startCheckIfSelectLayoutInterval();
        $scope.allowManualNavigation = true;
    };


    ///********************
    ///TIMERS AND INTERVALS 
    ///********************
    var updateCurrentScreenTimer = 5000; //inicialização de segurança 
    var enableCurrentScreenTimeout;
    var retryGetLayoutTimer = 4500; //inicialização de segurança 
    var retryGetLayoutLimit = 3; //inicialização de segurança 

    var refreshCurrentScreenInterval;
    var UpdateNavigationInterval;
    var checkIfSelectLayoutInterval

    portsAPI.getJsonTimers().success(function (data) {
        updateCurrentScreenTimer = data.updateCurrentScreenTimer;
        enableCurrentScreenTimeout = data.enableCurrentScreenTimeout;
        retryGetLayoutTimer = data.retryGetLayoutTimer;
        retryGetLayoutLimit = data.retryGetLayoutLimit;
    });


    var startUpdateCurrentScreenInterval = function (updateCurrentScreenTimer) {
        refreshCurrentScreenInterval = $interval(refreshCurrentScreen, updateCurrentScreenTimer);
    };

    var stopUpdateCurrentScreenInterval = function () {
        $interval.cancel(refreshCurrentScreenInterval);
    };

    var startUpdateNavigationInterval = function () {
        UpdateNavigationInterval = $interval(updateNavigation, 1000);
    };

    var stopUpdateNavigationScreenInterval = function () {
        $interval.cancel(UpdateNavigationInterval);
    };

    var stopIntervals = function () {
        stopUpdateCurrentScreenInterval();
    };

    var startIntervals = function () {
        startUpdateCurrentScreenInterval(updateCurrentScreenTimer);
    };



    var checkIfSelectLayout = function () { //Wait to check dropdown click ( Without this, dropdown always freezes)
        //console.log("entrou no interval checkIfSelectLayout");
        if (optionSelected) {
            console.log('Timer Elapsed - checkIfSelectLayout - option was selected');
            optionSelected = false;
            selectLayout();
        }
    };

    var startCheckIfSelectLayoutInterval = function () {
        checkIfSelectLayoutInterval = $interval(checkIfSelectLayout, 2000);
    };


    var stopCheckIfSelectLayoutInterval = function () {
        $interval.cancel(checkIfSelectLayoutInterval);
    };

    var cancelAllIntervals = function () {
        stopUpdateCurrentScreenInterval();
        stopCheckIfSelectLayoutInterval();
        stopUpdateNavigationScreenInterval();
        layoutNavigation.stopInterval();
    };



    //*********************************
    startUpdateNavigationInterval(); //This need to be called from the start of controller for Splash screen
    startCheckIfSelectLayoutInterval();
    ///***************************************************

    var getCurrentId = function () {
        switch ($scope.nextGridList - 1) { // -1 Because nextGridList is already set for next screen at this point,
            // BUT we are not changing screens, simply updating the current one.
            case (1):
                return $scope.tempTileLayoutShow.code;
                break;
            default: //0 ou 2
                return $scope.tileLayoutShow.code;
                break;
        }
    };

    var refreshCurrentScreen = function () {
        if (next == 0) { //To make sure I´m not switching between layouts
            //console.log("Timer Elapsed = refreshThisScreen");
            if ($scope.tileLayoutShow && $scope.allowManualNavigation) {
                var id = getCurrentId();
                portsAPI.getTileLayoutDisplay(id).success(function (data) {
                    if (data) {
                        //console.log("RefreshThisScreen - success");
                        var lastUpdate = $scope.tileLayoutShow.lastUpdate;
                        $scope.tempTestCount = $scope.tempTestCount + 1;
                        if (lastUpdate != data.lastUpdate) {
                            //console.log("lastUpdate foi atualizado, portanto a tela deve sofrer refresh")
                            switch ($scope.nextGridList - 1) { // -1 Because nextGridList is already set for next screen at this point,
                                //BUT we are not changing screens, simply updating the current one.
                                case (1):
                                    $scope.tempTileLayoutShow = data;
                                    break;
                                default: //0 ou 2
                                    $scope.tileLayoutShow = data;
                                    break;

                            }
                            $scope.tileLayoutShow.lastUpdate = data.lastUpdate;
                            storedLastUpdate = data;

                            if (requestConnectionRecovery)
                                connectionRecovery();

                            manageMessages(data.messages);
                        };
                    };
                }).error(function (data, status) {
                    console.log("refreshCurrentScreen - fail");
                    console.log("Erro de conexao ou 500 ao tentar buscar essa tela");
                    connFailureCurrentScreen = true;
                    connFailureNextScreen = false;
                    connectionLost();
                    if (connFailureCurrentScreen && !connFailureNextScreen) {
                        console.log('recursivity activated - refreshCurrentScreen')
                        refreshCurrentScreen();
                    }
                });
            };
        };
    };

    var getStageStatusPromise = function (_status, keyOfData, _thingId) {

        var deferred = $q.defer();

        portsAPI.getStageStatus(_status, _thingId).success(function (data) {
            var result = new Object();
            result['key'] = _status;
            if (keyOfData.length == 1) {
                result['value'] = data[keyOfData[0]];
            } else {
                var value = data;
                for (var i = 0; i < keyOfData.length; i++) {
                    value = value[keyOfData[i]];
                };
                result['value'] = value;
            }
            deferred.resolve(result);
        }).error(function () {
            deferred.reject("Fail");
        });
        return deferred.promise;
    };

    $scope.dashContent = 'producao/displayTilesShow.html';

    $scope.tileLayoutPreviewSize = function () {
        return {
            'width': '100vw',
            'height': '56.25vw', /* 100/56.25 = 1.778 */
            'max-height': '100vh',
            'max-width': '177.78vh' /* 16/9 = 1.778 */
        };
    };

    var currentIPAddress;
    var getUserIP = function () {
        portsAPI.getIP().success(function (ip) {
            configuredDisplay = true;
            console.log(ip)
            currentIPAddress = ip;
            console.log(currentIPAddress);
            getLayoutUrlsForThisDisplayIp(ip);
        })
        .error(function (err) {
            console.log(err);
            getLayoutsForNonConfiguredDisplayIp(); //If IP API is offline search for all layouts
        });
    }
    getUserIP();

    $scope.returnType = function (_var, _type) {
        if (typeof _var == _type) {
            return true;
        } else {
            return false;
        };
    }

    //---
    $scope.paginationRange;

    var _nOfPages = 0;
    var _curPage = -1;

    var arrayNavTimer = $interval(function () {
        if (!_nOfPages) return;

        if (_curPage + 1 >= _nOfPages) {
            _curPage = 0;
        } else {
            _curPage++;
        };

        console.log('curPage ' + _curPage);
    }, 5000);

    var pages = [];

    $scope.arraySolving = function (_rowQuantity, _array, _dynamicTable, row) {
        if (!_array) return;

        if (row)
            var color = row.backgroundColor;

        if (!_dynamicTable) {
            $scope.paginationRange = [1, _array.length];
            _array.length = _rowQuantity;
            return _array;
        };

        $scope.arrayLength = _array.length;

        if (_nOfPages === 0) {
            _nOfPages = Math.ceil(_array.length / _rowQuantity);
            pages = [];

            var pageInit = 1;
            var pageEnd;

            if (_array.length < _rowQuantity) {
                pageEnd = _array.length;
            } else {
                pageEnd = _rowQuantity;
            };


            pages.push({ 'init': pageInit, 'end': pageEnd });

            for (var i = 1; i < _nOfPages; i++) {
                pageInit = pages[i - 1].end + 1;

                if (i + 1 == _nOfPages) {
                    pageEnd = _array.length;
                } else {
                    pageEnd += _rowQuantity;
                };

                pages.push({ 'init': pageInit, 'end': pageEnd });
            };
        };


        $scope.paginationRange = [pages[_curPage].init, pages[_curPage].end];



        var returnArray = _array.slice(pages[_curPage].init - 1, pages[_curPage].init + _rowQuantity - 1);

        returnArray.length = _rowQuantity;

        console.log(returnArray);

        return returnArray;
    };
    ///--

    var enableLayoutsMenu = function (layoutsToDisplay) {
        $scope.allowManualNavigation = true;
        $scope.layoutsToDisplay = layoutsToDisplay;
    }


    var addItemToLayoutsToDisplay = function (item) {
        layoutsToDisplay.push(item);
    }

    var getLayoutUrlsForThisDisplayIp = function () {
        portsAPI.getTileLayoutAddresses(currentIPAddress).success(function (displays) {
            for (var i = 0; i < displays.Endpoints.length ; i++) {
                var url = displays.Endpoints[i].url.split("/api/cache/"); // Cut begining of URL for getting dashboardId
                var item = { 'code': url[1], 'name': displays.Endpoints[i].displayUrl, 'time': displays.Endpoints[i].time };

                console.log(item);

                if (JsonHandler.checkIfItemExistsInArray(layoutsToDisplay, 'code', item.code) == false) {
                    addItemToLayoutsToDisplay(item);
                }
            };

            if (layoutsToDisplay.length > 0) //This display has endpoints 
            {
                configuredDisplay = true;
                enableLayoutsMenu(layoutsToDisplay);
                layoutNavigation.play();
            }
            else
                getLayoutsForNonConfiguredDisplayIp();
        })
            .error(function (data, status) { // If 404 (This Display is not configured)
                getLayoutsForNonConfiguredDisplayIp();
                console.log(data);
            });
    };

    var getLayoutsForNonConfiguredDisplayIp = function () {
        portsAPI.getTileLayoutConfigOnlyEnabled().success(function (data) {
            layoutsToDisplay = data;
            //console.log("Basic Layouts: ");
            //console.log(layoutsToDisplay);
            $scope.showWelcomeMessage = true;
            enableLayoutsMenu(layoutsToDisplay);
        })
    };

    var manageMessages = function (_menssages, newScreen) {
        var cnn = document.getElementById("cnn");
        var newMessageList = [];
        var messageCNN = '';

        enableMessageUpdateCounter += 1;
        if (enableMessageUpdateCounter >= 5) { //Will only look for updates after 15 seconds from the last one
            if (_menssages && !newScreen) {
                console.log('Looking for new cnn messages...');
                enableMessageUpdateCounter = 0;
                var customDisplay = false;
                if (JsonHandler.checkIfItemExistsInArray(_menssages, 'ip', currentIPAddress)) {
                    customDisplay = true;
                };
                for (var i = 0; i < _menssages.length; i++) {
                    if (_menssages[i]) {
                        if (currentIPAddress == _menssages[i].ip) {
                            newMessageList = newMessageList.concat(_menssages[i].messageList);
                            break;
                        } else if (_menssages[i].ip == 'default' && !customDisplay) {
                            newMessageList = newMessageList.concat(_menssages[i].messageList);
                            break;
                        };
                    }
                };
                for (var j = 0; j < newMessageList.length; j++) {
                    messageCNN += ' &nbsp;&nbsp;&nbsp;&nbsp; ' + newMessageList[j]
                };
            }

            //if (newMessageList.length == 0)
            //    emptyMessageListCheckCounter++;
            //else
            //    emptyMessageListCheckCounter = 0;

            //console.log('counter: ' + emptyMessageListCheckCounter);
            //Check if messages have changed and demand an update
            if ((!JsonHandler.arraysEqual(newMessageList, currentMessageList))
                //&& (newMessageList.length != 0 || emptyMessageListCheckCounter > 6))
                || requestConnectionRecovery || newScreen) {
                console.log('New cnn messages were found!');
                console.log('messageCNN');
                console.log(messageCNN);
                cnn.stop();
                cnn.innerHTML = messageCNN;
                cnn.start();
                emptyMessageListCheckCounter = 0;
                console.log(currentMessageList);
                console.log(newMessageList);
                newScreen = false;

                currentMessageList = newMessageList; //Receives object reference
                enableCurrentScreenTimeout = 0;
            }
        }
    };



    ////
    var area = null;
    $scope.addArea = function (_area, _id, link) {
        area = _area;
        if (link == null || link == '') {
            $('.' + area).addClass('hover-area');
        } else {
            $('.' + area + ':not(#tile-selector-' + _id + ')').addClass('hover-area');
            $('.' + area + '#tile-selector-' + _id).addClass('hover-tile');
        }

    };
    $scope.removeArea = function () {
        $('.' + area).removeClass('hover-area');
        $('.' + area).removeClass('hover-tile');
        area = null;
    };
    ////

    var lastLayout;
    function updateNavigation() {
        var currentLayoutId;
        var currentLayout;

        next = layoutNavigation.getNavigation();
        play = layoutNavigation.getIfPresentationMode();

        if (next != 0) {
            console.log('Timer Elapsed - UpdateNavigation - Foi solicitada mudanca de tela');
            stopIntervals();
            console.log('Stopped refreshCurrentScreen timer')
            if (tileLayoutShow) {
                for (var i = 0; i < layoutsToDisplay.length; i++) {
                    if (layoutsToDisplay[i].code == tileLayoutShow.code) {
                        //Check if I´m in the lastLayout for next iteration
                        if (i + next == layoutsToDisplay.length)
                            lastLayout = true;

                        //If going to next in lastLayout
                        if (lastLayout && next == 1) { // Restart from the first Layout (When you´re at the last layout)                       
                            //console.log('Última tela ');
                            currentLayout = layoutsToDisplay[0];
                            lastLayout = false;
                        }
                            //If going to previous in firstLayout
                        else if (i + next == -1) {
                            currentLayout = layoutsToDisplay[layoutsToDisplay.length - 1];
                        }
                            //Regular navigation
                        else {
                            currentLayout = layoutsToDisplay[i + next];
                        }
                        break;
                    }
                    //We CANNOT program an 'ELSE' clause here, because 'IF' will fail in many iterations until it's true.
                }
            }
            else {
                //If going to previous from WelcomeScreen
                if (document.getElementById("welcomeScreen").style.display == "inline" && next == -1)
                    currentLayout = layoutsToDisplay[layoutsToDisplay.length - 1];
                    //If going next from WelcomeScreen
                else
                    currentLayout = layoutsToDisplay[0];
            };

            //console.log('Proxima tela a plotar: ');
            //console.log(currentLayout);

            if (currentLayout) {
                selectScreenOption(currentLayout);

            }
            layoutNavigation.resetNavigation(); //Navigation Property goes back to 0
        };
    };

    var firstLoadAll

    $scope.stageLoading = false;
    var getModalStatus = function (_link) {
        $scope.stageLoading = true;
        var result = new Object();
        $scope.currentStage = null;

        getStageStatusPromise('stageName', ['name'], _link, result);
        getStageStatusPromise('status', ['status'], _link, result);
        getStageStatusPromise('cycleTimeCurrent', ['average'], _link, result);
        getStageStatusPromise('cycleTimeHour', ['average'], _link, result);
        getStageStatusPromise('cycleTimeDay', ['average'], _link, result);
        getStageStatusPromise('cycleTimeWeek', ['average'], _link, result);
        getStageStatusPromise('cycleTimeMonth', ['average'], _link, result);
        getStageStatusPromise('totalHour', ['value'], _link, result);
        getStageStatusPromise('totalDay', ['value'], _link, result);
        getStageStatusPromise('totalWeek', ['value'], _link, result);
        getStageStatusPromise('totalMonth', ['value'], _link, result);
        getStageStatusPromise('motor', null, _link, result);
        getStageStatusPromise('esn', ['prodSerialNumber'], _link, result);
    };

    var getStageStatusPromise = function (_status, keyOfData, _thingId, result) {

        portsAPI.getStageStatus(_status, _thingId)
            .success(function (data) {
                if (_status === 'motor') {
                    console.log('Motor');
                    result.motor = new Object();
                    var motorProperties = [
                        'Family', 'LinesetDate', 'Status', 'IsHotBuild', 'WorkOrder', 'ShopOrder'
                    ]

                    if (data.product == null && data.productSerialNumber == null) {
                        for (var i = 0; i < motorProperties.length; i++) {
                            result.motor[motorProperties[i].toLowerCase()] = '-';
                        };
                        result.motor['parts'] = [];
                        result.motor['parts'].push('-');
                        return;
                    };

                    result.motor['productSerialNumber'] = data['productSerialNumber'];
                    portsAPI.getStageStatus('parts', result.motor.productSerialNumber).success(function (_data) {
                        result.motor['parts'] = [];
                        for (var i = 0; i < _data.length; i++) {
                            result.motor['parts'].push(_data[i])
                        };
                    });

                    for (var i = 0; i < motorProperties.length; i++) {
                        var motorProperty = data.product['productAttribute'].filter(function (obj) {
                            if (obj.key == motorProperties[i])
                                return obj.value;
                        });
                        result.motor[motorProperties[i].toLowerCase()] = motorProperty[0].value;
                    };
                } else {
                    if (data)
                        result[_status] = data[keyOfData[0]];
                    else
                        result[_status] = '-';
                };

                checkIfLast(result);
            }).error(function () {
                result[_status] = '-';
                checkIfLast(result);
            });
    };

    var checkIfLast = function (_result) {
        if (objSize(_result) >= 13) {
            $scope.stageLoading = false;
            $scope.currentStage = _result;
            console.log($scope.currentStage);
        }
    }
    $scope.showModal = false;

    $scope.closeModal = function (_currStage) {
        $scope.showModal = false;
    };

    function openInNewTab(url) {
        var win = window.open(url, '_blank');
        win.focus();
    };

    $scope.useTileLink = function (_tile) {
        var _link = _tile.detailsLink;
        var _area = _tile.area;
        tileLayoutShow = {};

        function change(obj) {
            internalNavigation = true; // This will make enableLayoutTimeout take longer
            selectScreenOption(obj);
        };

        if (_area && !_link) {
            tileLayoutShow.code = _area;
            change(tileLayoutShow);
        } else if (_tile.detailsLinkStyle == 'navigation') {
            console.log('navigation');
            tileLayoutShow.code = _link;
            change(tileLayoutShow);
        } else if (_tile.detailsLinkStyle == 'modal') {
            $scope.showModal = true;
            getModalStatus(_tile.detailsLink);
        } else if (_tile.detailsLinkStyle == 'link') {
            openInNewTab(_link);
        };
    };

    $scope.goTo = function (obj) {
        console.log('Wut')
        tileLayoutShow = {};
        tileLayoutShow.code = 'planta__geral';
        selectScreenOption(tileLayoutShow);
    };

    var layoutId = '';
    var currentId;

    $scope.selectedLayout;

    var optionSelected;

    var selectScreenOption = function (selectedLayout) {
        stopIntervals();
        pendingRequests.cancelAll();
        tileLayoutShow = angular.copy(selectedLayout);
        $scope.allowManualNavigation = false;
        optionSelected = true;
    };


    var selectLayout = function () {
        stopCheckIfSelectLayoutInterval();
        refreshNextScreen();
    };

    var refreshNextScreen = function () {
        console.log("(not a timer) refreshNextScreen ");

        var fireConnErrorRecurisvity = function () {
            connFailureCurrentScreen = false;
            connFailureNextScreen = true;
            connectionLost();
            if (!connFailureCurrentScreen && connFailureNextScreen) {
                console.log('recursivity activated - refreshCurrentScreen')
                refreshNextScreen();
            }
        };

        portsAPI.getTileLayoutDisplay(tileLayoutShow.code).success(function (data) {
            console.log('(not a timer) refreshNextScreen - Success!')
            //$("#erroModal").hide();
            retryGetLayoutCounter = 0;
            if (tileLayoutShow.time) //Save Configured Time (custom) if exists
                customTime = tileLayoutShow.time;
            tileLayoutShow = data;
            continueLayoutSelection();
        }).error(function (data, status) {
            //console.log("************************");
            //console.log("refreshNextScreen - fail");
            //console.log("************************");
            if (status = 404) {
                //console.log('Nao encontrou essa tela na API de cache, aguardando o tempo configurado...');
                $timeout(function () {
                    console.log('404 - Tentando buscar a tela novamente');
                    console.log('retry get layout limit: ' + retryGetLayoutLimit);
                    retryGetLayoutCounter++;
                    console.log(retryGetLayoutTimer);

                    if (retryGetLayoutCounter < retryGetLayoutLimit) {
                        refreshNextScreen();
                    }
                    else {
                        //console.log("Não encontrou a tela após " + retryGetLayoutLimit + " tentativas");
                        $("#erroModal").show();
                        $('#error-msg').text("Falha no carregamento da tela '" + tileLayoutShow.name + "'. A mesma nao se encontra disponivel no servidor");
                        $scope.allowManualNavigation = true;
                        fireConnErrorRecurisvity();
                        retryGetLayoutCounter = 0;
                    }
                }, retryGetLayoutTimer);
            }
            else { // In case it is about a connection error, then 
                fireConnErrorRecurisvity();
            }
        });
    };

    var connectionLost = function () {
        console.log("connectionLost");
        console.log("Erro de conexao ou 500");
        requestConnectionRecovery = true;
        cancelAllIntervals();
    };

    var connectionRecovery = function () {
        console.log("connectionRecovery");
        console.log("Recebeu 200, reiniciando timers...");
        requestConnectionRecovery = false;
        startCheckIfSelectLayoutInterval();
        startUpdateNavigationInterval();
        if (play)
            //layoutNavigation.startInterval();
            window.location.reload(false);
        else
            startUpdateCurrentScreenInterval(updateCurrentScreenTimer);
    };

    var continueLayoutSelection = function () {
        if (customTime)
            tileLayoutShow.time = customTime;

        document.getElementById("welcomeScreen").style.display = "none";
        switch ($scope.nextGridList) {
            case (1): // 2 -> 1
                $scope.tempTileLayoutShow = angular.copy(tileLayoutShow);
                headerSave.dashboardHeader = angular.copy(tileLayoutShow.dashboardHeader);
                $scope.plotGridList2 = true;
                break;
            default: // 1 -> 2 
                $scope.tileLayoutShow = tileLayoutShow;
                headerSave.dashboardHeader = angular.copy(tileLayoutShow.dashboardHeader);

                if ($scope.tempTileLayoutShow) {
                    applyTempHeader(angular.copy($scope.tempTileLayoutShow)); //Because I don´t want to loose the previous header 
                    //before screen transition isn´t completed
                }
                $scope.plotGridList = true;
                break;
        };

        presentLayout(tileLayoutShow.code, tileLayoutShow.messages);
    };

    var applyTempHeader = function (storedHeaderObject) {
        $scope.tileLayoutShow.dashboardHeader.backgroundColor = storedHeaderObject.dashboardHeader.backgroundColor;
        $scope.tileLayoutShow.dashboardHeader.fontSize = storedHeaderObject.dashboardHeader.fontSize;
        $scope.tileLayoutShow.dashboardHeader.fontColor = storedHeaderObject.dashboardHeader.fontColor;
        $scope.tileLayoutShow.dashboardHeader.headerDescription = storedHeaderObject.dashboardHeader.headerDescription;
    };

    var presentLayout = function (code, messages) {
        manageMessages(tileLayoutShow.messages, true);

        //console.log('Timeout enable current screen: ');
        //console.log(enableCurrentScreenTimeout);
        if (internalNavigation == false) {
            $timeout(function () {
                presentLayoutInternals(code, messages);
            }, enableCurrentScreenTimeout);
        } else {
            $timeout(function () {
                presentLayoutInternals(code, messages);
                internalNavigation = false;
            }, enableCurrentScreenTimeout * 2);
        }
    };

    var presentLayoutInternals = function (code, messages) {
        switch ($scope.nextGridList) {
            case (1):
                $scope.plotGridList = false;
                break;
            default: //0 ou 2
                $scope.plotGridList2 = false;
                if ($scope.tempTileLayoutShow)
                    delete ($scope.tempTileLayoutShow);
                break;
        }
        _nOfPages = 0;
        showNextGridList();
    };

    $scope.selectScreenOption = selectScreenOption;
    $scope.configuredDisplay = configuredDisplay;

    //Kill all intervals after leaving tileDisplay page
    $scope.$on("$locationChangeStart", function (event, next, current) {
        // handle route changes   
        cancelAllIntervals();
        window.location.reload(false);

    });
});

var data = [
    { "title": "Pudim", "link": "http:\/\/news.walla.co.il\/?w=\/\/2790612", "pubDate": "00:10" },
    { "title": "de Leite", "link": "http:\/\/news.walla.co.il\/?w=\/\/2790623", "pubDate": "00:15" }
];
