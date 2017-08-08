'use strict';

/***
 * Controller para gerenciamento dos Monitores de estado
 * @Obs Utiliza o sevice portsAPI
 * @param {type} param1
 * @param {type} param2
 */
angular.module("cummins-supervisorio").controller("stateMonitorCtrl", function ($scope, portsAPI, JsonHandler, ColorService, collapseManager, imageSrc, orderByManagement) {

    /**
     * Declaração das variáveis globais do controller
     */
    //Dinâmicos (backend)
    $scope.stateMonitorList = [];
    $scope.thingsList = [];
    $scope.thingLvlList = [];
    $scope.thingTypeList = [];
    //$scope.scheduleList = [];
    $scope.columnNameData = [];
    $scope.groupMailList = [];

    //Fixos
    $scope.priorityList = []; //Carregado através da function loadPriorityList
    $scope.colorList = []; //Carregado através da function loadColorList
    
    // WeekDayManager no $scope

    //$scope.selectUnselectAllweekDays = WeekDayManager.selectUnselectAllweekDays;
    //$scope.containsWeekDay = WeekDayManager.containsWeekDay;
    //$scope.containsAllWeekDays = WeekDayManager.containsAllWeekDays;
    //$scope.addOrRemoveWeekDayToWeekDaysList = WeekDayManager.addOrRemoveWeekDayToWeekDaysList;




    /**
   * Define se meta é vinculada com entidade ou tipo
     True = Entidade
     False = Tipo
   */
    $scope.goalRelate = true;

    var level;
    var checkThingLvl = function (thing) {
        return thing.thingLvl === level;
    };


    $scope.orderBy = function (field, _id) {
        orderByManagement.orderBy($scope, field, _id);
    };


    /*
    * Cria uma coluna que mistura things e thing types a ser apresentadas na tela
    * @param {List} stateMonitorsData
    * @returns {undefined}
    */
    var misturarThingsComThingTypes = function (stateMonitorsData) {
        var mixedColumn = [];

        stateMonitorsData.map(function (stateMonitor) {
            if (stateMonitor.thingName) {
                mixedColumn.push(angular.copy({ "itemName": stateMonitor.thingName }));
            }
            else if (stateMonitor.thingType) {
                mixedColumn.push(angular.copy({ "itemName": stateMonitor.thingType }));
            }
        });
        return mixedColumn;
    };

    /**
     * Realiza o carregamento de todos os Monitores de estado
     * @returns {undefined}
     */
    var readAllStateMonitors = function () {
        portsAPI.getStateMonitors().success(function (_stateMonitorsData) {
            $scope.columnNameData = misturarThingsComThingTypes(_stateMonitorsData);
            portsAPI.getThingTypes().success(function (_thingTypesData) {
                $scope.thingTypeList = _thingTypesData;
                portsAPI.getGroupMails().success(function (_groupMailList) {
                    $scope.groupMailList = _groupMailList;                    
                        portsAPI.getThingLevels().success(function (_thingLevelData) {
                            portsAPI.getThings().success(function (_thingsData) {

                                $scope.thingLvlList = _thingLevelData;
                                var nOfThingLvls = $scope.thingLvlList.length;

                                $scope.thingsList = new Array(nOfThingLvls);
                                for (var i = 0; i < nOfThingLvls; i++) {
                                    level = i + 1; //é sempre 1 acima do index da lista
                                    $scope.thingsList[i] = _thingsData.filter(checkThingLvl);
                                };
                                $scope.stateMonitorList = _stateMonitorsData;
                            });
                        });
                    });
                });
            });
    };



    /**
     * Adiciona alerts vazios para a Metrica que ainda não tem
     * @returns {undefined}
     */
    //var criarAlertasVaziosParaCadaMetrica = function () {

    //    // Para cada Meta da lista
    //    $scope.stateMonitorList.forEach(function (meta) {

    //        // Para cada Metrica da Meta
    //        stateMonitor.StateMonitorMetrics.forEach(function (metrica) {

    //            // Checa se há o array de Alertas
    //            if (metrica.alerts == null)
    //                metrica.alerts = [];

    //            // Cria Alertas para as posições sem Alertas
    //            for (var i = metrica.alerts.length; i < 3; i++) {

    //                var _type = null;

    //                switch (i) {
    //                    case 0:
    //                        _type = "verde";
    //                        break;
    //                    case 1:
    //                        _type = "amarelo";
    //                        break;
    //                    case 2:
    //                        _type = "vermelho";
    //                        break;
    //                    default:
    //                        _type = "branco";
    //                }

    //                metrica.alerts[i] = {
    //                    type: _type,
    //                    value: "",
    //                    message: ""
    //                };
    //            }
    //        });
    //    });
    //};

    /**
     * Retorna a copia de um objeto, com todos os campos e valroes
     * @param {Object} o
     * @returns {Object}
     * @help Ajuda com listagem de properties de um objeto: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Trabalhando_com_Objetos
     */
    var copyObject = function (o) {
        var c = {};
        for (var p in o)
            c[p] = o[p];
        return c;
    };

    /**
     * Retorna uma string que representa a listagem das propriedades e valores do objeto recebido
     * @param {type} o
     * @returns {String}
     */
    var describeObject = function (o) {
        var s = "{";
        for (var p in o) {
            if (typeof (o[p]) === 'object')
                s = s + describeObject(o[p]);
            else
                s = s + p + ": " + o[p] + ", ";
        }
        return s.substring(0, s.length - 2) + "}";
        ;
    };

    //##
    //# GERENCIAMENTO DOS MONITORES DE ESTADO
    //##

    $scope.selectStateMonitor = function (stateMonitor) {
        $scope.selectedStateMonitor = angular.copy(stateMonitor);
    };

    /***
     * Verifica se a Meta já existe.
     * A verificação é feita com baseno thingId e no thingLvl
     * @param {type} meta
     * @returns {Boolean}
     */
    var checarSeJaExisteAMeta = function (stateMonitor) {
        var stateMonitor = $scope.stateMonitorList.find(function (m) {
            return m.thingId === stateMonitor.thingId && m.thingLvl === stateMonitor.thingLvl;
        });

        if (stateMonitor != null)
            return true;
        else
            return false;
    };

    /*
    * Clear all fields
    */
    var clearAllFields = function () {
        delete $scope.stateMonitor;
        delete $scope.thing;

        //JsonHandler.clearAllLevelFields(thing);
        //JsonHandler.clearAllLevelFields(meta);
    }

    $scope.clearAllFields = clearAllFields;

    /**
     * Cria uma nova meta
     * @param {type} a - Valor selecionado no grid
     * @param {type} b - Valor selecionado no grid
     * @returns {undefined}
     */
    $scope.createStateMonitor = function (stateMonitor, thing) {
        if (thing != null & thing != undefined) {
            stateMonitor.thingId = thing.thingId;
            stateMonitor.thingName = thing.name;
        }

        stateMonitor.stateMonitorId = 0;
        stateMonitor.status = "active";

        var postStateMonitorFail = function (error) {
            console.log(describeObject(error));
        };

        var postStateMonitorSuccess = function (response) {
            readAllStateMonitors();
        };

        console.log(describeObject(stateMonitor));

        portsAPI.postStateMonitors(stateMonitor).success(function (response) {
            postStateMonitorSuccess(response);
            clearAllFields();
        }).error(function (error) {          
            postStateMonitorFail(error);
            clearAllFields();
        });
    };
    $scope.stateMonitor = '';
    $scope.openModal = function (_id, _msg, stateMonitor) {
        showModal(_id, _msg);
        $scope.creating = true;
        clearFields();
        $scope.stateMonitor = '';
        $scope.dialogMsg = _msg;
    };

    $scope.closeModal = function (_id) {
        $scope.creating = false;
        hideModal(_id);
    };

    /**
     * Atualiza os valores da Meta selecionada
     * @param {type} meta - Meta selecionada no grid
     * @returns {undefined}
     */
    $scope.updateStateMonitor = function (stateMonitor) {
        //console.log("Update stateMon: " + describeObject(stateMonitor));

        var putStateMonitorFail = function (error) {
            console.log(describeObject(error));
            alert(describeObject(error));
        };

        var putStateMonitorSuccess = function (response) {
            readAllStateMonitors();
        };

        portsAPI.putStateMonitors(stateMonitor.stateMonitorId, stateMonitor).success(function (response) {
            putStateMonitorSuccess(response);
        }).error(function (error) {
            putStateMonitorFail(error);
        });
    };

    /**
     * Exclui uma meta
     * @param {type} meta - Meta selecionada no grid
     * @returns {undefined}
     */
    $scope.deleteStateMonitor = function (stateMonitor) {
        console.log(stateMonitor);

        var deleteStateMonitorFail = function (error) {
            console.log(describeObject(error));
            alert(describeObject(error));
        };

        var deleteStateMonitorSuccess = function (response) {
            readAllStateMonitors();
        };

        portsAPI.deleteStateMonitors(stateMonitor.stateMonitorId).success(function (response) {
            deleteStateMonitorSuccess(response);
        }).error(function (error) {
            deleteStateMonitorFail(error);
        });
    };

    //##
    //# GERENCIAMENTO DE METRICA
    //##

    /**
    * Popula o dropdown de prioridades
    */
    //var loadPriorityList = function () {
    //    for (var i = 1; i <= 10; i++) {
    //        $scope.priorityList.push(i);
    //    }
    //};

    /**
   * Popula o dropdown de prioridades
   * Retirando as prioridades já cadastradas
   */
    $scope.loadPriorityList = function (stateMonitorMetric) {
        var adiciona;

        $scope.priorityList = [];
        for (var i = 1; i <= 10; i++) {
            adiciona = true;
            if (stateMonitorMetric.States != undefined) {
                for (var j = 0; j < stateMonitorMetric.States.length; j++) {
                    if (stateMonitorMetric.States[j].priority == i) {
                        adiciona = false;
                    }
                }
            }
            if (adiciona)
                $scope.priorityList.push(i);
        }
    };


    /**
   * Popula o dropdown de cores
   */
    var loadColorList = function () {
        $scope.colorList = ColorService.loadColorList();
    };

    loadColorList();

    ///*Atualiza cor do select box */
    $scope.selectColorBackground = function (color) {
        return { 'background-color': color }
    };

    /**
    *Metrica selecionada 
    */
    $scope.selectStateMonitorMetric = function (metric) {
        $scope.selectedStateMonitorMetric = metric;
    }


    /**
    * Encontra o primeiro Id disponível para nova métrica, visando tratar a criação de subniveis antes de enviar qualquer informação ao banco
    */
    var temporaryMetricSublevelId = 0;
    var getNextMetricId = function () {
        if (temporaryMetricSublevelId === 0) {
            var allMetricsList = JsonHandler.getCompletedSublevelList($scope.stateMonitorList, "StateMonitorMetrics");
            temporaryMetricSublevelId = allMetricsList.length + 1000001; //TODO: Melhoria - Encontrar o último ID existente ao invés de utilizar o length
        }
        else
            temporaryMetricSublevelId = temporaryMetricSublevelId + 1000001;
        return temporaryMetricSublevelId;
    }


    /**
     * Adiciona uma Metrica para uma Meta
     * @param {type} selectedMeta - A meta seleciona na lista
     * @param {type} newMetrica - A metrica nova a ser criada
     * @returns {undefined}
     */

    $scope.addMetricToStateMonitor = function (stateMonitor, newStateMonitorMetric) {
        if (stateMonitor.StateMonitorMetrics === undefined)
            stateMonitor.StateMonitorMetrics = [];
        var temporaryMetricSublevelId = getNextMetricId();
        newStateMonitorMetric.stateMonitorMetricId = temporaryMetricSublevelId;
        stateMonitor.StateMonitorMetrics.push(angular.copy(newStateMonitorMetric));
        //criarAlertasVaziosParaCadaMetrica();
        JsonHandler.clearAllLevelFields(newStateMonitorMetric);
    };

    /**
     * Remove uma Metrica de uma Meta
     * @param {type} meta
     * @param {type} metrica
     * @returns {undefined}
     */
    $scope.removeMetricFromStateMonitor = function (stateMonitor, stateMonitorMetric) {
        JsonHandler.removeSublevel(stateMonitor, stateMonitorMetric, "StateMonitorMetrics", "stateMonitorMetricId");
    };



    //##
    //# GERENCIAMENTO DE ALERTA
    //##

      /**
    *Alerta selecionado 
    */
    $scope.selectState = function (state) {
        $scope.selectedState = state;
    }   
   
    /**
     * Efeito ao clicar para expandir ou reduzir detalhes de um item
     */
    $scope.toggle = function (_id, _class) {
        console.log(_id);
        collapseManager.ToggleDetail(_id, _class);
    };

    /**
    * Atualiza display do valor selecionado para uma prioridade
    */
    function updatePriorityShow(val) {
        document.getElementById('selectedPriorityShow').value = val;
    }

    /**
    * Encontra o primeiro Id disponível para nova métrica, visando tratar a criação de subniveis antes de enviar qualquer informação ao banco
    */
    var temporaryStateSublevelId = 0;
    var getNextStateId = function () {
        if (temporaryStateSublevelId === 0) {
            var allMetricsList = JsonHandler.getCompletedSublevelList($scope.stateMonitorList, "StateMonitorMetrics");
            var allStatesList = JsonHandler.getCompletedSublevelList(allMetricsList, "States");
            temporaryStateSublevelId = allStatesList.length + 1000001;
        }
        else
            temporaryStateSublevelId = temporaryStateSublevelId + 1000001;
        return temporaryStateSublevelId;
    }


    /**
     * Adiciona um alerta para uma metrica
     * @param {type} metrica - A metrica selecionada na lista
     * @param {type} newState - O alerta novo a ser criado
     * @returns {undefined}
     */

    $scope.addStateToMetric = function (stateMonitorMetric, newState) {
        if (stateMonitorMetric.States === undefined)
            stateMonitorMetric.States = [];
        var temporaryStateSublevelId = getNextStateId();
        newState.stateId = temporaryStateSublevelId;

        stateMonitorMetric.States.push(angular.copy(newState));
        
        //Tratamento da tela após inserção do alerta
        JsonHandler.clearAllLevelFields(newState);
    };

    /**
     * Remove um estado de uma metrica
     * @param {type} metrica
     * @param {type} estado
     * @returns {undefined}
     */
    $scope.removeStateFromMetric = function (stateMonitorMetric, state) {
        JsonHandler.removeSublevel(stateMonitorMetric, state, "States", "stateId");
    };


    // No momento do carregamento da página,
    // solicita que sejam carregadas as metas
    readAllStateMonitors();

    //##
    //# GERENCIAMENTO DE ENTIDADES A SER VINCULADAS COM A META
    //##

    $scope.getThingName = function (_thingLvlDescription, _thingId) {
        var tt = jQuery.grep($scope.thingLvlList, function (e) { return e.thingLvlDescription === _thingLvlDescription; });
        if (tt[0] === undefined)
            return;

        var result = jQuery.grep($scope.thingsList[tt[0].thingLvl - 1], function (e) {
            return e.thingId === _thingId;
        });
        if (result[0] !== undefined) {
            return result[0].name;
        };
    };

    //tt = Level of Thing
    $scope.thingsOfLvl = function (_tt) {
        var tt = jQuery.grep($scope.thingLvlList, function (e) { return e.thingLvl === _tt; });
        if (tt[0] === undefined) {
            return;
        } else {
            var result = jQuery.grep($scope.thingsList[tt[0].thingLvl - 1], function (e) {
                return e.thingLvl == _tt;
            });
            if (result !== undefined) {
                return result;
            };
        }
    };
    $scope.creating = false;
    $scope.loadingSrc = imageSrc.LoadingSrc;
});

