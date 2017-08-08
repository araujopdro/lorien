'use strict';
angular.module("cummins-supervisorio").controller("tileCtrl", function ($scope, portsAPI, $q, $mdDialog, $http, imageSrc, dialogHandler, TilePreview, $timeout, $interval, $window, orderByManagement, $sce) {

    //var getModalStatus = function () {
    //    var result = {}

    //    var _link = 159;

    //    var result = new Object();
    //    getStageStatusPromise('stageName', ['name'], _link, result);
    //    getStageStatusPromise('status', ['status'], _link, result);
    //    getStageStatusPromise('cycleTimeCurrent', ['average'], _link, result);
    //    getStageStatusPromise('cycleTimeHour', ['average'], _link, result);
    //    getStageStatusPromise('cycleTimeDay', ['average'], _link, result);
    //    getStageStatusPromise('cycleTimeWeek', ['average'], _link, result);
    //    getStageStatusPromise('cycleTimeMonth', ['average'], _link, result);
    //    getStageStatusPromise('totalHour', ['value'], _link, result);
    //    getStageStatusPromise('totalDay', ['value'], _link, result);
    //    getStageStatusPromise('totalWeek', ['value'], _link, result);
    //    getStageStatusPromise('totalMonth', ['value'], _link, result);
    //    getStageStatusPromise('motor', null, _link, result);
    //    getStageStatusPromise('esn', ['prodSerialNumber'], _link, result);
    //};

    //var getStageStatusPromise = function (_status, keyOfData, _thingId, result) {

    //    portsAPI.getStageStatus(_status, _thingId)
    //        .success(function (data) {
    //            if (_status === 'motor') {

    //                result['productSerialNumber'] = data.product['productSerialNumber'];

    //                portsAPI.getStageStatus('parts', '36540813').success(function (_data) {
    //                    result['parts'] = [];
    //                    for (var i = 0; i < _data.length; i++) {
    //                        result['parts'].push(_data[0])
    //                    };
    //                });


    //                var family = data.product['productAttribute'].filter(function (obj) {
    //                    if (obj.key == "Family")
    //                        return obj.value;
    //                });

    //                result['family'] = family[0].value;


    //                var dateLineSet = data.product['productAttribute'].filter(function (obj) {
    //                    if (obj.key == "LinesetDate")
    //                        return obj.value;
    //                });
    //                result['dateLineSet'] = dateLineSet[0].value;


    //                var statusMotor = data.product['productAttribute'].filter(function (obj) {
    //                    if (obj.key == "Status")
    //                        return obj.value;
    //                });
    //                result['statusMotor'] = statusMotor[0].value;


    //                var isHotBuild = data.product['productAttribute'].filter(function (obj) {
    //                    if (obj.key == "IsHotBuild")
    //                        return obj.value;
    //                });
    //                result['isHotBuild'] = isHotBuild[0].value;


    //                var wo = data.product['productAttribute'].filter(function (obj) {
    //                    if (obj.key == "WorkOrder")
    //                        return obj.value;
    //                });
    //                result['wo'] = wo[0].value;

    //                var so = data.product['productAttribute'].filter(function (obj) {
    //                    if (obj.key == "ShopOrder")
    //                        return obj.value;
    //                });
    //                result['so'] = so[0].value;

    //            } else {
    //                result[_status] = data[keyOfData[0]];
    //            };

    //            console.log('Get OK');
    //            checkIfLast(result);
    //        })

    //        .error(function () {
    //            console.log('Get Error');
    //            checkIfLast(result);
    //        });
    //};

    //getModalStatus();

    //var checkIfLast = function (_result) {
    //    console.log('is it?');
    //    if (objSize(_result) >= 13) {
    //        console.log('Fine, Everything Its Fine');
    //        $scope.currentStage = _result;
    //        console.log(_result);
    //    }
    //}

    //////////////////



    $interval(updateTime, 1000);

    function updateTime() {
        $scope.date = new Date();
    };

    //
    $scope.returnArray = function (num) {
        return new Array(num);
    };


    //---
    $scope.paginationRange;

    var _nOfPages = 0;
    var _curPage = 0;

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

    $scope.arraySolving = function (_rowQuantity, _array, _dynamicTable) {
        if (!_array) return;

        if (!_dynamicTable) {
            $scope.paginationRange = [1, _array.length];
            _array.length = _rowQuantity;
            return _array;
        };

        $scope.arrayLength = _array.length;

        if (_nOfPages === 0) {
            _nOfPages = Math.ceil(_array.length / _rowQuantity);

            //_array.length = _nOfPages * _rowQuantity;

            var pageInit = 1;
            var pageEnd = _rowQuantity;

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
            console.log(_nOfPages);
            console.log(pages);
        };


        $scope.paginationRange = [pages[_curPage].init, pages[_curPage].end];

        var returnArray = _array.slice(pages[_curPage].init - 1, pages[_curPage].init + _rowQuantity - 1);
        returnArray.length = _rowQuantity;
        return returnArray;
    };

    $scope.arrayLinha = [
        '1 123456',
        '2 123456',
        '3 123456',
        '4 123456',
        '5 123456',
        '6 123456',
        '7 123456',
        '8 ABCDEF',
        '9 123456',
        '10 123456',
        '11 123456',
        '12 123456',
        '13 123456',
        '14 123456',
        '15 123456',
        '16 123456',
        '17 654321',
        '18 123456',
        '19 123456',
        '20 ZXCACS',
        '21 123456'
    ]

    $scope.downloadJSON = function (_selected) {
        var jsobObj;
        portsAPI.getTileLayoutConfigById(_selected.dashboardConfigId).success(function (data) {
            console.log('Get Download')
            var blob = new Blob([data], { type: 'text/plain' }),
            url = $window.URL || $window.webkitURL;
            $scope.fileUrl = url.createObjectURL(blob);
        });
    };

    $scope.tileLayoutPreviewSize = function () {
        return {
            'width': '83.33vw',
            'height': '46.875vw', /* 100/56.25 = 1.778 */
            'max-height': '83.33vh',
            'max-width': '148.15vh' /* 16/9 = 1.778 */
        };
    };

    $scope.loadingSrc = imageSrc.LoadingSrc;

    $scope.tileConfig = {};




    var getAllLayouts = function () {
        console.log('getAllLayouts');
        $scope.layouts = [{ "hasAxis": false, "tileRatio": 0, "tileConfigId": 0, "systemEndpointId": 223, "dashboardConfigId": 267, "things": [], "tileselections": null, "dashboardHeader": null, "tiles": null, "numberOfColumns": '200', "gutter": null, "refreshRate": null, "disableDashboard": false, "disableShow": "true", "name": "Teste do code", "bindingApi": "8032/api/things", "bindingID": "220", "code": "teste_do_code" }
        ];

        portsAPI.getTileLayoutConfig().success(function (data) {
           $scope.layouts = data;
        });
    };

    $scope.layoutPreview;

    $scope.hasSelectedTile = false;

    //
    $scope.deleteLayout = function (_event, _selectedLayout) {
        var confirm = $mdDialog.confirm()
                .title('Deseja deletar esse Layout?')
                .targetEvent(_event)
                .ok('Sim')
                .cancel('Não');

        $mdDialog.show(confirm).then(function () {
            portsAPI.deleteTileLayoutConfig(_selectedLayout.dashboardConfigId).success(function () {
                getAllLayouts();
            });
        }, function () {
            console.log('Nada')
        });
    };

    $scope.gobacktoSelection = function (_event) {
        var confirm = $mdDialog.confirm()
                .title('Deseja voltar à Seleção de Layout sem salvar as mudanças?')
                .targetEvent(_event)
                .ok('Sim')
                .cancel('Não');

        $mdDialog.show(confirm).then(function () {
            $scope.navigationManager('selecionar_mosaico');
        }, function () {
            console.log('Nada')
        });
    };


    // 
    $scope.setTrue = function (_selectedTiles) {
        for (var i = 0; i < _selectedTiles.tiles.length; i++) {
            var _tile = _layout.tiles[_selectedTiles.tiles[i]];
            _tile.show = true;
        };
    };

    // 
    $scope.SetConfigValueToTile = function (_layout, _selectedTiles, _tileConfig, _key) {
        for (var i = 0; i < _selectedTiles.tiles.length; i++) {
            var _tile = _layout.tiles[_selectedTiles.tiles[i]];
            _tile[_key] = angular.copy(_tileConfig[_key]);
        };
    };

    // 
    $scope.RemoveConfigValueFromTile = function (_layout, _selectedTiles, _tileConfig, _key) {
        for (var i = 0; i < _selectedTiles.tiles.length; i++) {
            var _tile = _layout.tiles[_selectedTiles.tiles[i]];
            delete _tileConfig[_key];
            delete _tile[_key];
            console.log(_tile.border);
        };
    };

    //
    $scope.SetConfigValueToMultipleTiles = function (_layout, _selectedTiles, _tileConfig, _key, _id) {
        if (_id) {
            var _tile = _layout.tiles[_id];
            _tile[_key] = angular.copy(_tileConfig[_key]);
        } else {
            for (var i = 0; i < _selectedTiles.tiles.length; i++) {
                var _tile = _layout.tiles[_selectedTiles.tiles[i]];
                _tile[_key] = angular.copy(_tileConfig[_key]);
            };
        }
    };


    //
    $scope.SetHeaderValueToMultipleHeaders = function (_layout, _selectedTiles, _data) {
        console.log(_data);
        var _tile = _layout.tiles[_selectedTiles.tiles[0]];
        for (var i = 0; i < _tile.gridHeaders.length; i++) {
            var header = _tile.gridHeaders[i];
            header.textProperties = angular.copy(_data);
        };
    };

    $scope.dashContent = 'producao/displayTiles.html';

    $scope.selectedTiles = {
        "type": '',
        "tiles": []
    };

    $scope.mousePosX = -1;
    $scope.mousePosY = -1;

    //
    var selectArea = function (_layout, _selectedTiles) {
        console.log('selectArea');

        var _selectedArea = _layout.tiles.slice(_selectedTiles.tiles[0], _selectedTiles.tiles[_selectedTiles.tiles.length - 1]);

        var areaX1 = _layout.tiles[_selectedTiles.tiles[0]].x;
        var areaX2 = _layout.tiles[_selectedTiles.tiles[_selectedTiles.tiles.length - 1]].x;


        for (var i = 1; i < _selectedArea.length; i++) {
            var _tile = _selectedArea[i];
            var tileIndexOfTiles = _layout.tiles.indexOf(_tile);

            if (_tile.x >= areaX1 && _tile.x <= areaX2) {
                _selectedTiles.tiles.push(tileIndexOfTiles);
                toggleTileSelection(_tile.tileId);
            }
        };
    };

    //
    $scope.selectTileFocus = function (_layout, _id, _dataSourceCharateristics) {
        console.log('selectTileFocus ' + _id);


        var _tile = _layout.tiles[_id];
        console.log(_tile)

        addTileSelectionFocus(_tile.tileId);

        $scope.tileConfig[_dataSourceCharateristics] = _tile[_dataSourceCharateristics];
    };

    var gettingSelection = false;

    // Seleciona o tile dependendo dos atalhos segurados. ctrl, shift ou nada 
    $scope.selectTile = function (_layout, _selectedTiles, _tile, event) {
        

        if ($scope.pathB == 'producao/shared/navigation/manageTiles.html' || $scope.pathB == 'producao/shared/navigation/editTile.html') {
            console.log('selectTile');
        } else {
            return;
        };

        $scope.pathB = 'producao/shared/navigation/manageTiles.html';

        if (_selectedTiles.type === '') {
            _selectedTiles.type = _tile.tileType;
        };


        var tileIndexOfTiles = _layout.tiles.indexOf(_tile);

        if (event.ctrlKey || gettingSelection) {
            console.log('Ctrl Getting');

            toggleTileSelection(_tile.tileId);


            if (_selectedTiles.tiles.indexOf(tileIndexOfTiles) === -1) {
                _selectedTiles.tiles.push(tileIndexOfTiles);
            } else {
                _selectedTiles.tiles.splice(_selectedTiles.tiles.indexOf(tileIndexOfTiles), 1);
                if (_selectedTiles.tiles.length === 0) {
                    $scope.unselectAllTiles(_layout, _selectedTiles);
                }
            };
            return;
        };

        _selectedTiles.tiles = _selectedTiles.tiles.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });

        if (_selectedTiles.tiles.length > 0 && event.shiftKey) {

            if (_selectedTiles.tiles.indexOf(tileIndexOfTiles) === -1) {
                toggleTileSelection(_tile.tileId);
                _selectedTiles.tiles.push(tileIndexOfTiles);
            }
            if (_selectedTiles.tiles.length > 2) {
                _selectedTiles.tiles = [_selectedTiles.tiles[0], _selectedTiles.tiles[_selectedTiles.tiles.length - 1]];
                removeTileSelection();
            }

            selectArea(_layout, _selectedTiles);
            return;
        }

        removeTileSelection();
        if (_selectedTiles.tiles.indexOf(tileIndexOfTiles) === -1) {
            toggleTileSelection(_tile.tileId);
            _selectedTiles.tiles = [];
            _selectedTiles.tiles.push(tileIndexOfTiles);
        } else {
            $scope.tileConfig = {};
            _selectedTiles.tiles.splice(_selectedTiles.tiles.indexOf(tileIndexOfTiles), 1);
            if (_selectedTiles.tiles.length === 0) {
                $scope.unselectAllTiles(_layout, _selectedTiles);
            }
        };
    };

    //
    $scope.unselectAllTiles = function (_layout, _selectedTiles) {
        console.log('unselectAllTiles');

        removeTileSelection();
        $scope.selectedTiles = {
            "type": '',
            "tiles": []
        };
    };

    var mergedTileId;
    var mHeight;
    var mergeArea = 0;

    $scope.maxRatio = 1;
    $scope.mergeRatioX = 1;
    $scope.mergeRatioY = 1;

    //
    $scope.mergeSelectedTiles = function (_layout, _selectedTiles) {
        console.log('mergeSelectedTiles');

        var area = 0;

        var unique = _selectedTiles.tiles.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });

        unique.sort(sortNumber);

        var keeper = unique[0];
        area += _layout.tiles[keeper].tileHeight * _layout.tiles[keeper].tileWidth;
        unique.reverse();
        unique.pop();

        if (_layout.tiles[keeper].mergeComponents == null) {
            _layout.tiles[keeper].mergeComponents = [];
        }

        var width = _layout.tiles[keeper].tileWidth;
        var height = _layout.tiles[keeper].tileHeight;


        for (var i = 0; i < unique.length; i++) {
            area += _layout.tiles[unique[i]].tileHeight * _layout.tiles[unique[i]].tileWidth;
            var _tile = _layout.tiles[unique[i]];
            _tile.show = false;

            if (_tile.y === _layout.tiles[keeper].y) {
                width += _tile.tileWidth;
            }

            if (_tile.x === _layout.tiles[keeper].x) {
                height += _tile.tileHeight;
            }

            _layout.tiles[keeper].mergeComponents.push(unique[i]);
        };

        _layout.tiles[keeper].tileWidth = width;
        _layout.tiles[keeper].tileHeight = height;

        $scope.unselectAllTiles(_layout, _selectedTiles);
    };

    //
    $scope.mergeAcross = function (_layout, _selectedTiles) {
        console.log('mergeAcross');

        var unique = _selectedTiles.tiles.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });

        unique.sort(sortNumber);

        var keepers = [];
        var currentY = _layout.tiles[unique[0]].y;

        keepers.push(unique[0]);
        unique.splice(0, 1);

        for (var i = 0; i < unique.length; i++) {
            if (_layout.tiles[unique[i]].y != currentY) {
                currentY = _layout.tiles[unique[i]].y;
                keepers.push(unique[i]);
                unique.splice(unique.indexOf(unique[i]), 1);
            };
        };

        for (var j = 0; j < keepers.length; j++) {
            var keeper = keepers[j];

            if (_layout.tiles[keeper].mergeComponents == null) {
                _layout.tiles[keeper].mergeComponents = [];
            }

            var width = _layout.tiles[keeper].tileWidth;
            var height = _layout.tiles[keeper].tileHeight;


            for (var i = 0; i < unique.length; i++) {
                var _tile = _layout.tiles[unique[i]];
                _tile.show = false;
                if (_tile.y == _layout.tiles[keeper].y) {
                    width += _tile.tileWidth;
                    _layout.tiles[keeper].mergeComponents.push(unique[i]);
                };
            };

            _layout.tiles[keeper].tileWidth = width;
            _layout.tiles[keeper].tileHeight = height;
        };

        $scope.unselectAllTiles(_layout, _selectedTiles);
    };

    $scope.currentState = '';
    $scope.dataSourceCharateristics = 'Pudim';
    // switch case que administra a navegção entre os menus. chamando funções enquando troca entre telas e essas coisas
    $scope.navigationManager = function (_newState, _layout, _selectedTiles) {
        console.log('navigationManager');

        $scope.oldState = $scope.currentState;

        switch (_newState) {
            case "criar_mosaico":
                $scope.currentState = _newState;
                break;
            case "selecionar_mosaico":
                $scope.unselectLayout();
                $scope.currentState = _newState;
                break;
            case "editar_mosaico":
                $scope.unselectAllTiles(_layout, _selectedTiles);
                $scope.currentState = _newState;
                break;
            case "editar_cabeçalho":
                $scope.currentState = _newState;
                break;
            case "adicionar_tiles":
                $scope.currentState = _newState;
                break;
            case "editar_tiles":
                $scope.currentState = _newState;
                var _tile = _layout.tiles[_selectedTiles.tiles[0]];

                //if (_selectedTiles.tiles.length == 1) {
                //    $scope.tileConfig.tileType = _tile.tileType;
                //    $scope.tileConfig.tileContentType = _tile.tileContentType;
                //    $scope.tileConfig.detailsLink = _tile.detailsLink;
                //    $scope.tileConfig.rail = _tile.rail;
                //    $scope.tileConfig.fixedValueCommon = _tile.fixedValueCommon;
                //    $scope.tileConfig.fixedValueUnique = _tile.fixedValueUnique;
                //    $scope.tileConfig.fixedColor = _tile.fixedColor;
                //    $scope.tileConfig.rowQuantity = _tile.rowQuantity;
                //    $scope.tileConfig.colorSource = _tile.colorSource;
                //    $scope.tileConfig.dataSource = _tile.dataSource;
                //    $scope.tileConfig.emphasysSource = _tile.emphasysSource;
                //    $scope.tileConfig.gridHeaders = _tile.gridHeaders;
                //    $scope.tileConfig.gridRow = _tile.gridRow;
                //    $scope.tileConfig.rowColorSource = _tile.rowColorSource;
                //    $scope.tileConfig.textProperties = _tile.textProperties;
                //}
                console.log($scope.tileConfig);
                break;
            case "selecionar_tiles":
                console.log('select tiles');
                $scope.unselectAllTiles(_layout, _selectedTiles);
                $scope.currentState = _newState;
                $scope.tileConfig = {};
                $scope.commonQueries = [];
                $scope.uniqueId = '';
                arrayNavTimer = null;

                delete $scope.dataSourceCharateristics;

                break;
            case "editar_cabecalho":
                $scope.currentState = _newState;
                break;
            default:
                $scope.unselectLayout();
                $scope.currentState = '';
        };
    };
    //
    $scope.getXY = function (_x, _y) {
        $scope.mousePosX = _x;
        $scope.mousePosY = _y;
    };
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

    //
    $scope.unMergeTiles = function (_layout, _selectedTiles, _newTilePreview, unselect) {
        console.log('unMergeTiles');
        for (var i = 0; i < _selectedTiles.tiles.length; i++) {
            var _tile = _layout.tiles[_selectedTiles.tiles[i]];

            if (!_tile.mergeComponents)
                continue;

            _tile.tileWidth = _layout.tileRatio;
            _tile.tileHeight = _layout.tileRatio;

            for (var j = 0; j < _tile.mergeComponents.length; j++) {
                var comp = _layout.tiles[_tile.mergeComponents[j]];
                comp.tileWidth = _layout.tileRatio;
                comp.tileHeight = _layout.tileRatio;
                comp.show = true;
            }

            _tile.mergeComponents = [];
        };

        if (!unselect)
            $scope.unselectAllTiles(_layout, _selectedTiles);
    };

    //
    $scope.deleteSelectAllTiles = function (_layout, selectedTiles) {
        console.log('deleteSelectAllTiles');

        var unique = selectedTiles.tiles.filter(function (elem, index, self) {
            return index === self.indexOf(elem);
        });

        unique.sort(sortNumber);
        unique.reverse();

        for (var i = 0; i < unique.length; i++) {
            _layout.tiles.splice([unique[i]], 1);
        }
        ;
        $scope.selectedTiles = {
            "type": '',
            "tiles": []
        };

        createAxis(_layout);
    };

    //limpa as configurações dos tiles selecionados
    $scope.clearSelectAllTiles = function (_layout, _selectedTiles, _cleanTile) {
        console.log('clearSelectAllTiles');

        for (var i = 0; i < _selectedTiles.tiles.length; i++) {
            var _tile = _layout.tiles[_selectedTiles.tiles[i]];
            console.log(_tile);
            var _oltTile = angular.copy(_tile);

            //Gambs .. Arrumar depois

            _tile.y = _oltTile.y;
            _tile.x = _oltTile.x;
            _tile.tileWidth = _oltTile.tileWidth;
            _tile.tileHeight = _oltTile.tileHeight;
            _tile.mergeComponents = _oltTile.mergeComponents;
            _tile.tileId = _oltTile.tileId;
            _tile.tileType = '';
            _tile.detailsLink = "";
            _tile.rail = null;
            _tile.fixedValueCommon = null;
            _tile.fixedValueUnique = null;
            _tile.tileContentType = "";
            _tile.fixedColor = null;
            _tile.rowQuantity = null;
            _tile.colorSource = null;
            _tile.dataSource = null;
            _tile.emphasysSource = null;
            _tile.gridHeaders = null;
            _tile.gridRow = null;
            _tile.border = null;
            _tile.rowColorSource = null;
            _tile.mergeComponents = null;
            _tile.textProperties = null;

            console.log(_tile);


        };
        $scope.unselectAllTiles(_layout, _selectedTiles);
    };


    $scope.tileLayoutConfig = {};

    $scope.isConfiguring = false;
    $scope.isAddingTiles = false;
    $scope.isSelectingTiles = false;
    $scope.isEditingTiles = false;
    $scope.isMergingTiles = false;
    $scope.isEditingHeader = false;

    $scope.canSelectLayoutToEdit = false;
    $scope.notCreating = false;
    $scope.isEditingorCreating = false;

    //
    $scope.numberOfTiles = new Object();

    //determina que a altura e a largura do tile serão o mesmo valor, se a opção estiver habilitada no front
    $scope.squareTile = function (_newTilePreview) {
        console.log('squareTile');
        _newTilePreview.tileWidth = _newTilePreview.dimension;
        _newTilePreview.tileHeight = _newTilePreview.dimension;
    };

    //refaz o array de tiles a serem adicionados, mas não mexe na propriedade .tiles do mosaico
    $scope.changeNumberOfTiles = function (_layout, _newTilePreview, _nOfNewTiles) {
        console.log('changeNumberOfTiles');
        console.log(_newTilePreview)
        _layout.newtiles = new Array();
        
        for (var i = 0; i < _nOfNewTiles; i++) {
            _layout.newtiles.push(_newTilePreview);
        };
        console.log(_layout.newtiles);
    };

    //muda o número de cabeçalhos para as tabelas que ficam nos tiles
    $scope.changeNumberOfHeader = function (_layout, _selectedTiles, _nOfHeaders) {
        console.log('changeNumberOfHeader');

        var newGridHeaders = {
            "headerContent": "Header",
            "width": "",
            "textProperties": {
                "bold": "",
                "italic": "",
                "rotate": "",
                "fontSize": 10,
                "fontColor": ""
            },
            "backgroundColor": ""
        };

        var _tile = _layout.tiles[_selectedTiles.tiles[0]];

        _tile.gridHeaders = new Array();

        var _width = 100 / _nOfHeaders;

        for (var i = 0; i < _nOfHeaders; i++) {
            _tile.gridHeaders.push({
                "headerContent": "Header",
                "width": _width,
                "textProperties": {
                    "bold": "",
                    "italic": "",
                    "rotate": "",
                    "fontSize": 0,
                    "fontColor": ""
                },
                "backgroundColor": ""
            });
        }

    };

    //função chamada quando o mosaico vai usar outro como base
    $scope.useBaseTileLayout = function (_base) {
        console.log('useBaseTileLayout');

        portsAPI.getTileLayoutConfigById(_base.dashboardConfigId).success(function (data) {
            _base = data;
            $scope.tileLayoutConfig = _base;
        });
    };

    //
    $scope.addTile = function (_newTilePreview, _layout, _numberOfTiles) {
        console.log('addTile');

        var min = 100000000;
        var max = 999999999;
        if (!_layout.tiles) {
            _layout.tiles = new Array();
        }
        for (var i = 0; i < _numberOfTiles; i++) {
            _newTilePreview.tileId = Math.floor(Math.random() * (max - min + 1)) + min;
            _layout.tiles.push(angular.copy(_newTilePreview));
        };


        _newTilePreview.fixedColor = '#999';
        $scope.numberOfTiles.number = 1;

        _newTilePreview.tileId = Math.floor(Math.random() * (max - min + 1)) + min;
        _layout.newtiles = new Array();
        _layout.newtiles.push(_newTilePreview);

        createAxis(_layout);
    };


    $scope.newTile = {
        "tileId": 0,
        "show": true,
        "tileType": "tile",
        "tileContentType": "",
        "tileWidth": 1,
        "tileHeight": 1,
        "detailsLink": "",
        "dashboardHeader": {},
        "footer": {}
    };

    $scope.selectedLayout = {};

    //usa os ids do lazy para chamar apenas um Mosaico inteiro
    $scope.selectLayout = function (_selected) {
        if (!_selected.dashboardConfigId)
            return;

        portsAPI.getTileLayoutConfigById(_selected.dashboardConfigId).success(function (data) {
          _selected = data;
          $scope.tileLayoutConfig = _selected;
          verificarThingLvl(_selected.bindingID);
        });
        $scope.pathB = 'producao/shared/navigation/layoutBasic.html';

    };

    // cria o eixo X e Y do mosaico (muito complexa (nem tanto))
    var createAxis = function (_layout) {
        _layout.hasAxis = true;

        var xAxis = 0;
        var yAxis = 1;

        var widthGoal = _layout.numberOfColumns;
        var tileRatio = _layout.tileRatio;

        var curWidth = 0;

        var heightKeeper = [];
        var firstofTheLine = true;
        var interfRange = [];

        for (var i = 0; i < _layout.tiles.length; i++) {
            var _tile = _layout.tiles[i];

            if (_tile.show == null) {
                _tile.show = true;
            }

            //console.log('.');
            //console.log('Tile Loop');

            if (i !== 0) {
                var _previousTile = _layout.tiles[i - 1];
            };

            if (_previousTile == null || firstofTheLine) {
                curWidth += _tile.tileWidth;
            } else {
                curWidth += _previousTile.tileWidth;
            }

            xAxis = curWidth / 10;

            _tile.x = xAxis;
            _tile.y = yAxis;

            //console.log('End Loop ' + xAxis + ' / ' + yAxis);
            //console.log('.');

            if (curWidth >= widthGoal) {
                xAxis = 0;
                curWidth = 0;
                firstofTheLine = true;
                yAxis += 1;
            } else {
                firstofTheLine = false;
            }
        };
    };


    //
    $scope.saveTileLayout = function (_layout) {
        console.log('saveTileLayout');
        delete _layout.displayConfigId;
        var stringLayout = JSON.stringify(_layout);

        console.log(stringLayout);
        portsAPI.postTileLayoutConfig(stringLayout).success(function () {
            getAllLayouts();
        });
    };


    //
    $scope.updateTileLayout = function (_layout) {
        console.log('updateTileLayout');
        portsAPI.putTileLayoutConfig(_layout.dashboardConfigId, _layout).success(function () {
            getAllLayouts();
        });
    };

    //
    $scope.unselectLayout = function () {
        console.log('unselectLayout');
        $scope.tileLayoutConfig = {};
        $scope.selectedLayout = {};
        $scope.baseTileLayout = {};
    }

    // adiciona parametros para as querys do DataSource,ColorSource e EmphasysSource do tile
    $scope.addQueryParam = function (_tileConfig, _dataSourceCharateristics, _query) {
        console.log('addQueryParam');

        if (_tileConfig[_dataSourceCharateristics].queryParameters == undefined) {
            _tileConfig[_dataSourceCharateristics].queryParameters = [];
        }
        console.log(_tileConfig[_dataSourceCharateristics].queryParameters);

        console.log(_query);

        _tileConfig[_dataSourceCharateristics].queryParameters.push(angular.copy(_query));
        console.log(_tileConfig[_dataSourceCharateristics].queryParameters);

        _query.param = '';
        _query.value = '';
    };

    // remove o que a última adiciona
    $scope.removeQueryParam = function (_tileConfig, _dataSourceCharateristics, _query) {
        console.log('removeQueryParam');
        var _index;
        for (var i = 0; i < _tileConfig[_dataSourceCharateristics].queryParameters.length; i++) {
            if (_tileConfig[_dataSourceCharateristics].queryParameters[i].param == _query.param && _tileConfig[_dataSourceCharateristics].queryParameters[i].value == _query.value) {
                _index = i;
            }
        }

        _tileConfig[_dataSourceCharateristics].queryParameters.splice(_index, 1);
    };

    $scope.commonQueries = [];

    $scope.addCommonQuery = function (query) {
        $scope.commonQueries.push(angular.copy(query));
    };

    $scope.removeCommonQuery = function (query) {
        var _index = $scope.commonQueries.indexOf(query);

        $scope.commonQueries.splice(_index, 1);
    };

    getAllLayouts();

    $scope.testDSresult = 'null';
    $scope.testCSresult = 'null';
    $scope.testESresult = 'null';

    $scope.testDataSource = function (_config) {
        var ds = _config['dataSource'];
        var queryds = '';
        for (var i = 0; i < ds.queryParameters.length; i++) {
            queryds += ds.queryParameters[i].param + '=' + ds.queryParameters[i].value
            queryds += '&';
        };
        $http.get("http://servti:" + ds.url + "?" + queryds).success(function (data) {
            console.log(data);
            console.log(data[ds.path]);
            $scope.testDSresult = data[ds.path];
        });


        var cs = _config['colorSource'];
        var querycs = '';
        for (var i = 0; i < cs.queryParameters.length; i++) {
            querycs += cs.queryParameters[i].param + '=' + cs.queryParameters[i].value
            if (i < cs.queryParameters.length) {
                querycs += '&';
            }
        };
        $http.get("http://servti:" + cs.url + "?" + querycs).success(function (data) {
            console.log(data);
            console.log(data[cs.path]);
            $scope.testCSresult = data[cs.path];
        });


        var es = _config['emphasysSource'];
        var queryes = '';
        for (var i = 0; i < es.queryParameters.length; i++) {
            querycs += es.queryParameters[i].param + '=' + es.queryParameters[i].value
            if (i < es.queryParameters.length) {
                querycs += '&';
            }
        };
        $http.get("http://servti:" + es.url + "?" + querycs).success(function (data) {
            $scope.testESresult = data[es.path];
        });

    };


    $scope.saveSelection = function (_layout, _name, _selection) {
        var newSelection = {};
        newSelection.name = _name;
        newSelection.ids = _selection.tiles;

        if (!_layout.tileselections) {
            _layout.tileselections = [];
        }

        var hasObj = false;

        for (var i = 0; i < _layout.tileselections.length; i++) {
            if (_layout.tileselections[i].name === newSelection.name) {
                hasObj = true;
            };
        };

        if (!hasObj) {
            _layout.tileselections.push(newSelection);
        };

        console.log(_layout.tileselections);
    };

    $scope.loadSelection = function (_layout, _selectedTiles, _selection) {
        console.log(_selection);

        for (var i = 0; i < _selection.ids.length; i++) {
            gettingSelection = true;


            var _tile = _layout.tiles[_selection.ids[i]];
            var tileIndexOfTiles = _layout.tiles.indexOf(_tile);

            toggleTileSelection(_tile.tileId);
            _selectedTiles.tiles.push(tileIndexOfTiles);
        };
        gettingSelection = false;

        console.log(_selectedTiles);
    };

    var thingsList;
    var thingLvls;
    var getThings = function () {


        portsAPI.getThings().success(function (data) {
            thingsList = data;

            portsAPI.getThingLevels().success(function (_thingLvls) {
                //Pega a quantidade de levels que existem
                thingLvls = _thingLvls;
            });
        });

    }

    var idThingChildren = [];
    $scope.carregarThings = function () {
        var _idParent = $scope.tileLayoutConfig.bindingID;
        

        portsAPI.getThingsChildren(_idParent).success(function (_idThingChildren) {
            idThingChildren = _idThingChildren;
        });
    }
    getThings();

    var verificarThingLvl = function (_idBinding) {

        for (var i = 0; i < $scope.thingsList.length; i++) {

            if ($scope.thingsList[i].thingId == _idBinding) {
                $scope.tileLayoutConfig.thingLevel = $scope.thingsList[i].thingLvl;
                $scope.tileLayoutConfig.bindingID = parseInt($scope.tileLayoutConfig.bindingID);
            }
            console.log($scope.tileLayoutConfig.thingLevel);
        }
        console.log($scope.tileLayoutConfig.bindingID + ' bindingID');
        console.log(typeof ($scope.tileLayoutConfig.bindingID));
        console.log($scope.tileLayoutConfig);

    };

    ///////THE NEW NAVIGATION//////////////
    $scope.tileTypes = [
      { label: 'Valor', cType: 'fixedValue', type: 'tile' },
      { label: 'Trilho', cType: 'rail', type: 'tile' },
      { label: 'Data Source', cType: 'dataSource', type: 'tile' },
      { label: 'Tabela', cType: 'table', type: 'table' },
      { label: 'Paginação', cType: 'pagination', type: 'pagination' },
      { label: 'Imagem', cType: 'image', type: 'image' },
    ];

    $scope.select = true;

    $scope.cancel = function () {
        delete $scope.pathA;
        delete $scope.pathB;
        delete $scope.tileLayoutConfig;
    };

    $scope.clearNewTileArray = function (_tileLayoutConfig) {
        delete _tileLayoutConfig.newtiles;
    };

    $scope.unManageTiles = function () {
        $scope.pathB = 'producao/shared/navigation/layoutBasic.html';
    };

    $scope.manageTiles = function (_width) {
        if (!_width)
            return
        $scope.pathB = 'producao/shared/navigation/manageTiles.html';
    };

    $scope.getValue = function (_layout, _tiles, _type) {
        console.log(_layout.tiles[_tiles[0]])
        console.log(_layout.tiles[_tiles[0]].fixedValueCommon)
        if (_type = 'fixedValue') {
            $scope.fixedValueCommon = _layout.tiles[_tiles[0]].fixedValueCommon;
            $scope.fixedValueUnique = _layout.tiles[_tiles[0]].fixedValueUnique;
        } else if (_type = 'table') {

        }
    }

    $scope.editTiles = function (_tiles, _layout) {
        $scope.pathB = 'producao/shared/navigation/editTile.html';
        if (_tiles.length == 1) {
            for (var i = 0; i < $scope.tileTypes.length; i++) {
                if ($scope.tileTypes[i].cType == _layout.tiles[_tiles[0]].tileContentType) {
                    var result = $scope.tileTypes[i];
                };
            };
            $scope.type = result;
        };
    };

    $scope.editHeader = function (ev) {
        dialogHandler.setConfig($scope.tileLayoutConfig);

        $mdDialog.show({
            controller: HeaderController,
            templateUrl: 'producao/shared/navigation/dialogs/editheader_dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };

    var updateHeader = function (_header) {
        $scope.tileLayoutConfig.dashboardHeader = _header;
    };

    function HeaderController($scope, $mdDialog, dialogHandler) {
        var _layout = dialogHandler.getConfig();

        $scope.header = _layout.dashboardHeader;
        var oldHeader = angular.copy(_layout.dashboardHeader);

        $scope.applyHeaderStyle = function (_header) {
            updateHeader(_header);
        };

        $scope.cancel = function () {
            updateHeader(oldHeader);
            $mdDialog.hide();
        };

        $scope.ok = function (_header) {
            updateHeader(_header);
            $mdDialog.hide();
        };
    };

    ///Source
    $scope.openSource = function (ev, _source) {
        dialogHandler.setConfig($scope.tileLayoutConfig);
        var _selectedTiles = $scope.selectedTiles;
        var _tiles = $scope.tileLayoutConfig.tiles;
        var _selectedSource = _source;

        

        $mdDialog.show({
            controller: DataController,
            templateUrl: 'producao/shared/navigation/dialogs/source_dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });

        function DataController($scope, $mdDialog) {
            if (_selectedTiles.tiles.length == 1 && _tiles[_selectedTiles.tiles[0]][_selectedSource]) {
                console.log('length1 && has source')
                $scope.source = _tiles[_selectedTiles.tiles[0]][_selectedSource];
            }else {
                $scope.source = {};
            };

            if (_selectedTiles.tiles.length > 1) {
                console.log('length> && no source')
                for (var i = 0; i < _selectedTiles.tiles.length; i++) {
                    if (!_tiles[_selectedTiles.tiles[i]][_selectedSource]) {
                        console.log('sorceit')
                        _tiles[_selectedTiles.tiles[i]][_selectedSource] = {};
                        $scope.source = _tiles[_selectedTiles.tiles[0]][_selectedSource];
                    };
                };
            };

            $scope.source.name = _selectedSource;
            $scope.allTiles = _tiles;
            $scope.selectedTiles = _selectedTiles;
            $scope.idThingChildren = idThingChildren;

            var address = portsAPI.getAddress();

            $scope.arrayAPI = [
            '8051/api/Alerts',
            '8031/api/Goals',
            '8062/api/wipscount',
            '8062/api/wipsgrid',
            '8019/api/LastStates',
            '8062/api/wips',
            '8049/api/Production',
            '8049/api/ProductionAverage',
            '8019/api/StatesCount',
            '8048/api/ProdEvetsLast',
            '8016/api/partswip',
            '8016/api/PartsCount/QtyOfEnginesWithMissingParts',
            '8016/api/PartsCount/TotalQtyOfMissingParts'
            ];

            $scope.pathAPI = [
                'value',
                'color',
                'prodEmphasys',
                'Product[0].value',
                'Metrics[0].value',
                'productionValue',
                'predictionValue',
                'differenceValue'
            ]

            $scope.modalFocus = function (id) {
                caller(id);
                document.getElementById("source-dialog-md").style.opacity = 0.2;
                setTimeout(function () {
                    document.getElementById("source-dialog-md").style.opacity = 1;
                }, (2000));
            };


            $scope.addQuery = function (_query, _source, _id) {
                if (!_query || !_query.param || !_query.value)
                    return

                if (_id) {
                    console.log('id')

                    if (!_source['queryParameters']) {
                        _source['queryParameters'] = new Array();
                    };
                    _source['queryParameters'].push(_query);
                } else {
                    for (var i = 0; i < _selectedTiles.tiles.length; i++) {
                        if (!_tiles[_selectedTiles.tiles[i]][_selectedSource]['queryParameters']) {
                            _tiles[_selectedTiles.tiles[i]][_selectedSource]['queryParameters'] = new Array();
                        };
                        _tiles[_selectedTiles.tiles[i]][_selectedSource]['queryParameters'].push(angular.copy(_query));
                    };
                    console.log('no id')
                };

                delete $scope.query;
                delete $scope.uquery;
            };

            $scope.removeQuery = function (_query, _source, _id) {
                console.log(_source);
                console.log(_query);
                for (var i = 0; i < _source.queryParameters.length; i++) {
                    if (_source.queryParameters[i].param == _query.param && _source.queryParameters[i].value == _query.value) {
                        var index = i;
                    };
                };

                _source['queryParameters'].splice(index, 1);

                if (_id) {
                    setValueCaller([{ 'name': _source.name, 'value': _source }], [_id]);
                    _source['queryParameters'].splice(index, 0, _query);
                };
            };

            $scope.setTileValue = function (name, value, id) {
                if (id) {
                    var index = _selectedTiles.tiles.indexOf(Number(id));
                    var temp = angular.copy(_selectedTiles.tiles)
                    if (index > -1) {
                        temp.splice(index, 1);
                    };
                    setValueCaller([{ 'name': name, 'value': value }], temp);
                } else {
                    setValueCaller([{ 'name': name, 'value': value }], _selectedTiles.tiles);
                };
            };

            $scope.isTesting = false;
            $scope.testDS = function (_source) {
                if ($scope.isTesting)
                    return;

                var ds = _source;
                var queryds = '';

                if (_source.queryParameters) {
                    for (var i = 0; i < ds.queryParameters.length; i++) {
                        queryds += ds.queryParameters[i].param + '=' + ds.queryParameters[i].value
                        if (i + 1 != ds.queryParameters.length) {
                            queryds += '&';
                        }
                    };
                };

                $scope.isTesting = true;

                $http.get(address + ds.url + "?" + queryds).success(function (data) {
                    $scope.result = data[_source.path];
                    $scope.isTesting = false;
                }).error(function (data) {
                    $scope.result = 'Erro';
                    $scope.isTesting = false;
                });
            };

            $scope.cancel = function () {
                $mdDialog.hide();
            };

            $scope.ok = function (api, level, id) {
                $mdDialog.hide();
            };
        };
    };

    var caller = function (uniqueId) {
        $scope.selectTileFocus($scope.tileLayoutConfig, uniqueId);
    }

    $scope.isTesting = false;

    $scope.testDS = function (_config, _source) {
        if ($scope.isTesting)
            return;
        var ds = _config[_source];
        var queryds = '';
        if (ds && ds.queryParameters) {
            for (var i = 0; i < ds.queryParameters.length; i++) {
                queryds += ds.queryParameters[i].param + '=' + ds.queryParameters[i].value
                if (i + 1 != ds.queryParameters.length) {
                    queryds += '&';
                }
            };
        }
        $scope.isTesting = true;
        var address = portsAPI.getAddress();
        $http.get(address + ds.url + "?" + queryds).success(function (data) {

            document.getElementById("tester-" + _source).classList.remove('glyphicon-refresh');
            document.getElementById("tester-" + _source).classList.add('glyphicon-ok');

            setTimeout(function () {
                document.getElementById("tester-" + _source).classList.add('glyphicon-refresh');
                document.getElementById("tester-" + _source).classList.remove('glyphicon-ok');
            }, (5000));
            $scope.isTesting = false;
        }).error(function (data) {
            document.getElementById("tester-" + _source).classList.remove('glyphicon-refresh');
            document.getElementById("tester-" + _source).classList.add('glyphicon-remove');

            setTimeout(function () {
                document.getElementById("tester-" + _source).classList.add('glyphicon-refresh');
                document.getElementById("tester-" + _source).classList.remove('glyphicon-remove');
            }, (5000));
            $scope.isTesting = false;
        });
    };

    $scope.setHeaderValue = function (_id, value, _tiles) {
        $scope.tileLayoutConfig.tiles[_tiles.tiles[0]].gridHeaders[_id].headerContent = value;
    };

    ////////////////////////////////////////////////////////////////////////
    var setValueCaller = function (_parameter, _tiles, _differentLocation, _differentLocation_id) {
        console.log('Numero de Tiles ' + _tiles.length);
        $scope.setTilesValue($scope.tileLayoutConfig, _parameter, _tiles, _differentLocation, _differentLocation_id);
    }
    ////
    $scope.setTilesValue = function (_layout, _parameter, _tiles, _differentLocation, _differentLocation_id) {
        for (var i = 0; i < _tiles.length; i++) {
            for (var j = 0; j < _parameter.length; j++) {
                if (_differentLocation) {
                    if (!_layout.tiles[_tiles[i]][_differentLocation]) {
                        _layout.tiles[_tiles[i]][_differentLocation] = {};
                    };

                    if (_differentLocation_id) {
                        _layout.tiles[_tiles[i]][_differentLocation][_differentLocation_id][_parameter[j].name] = angular.copy(_parameter[j].value);
                    } else {
                        _layout.tiles[_tiles[i]][_differentLocation][_parameter[j].name] = angular.copy(_parameter[j].value);
                    }
                } else {
                    _layout.tiles[_tiles[i]][_parameter[j].name] = angular.copy(_parameter[j].value);
                };
                console.log(_layout.tiles[_tiles[i]])
            };
        };
    };
    ////
    $scope.openDialog = function (ev, _html, differentLocation, differentLocation_id) {
        var _selected = $scope.selectedTiles.tiles;
        var _tiles = $scope.tileLayoutConfig.tiles;
        var _diff = differentLocation;
        var _diff_id = differentLocation_id;

        $mdDialog.show({
            controller: Controller,
            templateUrl: _html,
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });

        function Controller($scope, $mdDialog) {
            $scope.setTileValue = function (name, value) {
                setValueCaller([{ 'name': name, 'value': value }], _selected, _diff, differentLocation_id);
            };

            $scope.cancel = function () {
                setValueCaller();
                $mdDialog.hide();
            };

            $scope.ok = function () {
                $mdDialog.hide();
            };
        };
    };
    ////////////////////////////////////////////////////////////////////////


    ///Bind

    $scope.bindAPI = function (ev) {
        dialogHandler.setConfig($scope.tileLayoutConfig);

        $mdDialog.show({
            controller: BindController,
            templateUrl: 'producao/shared/navigation/dialogs/bindapi_dialog.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        });
    };

    var curAPI, curLevel, curID;

    var bindAll = function (api, level, id) {
        $scope.tileLayoutConfig.bindingApi = api;
        $scope.tileLayoutConfig.thingLevel = level;
        $scope.tileLayoutConfig.bindingID = id;

        curAPI = api;
        curLevel = level;
        curID = id;
    };

    function BindController($scope, $mdDialog) {
        $scope.thingLvls = thingLvls;
        $scope.thingsList = thingsList;

        $scope.api = curAPI;
        $scope.level = curLevel;
        $scope.id = curID;

        $scope.cancel = function () {
            $mdDialog.hide();
        };

        $scope.ok = function (api, level, id) {
            $mdDialog.hide();
            bindAll(api, level, id);
        };
    };
});

//// funções de JS que não podem ser tocadas, porque eu não sei se alguém usa elas, porque elas são universais dentro desse universo

function slideTab(_id) {
    console.log('slide');
    $('.sidebar-' + _id + '-tab').slideToggle('fast');
};

$("#save").click(function (event) {
    this.href = 'data:plain/text,' + JSON.stringify(canvas1)
});

var toggleJ = function (vid, vclass) {
    var _class = "." + vclass + ":not(#" + vid + ")";
    $(_class).slideUp();
    $('#' + vid).slideToggle();
};

var toggleOrderIcon = function (_id, bool) {
    var _class = '.list-header:not(#' + _id + ')';
    if (bool) {
        $('#' + _id).find('.glyphicon').removeClass('glyphicon-triangle-bottom glyphicon-triangle-top');
        $('#' + _id).find('.glyphicon').addClass('glyphicon-triangle-top');
    } else {
        $('#' + _id).find('.glyphicon').removeClass('glyphicon-triangle-bottom glyphicon-triangle-top');
        $('#' + _id).find('.glyphicon').addClass('glyphicon-triangle-bottom');
    }
    $(_class).find('.glyphicon').removeClass('glyphicon-triangle-bottom glyphicon-triangle-top');
};

var sort = function () {
    console.log('sort');
    $("#sortable").sortable();
};

var cloneObj = function (obj, objTo) {
    for (var key in obj) {
        if (typeof obj[key] === 'object') {
            cloneObj(obj[key], objTo[key]);
        } else {
            if (objTo === null) {
                console.log('nada');
            } else {
                obj[key] = objTo[key];
            }
        }
    }
};

function setSelectValue(_id, _value) {
    var element = document.getElementById(_id);
    element.value = _value;
}

function testeJquery() {
    $(function () {
        $("#sortable").sortable();
        $("#sortable").disableSelection();
    });
}

var addTileSelection = function (_id) {
    $('#tile-selector-' + _id).addClass('selected-tile-focus');
};
var addTileSelectionFocus = function (_id) {
    $('.tile-selector').removeClass('selected-tile-focus-ultra-focus');
    $('#tile-selector-' + _id).addClass('selected-tile-focus-ultra-focus');
};
var toggleTileSelection = function (_id) {
    $('#tile-selector-' + _id).toggleClass('selected-tile-focus');
};
var removeTileSelection = function () {
    $('.tile-selector').removeClass('selected-tile-focus');
    $('.tile-selector').removeClass('selected-tile-focus-ultra-focus');
};

var toggleIconOff = function (_id) {
    $('#tile-selector-' + _id).addClass('glyphicon-unchecked');
    $('#tile-selector-' + _id).removeClass('glyphicon-check');
};

function sortNumber(a, b) {
    return a - b;
}

function convertHex(hex, opacity) {
    hex = hex.replace('#', '');
    r = parseInt(hex.substring(0, 2), 16);
    g = parseInt(hex.substring(2, 4), 16);
    b = parseInt(hex.substring(4, 6), 16);

    result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity / 100 + ')';
    return result;
}

function add(a, b) {
    return a + b;
}

var objSize = function (obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};