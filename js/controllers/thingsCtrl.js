'use strict';

angular.module("cummins-supervisorio").controller("thingsCtrl", function ($scope, $mdDialog, ThingManagement, KinshipManager, portsAPI, EndpointManagement, $timeout, collapseManager, imageSrc, orderByManagement) {
    $scope.app = "Things";
    $scope.thingLvls = [];
    $scope.thingTypes = [];
    $scope.typeSelected = {};
    $scope.thingsCharacteristics = [];
    $scope.thingsList = [];
    $scope.lvlSelected = {};
    $scope.newThing = {};
    $scope.selectedThing = {};

    var level;
    var checklevel = function (thing) {
        return thing.thingLvl === level;
    };

    var type;
    var checktype = function (thing) {
        return thing.thingtype === type;
    };

    var SetDefault = function () {
        $scope.lvlSelected = $scope.thingLvls[0];
    };


    var getThings = function () {
        console.log("TestFoi");
        $scope.dataLoading = true;
        portsAPI.getThingLevels().success(function (_thingLvls) {
            //Pega a quantidade de levels que existem
            $scope.thingLvls = _thingLvls;
            var nOfthingLvls = $scope.thingLvls.length;

            //Pega os thing types que existem 
            //**** Inserido por Thais L. Dias em 19/09/16 *****//
            portsAPI.getThingTypes().success(function (_thingTypes) {
                $scope.thingTypes = _thingTypes;

                portsAPI.getThings().success(function (data) {
                   portsAPI.getCharacteristics().success(function (_data) {
                        $scope.thingsCharacteristics = _data;
                    });
                    // Cria um novo array que tem Length igual ao número de levels
                    $scope.thingsList = new Array(nOfthingLvls);

                    for (var i = 0; i < nOfthingLvls; i++) {
                        level = i + 1; //é sempre 1 acima do index da lista
                        $scope.thingsList[i] = data.filter(checklevel);
                    };
                    $scope.dataLoading = false;
                    SetDefault();
                    for (var j = 0; j < data.length; j++) {
                        getParentName(data[j]);
                    };
                }).error(function (data) {
                    $scope.message = "Erro: " + data;
                    $scope.dataLoading = false;
                });
            });
        });
        $scope.lvlSelected = $scope.thingLvls[0];
    };



    //Updates existing things
    $scope.updateThing = function (selectedThing) {
        console.log("Entrou no updateThings");

        selectedThing.childrenThings = []; //Erase all children things before adding them back to avoid duplicates
        EndpointManagement.AddChildThingToJSON_childrenThings(selectedThing, $scope.thingsList);
        EndpointManagement.AddChildThingToJSON_removedChildrenThings(selectedThing, $scope.thingsList);



        portsAPI.putThings(selectedThing.thingId, selectedThing).success(function (data) {
            //delete $scope.gruposelecionado;
            getThings();
        });
    };

    //Creates a new thing
    $scope.createThing = function (thing, level) {
        thing.parentThingId = 0; //TODO: Mudar para o valor de parent selecionado no textbox
        thing.status = "active";
        thing.thingLvl = level.thingLvl;
        thing.thingLvlDescription = level.thingLvlDescription;
        if (type)
            thing.thingtype = type.thingtype;

        //Não tem child na criação! //EndpointManagement.AddChildThingToJSON_childrenThings(thing, $scope.displayList);

        portsAPI.postThings(thing).success(function () {
            getThings();
            delete ($scope.newThing);
        });
        hideModal();
    };


    $scope.deleteCon = function (_event, _thing) {
     
    };

    //Delete a thing from thing list
    var deleteThing = function (selectedThing) {
        portsAPI.deleteThings(selectedThing.thingId).success(function () {
            //delete $scope.gruposelecionado;
            getThings();
        });
    };

    $scope.deleteThing = deleteThing;

    $scope.childrenNames = function () {
        var childrenNames;
        return childrenNames = $scope.thingsList[$scope.lvlSelected.thingLvl - 2];
    };

    var getParentName = function (thing) {
        console.log(thing);
        var parent = $scope.thingsList[$scope.lvlSelected.thingLvl];
        console.log(parent);
        if (parent) {
            parent = parent.filter(function (el) {
                console.log(el.thingId);
                console.log(el.thingId);
                return el.thingId === thing.parentThingId;
            });
            if (parent[0]) {
                thing.parentName = parent[0].name;
            } else {
                thing.parentName = 'SenPai';
            }
        }
        else { // Quando o PARENT não foi encontrado na lista, provavelmente por ter sido deletado.
            thing.parentThingId = 0;
            thing.parentName = 'SenPai';
        }
    };

    $scope.selectThing = function (thing) {
        $scope.selectedThing = thing;
    };

    getThings();

    $scope.closeModal = function (_id) {
        hideModal(_id);
    };

    $scope.openModal = function (_id, _msg) {
        showModal(_id, _msg);
        $scope.dialogMsg = _msg;
    };


    /**
     * Close the confirmation dialog and do stuff based on the booleans
     * @param {string} _id
     * @param {boolean} _clearFields
     * @param {boolean} _closeTab
     * @param {string} _tabToClose
     * @param {boolean} _classTab
     * @returns {undefined}
     */
    $scope.closeDialog = function (_id, _clearFields, _closeTab, _tabToClose, _classTab) {
        hideModal(_id);
        if (_clearFields) {
            clearFields();
        }
        if (_closeTab) {
            collapseManager(_tabToClose, _classTab); // CollapseManager is a external API
        }
    };

    $scope.addcharacteristic = function (ctc, selectedThing) {
        //var ctc = {};
        //ctc.key = _key;
        //ctc.value = _value;
        //_value = '';
        //_key = '';
        console.log(ctc);
        console.log(ctc.key);
        console.log(ctc.value);
        clearCharFields();
        //$scope.thingsCharacteristics.splice(ctc);
        ThingManagement.NewCharacteristicField(selectedThing, ctc);
    };
    $scope.deletecharacteristic = function (selectedThing, characteristic) {
        ThingManagement.DeleteCharacteristic(selectedThing, characteristic);
    };

    $scope.addChild = function (parentThing, childThing) {
        KinshipManager.AddChild(parentThing, childThing);
    };
    $scope.deleteChild = function (parentThing, childThing) {
        KinshipManager.deleteChild(parentThing, childThing);
    };

    $scope.childFilterParentLess = function (child) {
        return child.parentThingId === 0;
    };

    var checkIfThingAlreadyHasCharacteristic = function (char, currentThing) {
        var showCharInCombo = true;
        for (var i = 0; i < currentThing.Characteristics.length; i++) { //Caracteristicas já adicionadas nessa entidade                   
            var addedChar = currentThing.Characteristics[i];
            if (char.key == addedChar.key)
                showCharInCombo = false;
        }
        return showCharInCombo;
    }

    $scope.characteristicsNotAddedFilter_SelectedThing = function (char) {
        var showCharInCombo = true;
        var currentThing;

        if ($scope.selectedThing || $scope.selectedThing != {}) { //Entidades existentes
            currentThing = $scope.selectedThing;

            if (currentThing || currentThing != {}) {
                if (currentThing.Characteristics) {
                    if (checkIfThingAlreadyHasCharacteristic(char, currentThing) && char.thingLevelId == currentThing.thingLvl)
                        return char;
                }
            }
        }
    };


    $scope.characteristicsNotAddedFilter_NewThing = function (char) {
        var showCharInCombo = true;
        var currentThing;
        var currentLvl;

        if ($scope.newThing || $scope.newThing == {}) { //Nova entidade
            currentThing = $scope.newThing;
            currentLvl = $scope.newlevel;

            if (currentThing && currentLvl) {
                if (!currentThing.Characteristics)
                    currentThing.Characteristics = [];

                //for (var i = 0; i < currentThing.Characteristics.length; i++) { //Caracteristicas já adicionadas nessa entidade                   
                //    var addedChar = currentThing.Characteristics[i];
                //    if (char.key == addedChar.key)
                //        showCharInCombo = false
                //}

                if (checkIfThingAlreadyHasCharacteristic(char, currentThing) && char.thingLevelId == currentLvl.thingLvl)
                    return char;
            }
        }
    };




    $scope.childFilterParented = function (child) {
        return child.parentThingId === $scope.selectedThing.thingId;
    };

    $scope.goToParent = function (child) {
        $scope.lvlSelected = $scope.thingLvls[child.thingLvl];

        var result = jQuery.grep($scope.thingsList[child.thingLvl], function (e) { return e.thingId == child.parentThingId; });
        $timeout(function () {
            $scope.selectedThing = result[0];
            console.log($scope.selectedThing);
            console.log(result);
        }, 500);

        $timeout(function () {
            jQuery('#thing-' + child.parentThingId).find(".details").slideToggle();
            toggleIcon(child.parentThingId);
        }, 700);
    };

    $scope.getInclude = function (tt) {
        if (tt === 1) {
            return 'cadastro/thingDetailsT1.html';
        } else {
            return 'cadastro/thingDetailsTs.html';
        };
    };

    $scope.goToChildren = function (child) {
        $scope.lvlSelected = $scope.thingLvls[$scope.lvlSelected.thingLvl - 2];

        var result = jQuery.grep($scope.thingsList[child.thingLvl - 1], function (e) { return e.thingId == child.thingId; });
        $timeout(function () {
            $scope.selectedThing = result[0];
        }, 500);

        $timeout(function () {
            slideToggle(child.thingId);
            toggleIcon(child.thingId);
        }, 700);
    };

    $scope.clearThingFields = function (_key, _value) {
        $scope.newThing = {};
        clearFields();
        hideModal();
        _value = '';
        _key = '';
        $scope.groupForm.$setPristine();
    };

    $scope.toggle = function (_id, _class) {
        var viewId = 'view-detail-' + _id;
        collapseManager.ToggleDetail(viewId, _class);
        toggleIcon(_id);
    };

    $scope.loadingSrc = imageSrc.LoadingSrc;

    $scope.orderBy = function (field, _id) {
        orderByManagement.orderBy($scope, field, _id);
    };
});

angular.module("cummins-supervisorio").factory('ThingManagement', function (portsAPI) {
    var service = {};
    service.NewCharacteristicField = function (selectedThing, newCharacteristic) {
        if (selectedThing['Characteristics'] === undefined) {
            selectedThing['Characteristics'] = new Array();
            selectedThing['Characteristics'].push(angular.copy(newCharacteristic));

        } else {
            selectedThing['Characteristics'].push(angular.copy(newCharacteristic));
        };
    };
    service.DeleteCharacteristic = function (selectedThing, characteristic) {
        ///---Tira a caracteristica da Thing selecionada
        var newArray = selectedThing['Characteristics'].filter(function (el) {
            return el.key !== characteristic.key;
        });
        selectedThing['Characteristics'] = newArray;
        //portsAPI.putThings(selectedThing.thingId, selectedThing);
    };
    return service;
});

angular.module("cummins-supervisorio").factory('KinshipManager', function (portsAPI) {
    var service = {};


    service.AddChild = function (parent, child) {
        console.log("entrou no addChild. parent.ThingId = " + parent.thingId);
        child.parentThingId = parent.thingId;
        console.log("Fim da função. child.parentThingId = " + child.parentThingId);
    };

    service.deleteChild = function (parent, child) {
        console.log("entrou no deleteChild");
        child.parentThingId = 0;
    };
    return service;
});

var clearCharFields = function () {
    $("#char-content").find("input[type=text], textarea, select").val("");
};

var slideToggle = function (_child) {
    $('#thing-' + _child).find(".details").slideToggle();
};