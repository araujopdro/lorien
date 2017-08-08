'use strict';

/***
 * Controller para gerenciamento das Metas
 * @Obs Utiliza o sevice portsAPI
 * @param {type} param1
 * @param {type} param2
 */
angular.module("cummins-supervisorio").controller("goalsCtrl", function ($scope, portsAPI, JsonHandler, ColorService, collapseManager, imageSrc, orderByManagement, WeekDayManager) {

    /**
     * Declaração das variáveis globais do controller
     */
    //Dinâmicos (backend)
    $scope.metaList = [];
    $scope.thingsList = [];
    $scope.thingLvlList = [];
    $scope.thingTypeList = [];
    $scope.scheduleList = [];
    $scope.columnNameData = [];
    $scope.groupMailList = [];
    $scope.invalidOrDuplicatedMetricDescription;
    $scope.duplicatedPriority;

    //Fixos
    $scope.priorityList = []; //Carregado através da function loadPriorityList
    $scope.colorList = []; //Carregado através da function loadColorList

    // WeekDayManager no $scope

    $scope.selectUnselectAllweekDays = WeekDayManager.selectUnselectAllweekDays;
    $scope.containsWeekDay = WeekDayManager.containsWeekDay;
    $scope.containsAllWeekDays = WeekDayManager.containsAllWeekDays;
    $scope.addOrRemoveWeekDayToWeekDaysList = WeekDayManager.addOrRemoveWeekDayToWeekDaysList;

    var checkIfAlertDisablesSave = function (enableSave, newAlert) {
        if (newAlert)
            if (!newAlert.color || newAlert.color == '#' || newAlert.fontColor == '#' || !newAlert.priority || newAlert.Weekdays == undefined || newAlert.Weekdays == null || newAlert.Weekdays.length == 0) {
                enableSave = false;
            }
        return enableSave;
    };

    //Disable Save
    var checkIfMetaIsOkToUpdate = function (Metrics) {
        var enableSave = true;
        var newMetric;
        var newAlert;
        for (var i = 0; i < Metrics.length ; i++) {
            newMetric = Metrics[i];
            if (newMetric) {
                if (!newMetric.value || !newMetric.descMetric || !newMetric.cycle || !newMetric.progression || !newMetric.processBreaksProduction ||!newMetric.processBreaksPrediction ) {
                    return false;
                }
                else //If metric value is Ok, check its alerts
                    if (newMetric.Alerts) {
                        for (var j = 0; j < newMetric.Alerts.length ; j++) {
                            newAlert = newMetric.Alerts[j];
                            if (newAlert) {
                                enableSave = checkIfAlertDisablesSave(enableSave, newAlert)
                            }
                        }
                    }
            }
            else
                enableSave = false;
        }
        return enableSave;
    };

    /**
    * Set 'false' for all checkbox fields which were null
    */
    //var setFalseForUnfilledCheckboxes = function (newMetric) {
    //    if (!newMetric.fulltime)
    //        newMetric.fulltime = false;
    //    if (!newMetric.considerSchedule)
    //        newMetric.considerSchedule = false;

    //    return newMetric;
    //}


    /**
    * Validates metric description 
    */
    var validateMetricDescription = function (metricArray, currentMetric) {
        if (currentMetric.descMetric.indexOf(' ') >= 0)
            $scope.invalidOrDuplicatedMetricDescription = true;
        else {
            $scope.invalidOrDuplicatedMetricDescription = false;
            if (metricArray) {
                if (JsonHandler.checkIfItemExistsInArray(metricArray, 'descMetric', currentMetric.descMetric, 'metricId', currentMetric.metricId)) {
                    $scope.invalidOrDuplicatedMetricDescription = true;
                }
            }
        }
    };

    /**
    * Validates metric description 
    */
    var validadeAlertPriority = function (alertArray, currentAlert) {
        $scope.duplicatedPriority = false;
        if (alertArray) {
            if (JsonHandler.checkIfItemExistsInArray(alertArray, 'priority', currentAlert.priority, 'alertId', currentAlert.alertId)) {
                $scope.duplicatedPriority = true;
            }
        }
    };

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


    $scope.scheduleFilter = function (item) {

        if (item.status == 'active' && item.scheduleType == 'shift') {
            return item;
        }
    };


    /*
    * Cria uma coluna que mistura things e thing types a ser apresentadas na tela
    * @param {List} goalsData
    * @returns {undefined}
    */
    var misturarThingsComThingTypes = function (goalsData) {
        var mixedColumn = [];

        goalsData.map(function (goal) {
            if (goal.thingName) {
                mixedColumn.push(angular.copy({ "itemName": goal.thingName }));
            }
            else if (goal.thingType) {
                mixedColumn.push(angular.copy({ "itemName": goal.thingType }));
            }
        });
        return mixedColumn;
    };

    /**
     * Realiza o carregamento de todas as Metas
     * @returns {undefined}
     */
    var readAllMeta = function () {
        portsAPI.getGoals().success(function (_goalsData) {
            $scope.columnNameData = misturarThingsComThingTypes(_goalsData);
            portsAPI.getThingTypes().success(function (_thingTypesData) {
                $scope.thingTypeList = _thingTypesData;
                portsAPI.getGroupMails().success(function (_groupMailList) {
                    $scope.groupMailList = _groupMailList;

                    portsAPI.getSchedules().success(function (_schedules) {
                        $scope.scheduleList = _schedules;
                        console.log(_schedules);
                        portsAPI.getThingLevels().success(function (_thingLevelData) {
                            portsAPI.getThings().success(function (_thingsData) {

                                $scope.thingLvlList = _thingLevelData;
                                var nOfThingLvls = $scope.thingLvlList.length;

                                $scope.thingsList = new Array(nOfThingLvls);
                                for (var i = 0; i < nOfThingLvls; i++) {
                                    level = i + 1; //é sempre 1 acima do index da lista
                                    $scope.thingsList[i] = _thingsData.filter(checkThingLvl);
                                };
                                $scope.metaList = _goalsData;
                            });
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
    var criarAlertasVaziosParaCadaMetrica = function () {

        // Para cada Meta da lista
        $scope.metaList.forEach(function (meta) {

            // Para cada Metrica da Meta
            meta.Metrics.forEach(function (metrica) {

                // Checa se há o array de Alertas
                if (metrica.alerts == null)
                    metrica.alerts = [];

                // Cria Alertas para as posições sem Alertas
                for (var i = metrica.alerts.length; i < 3; i++) {

                    var _type = null;

                    switch (i) {
                        case 0:
                            _type = "verde";
                            break;
                        case 1:
                            _type = "amarelo";
                            break;
                        case 2:
                            _type = "vermelho";
                            break;
                        default:
                            _type = "branco";
                    }

                    metrica.alerts[i] = {
                        type: _type,
                        value: "",
                        message: ""
                    };
                }
            });
        });
    };

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
    //# GERENCIAMENTO DE META
    //##

    $scope.selectGoal = function (meta) {
        $scope.selectedGoal = angular.copy(meta);
    };

    /***
     * Verifica se a Meta já existe.
     * A verificação é feita com baseno thingId e no thingLvl
     * @param {type} meta
     * @returns {Boolean}
     */
    var checarSeJaExisteAMeta = function (meta) {
        var storedMeta = $scope.metaList.find(function (m) {
            return m.thingId === meta.thingId && m.thingLvl === meta.thingLvl;
        });

        if (storedMeta != null)
            return true;
        else
            return false;
    };

    /*
    * Clear all fields
    */
    var clearAllFields = function () {
        delete $scope.meta;
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
    $scope.createMeta = function (meta, thing) {
        if (thing != null & thing != undefined) {
            meta.thingId = thing.thingId;
            meta.thingName = thing.name;
        }
        meta.goalId = 0;
        meta.automaticallyCreated = 0;
        meta.status = "active";

        var postMetasFail = function (error) {
            console.log(describeObject(error));
        };

        var postMetasSuccess = function (response) {
            readAllMeta();
        };

        console.log(describeObject(meta));

        portsAPI.postGoals(meta).success(function (response) {
            postMetasSuccess(response);
            clearAllFields();
        }).error(function (error) {
            postMetasFail(error);
            clearAllFields();
        });
    };
    $scope.meta = '';
    $scope.openModal = function (_id, _msg, meta) {
        showModal(_id, _msg);
        $scope.creating = true;
        clearFields();
        $scope.meta = '';
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
    $scope.updateMeta = function (meta) {
        console.log("Update Meta: " + describeObject(meta));

        if (checkIfMetaIsOkToUpdate(meta.Metrics)) {
            $scope.showUpdateValidationError = false;

            var putMetasFail = function (error) {
                console.log(describeObject(error));
                //alert(describeObject(error));
            };

            var putMetasSuccess = function (response) {
                readAllMeta();
            };

            portsAPI.putGoals(meta.goalId, meta).success(function (response) {
                putMetasSuccess(response);
            }).error(function (error) {
                putMetasFail(error);
            });
        }
        else
            $scope.showUpdateValidationError = true;
    };

    /**
     * Exclui uma meta
     * @param {type} meta - Meta selecionada no grid
     * @returns {undefined}
     */
    $scope.deleteMeta = function (meta) {
        console.log(meta);

        var deleteMetaFail = function (error) {
            console.log(describeObject(error));
        };

        var deleteMetaSuccess = function (response) {
            readAllMeta();
        };

        portsAPI.deleteGoals(meta.goalId).success(function (response) {
            deleteMetaSuccess(response);
        }).error(function (error) {
            deleteMetaFail(error);
        });
    };

    //##
    //# GERENCIAMENTO DE METRICA
    //##

    /**
    * Popula o dropdown de prioridades
    */
    $scope.loadPriorityList = function () {
        $scope.priorityList = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    };

    /**
   * Popula o dropdown de prioridades
   * Retirando as prioridades já cadastradas
   */
    //$scope.loadPriorityList = function (Metric) {
    //    var adiciona;

    //    for (var i = 1; i <= 10; i++) {
    //        adiciona = true;
    //        if (Metric.Alerts != undefined) {
    //            for (var j = 0; j < Metric.Alerts.length; j++) {
    //                if (Metric.Alerts[j].priority == i) {
    //                    adiciona = false;
    //                }
    //            }
    //        }
    //        if (adiciona)
    //            $scope.priorityList.push(i);
    //    }
    //};


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
    $scope.selectMetric = function (metric) {
        if (metric) {
            $scope.newMetric = metric;
            $scope.newMetric.value = parseInt(metric.value, 10); // The field 'Value' only accepts numerics
        }
        else {
            $scope.newMetric = {};
        }

        //Default value for checkboxes
        if (!$scope.newMetric.considerSchedule)
            $scope.newMetric.considerSchedule = false;
        if (!$scope.newMetric.fulltime)
            $scope.newMetric.fulltime = false;
    }
    /**
    * Encontra o primeiro Id disponível para nova métrica, visando tratar a criação de subniveis antes de enviar qualquer informação ao banco
    */
    var temporaryMetricSublevelId = 0;
    var getNextMetricId = function () {
        if (temporaryMetricSublevelId === 0) {
            var allMetricsList = JsonHandler.getCompletedSublevelList($scope.metaList, "Metrics");
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

    $scope.addMetricToGoal = function (meta, newMetric) {
        if (meta.Metrics === undefined)
            meta.Metrics = [];
        var temporaryMetricSublevelId = getNextMetricId();
        newMetric.metricId = temporaryMetricSublevelId;
        meta.Metrics.push(angular.copy(newMetric));
        //criarAlertasVaziosParaCadaMetrica();
        JsonHandler.clearAllLevelFields(newMetric);
    };

    /**
     * Remove uma Metrica de uma Meta
     * @param {type} meta
     * @param {type} metrica
     * @returns {undefined}
     */
    $scope.removeMetricFromGoal = function (meta, metrica) {
        JsonHandler.removeSublevel(meta, metrica, "Metrics", "metricId");
    };



    //##
    //# GERENCIAMENTO DE ALERTA
    //##

    /**
     * Adiciona um Email para um alerta
     * @param {type} email
     * @param {type} selectedMetric
     * @returns {undefined}
     */

    /**
    *Alerta selecionado 
    */
    $scope.selectAlert = function (alert) {
        if (alert) {
            $scope.newAlert = alert;
        }
        else {
            $scope.newAlert = {};
        }
    }

    $scope.addEmail = function (newEmailValue, selectedAlert) {
        if (selectedAlert['emailList'] === undefined)
            selectedAlert['emailList'] = new Array();

        var newEmail = {
            "email": newEmailValue
        };

        if (JsonHandler.checkIfItemExistsInSublevel(selectedAlert, newEmail, "emailList", "email") <= -1) //If array already doesn't contain the email
            selectedAlert['emailList'].push(angular.copy(newEmail));
    };

    /* Remove um Email para um alerta
    * @param {type} email
    * @param {type} selectedMetric
    * @returns {undefined}
    */
    $scope.deleteEmail = function (selectedAlert, email) {
        var newArray = selectedAlert['emailList'].filter(function (el) {
            return el !== email
        });
        console.log("new Array:");
        console.log(newArray);
        selectedAlert['emailList'] = newArray;
    };

    /**
     * Efeito ao clicar para expandir ou reduzir detalhes de um item
     */
    $scope.toggle = function (_id, _class) {
        console.log(_id);
        collapseManager.ToggleDetail(_id, _class);
        $scope.showUpdateValidationError = false;
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
    var temporaryAlertSublevelId = 0;
    var getNextAlertId = function () {
        if (temporaryAlertSublevelId === 0) {
            var allMetricsList = JsonHandler.getCompletedSublevelList($scope.metaList, "Metrics");
            var allalertsList = JsonHandler.getCompletedSublevelList(allMetricsList, "alerts");
            temporaryAlertSublevelId = allalertsList.length + 1;
        }
        else
            temporaryAlertSublevelId = temporaryAlertSublevelId + 1;
        return temporaryAlertSublevelId;
    }


    /**
     * Adiciona um alerta para uma metrica
     * @param {type} metrica - A metrica selecionada na lista
     * @param {type} newAlert - O alerta novo a ser criado
     * @returns {undefined}
     */

    $scope.addAlertToMetric = function (metrica, newAlert, schedule, groupMail, weekdayOpt) {
        if (metrica.Alerts === undefined)
            metrica.Alerts = [];
        var temporaryAlertSublevelId = getNextAlertId();
        newAlert.alertId = temporaryAlertSublevelId;

        //if (schedule != undefined && schedule != null && schedule != null) {
        //    newAlert.scheduleId = schedule.scheduleId;
        //    newAlert.scheduleName = schedule.scheduleName;
        //}

        if (groupMail != undefined && groupMail != null && groupMail != null) {
            newAlert.groupMailsListId = groupMail.groupMailsId;
            newAlert.groupMailsListName = groupMail.nameGroup;
        }
        metrica.Alerts.push(angular.copy(newAlert));

        //Tratamento da tela após inserção do alerta
        JsonHandler.clearAllLevelFields(newAlert);
        newAlert.Weekdays = [];
    };


    /**
     * Remove uma alert de uma metrica
     * @param {type} metrica
     * @param {type} alert
     * @returns {undefined}
     */
    $scope.removeAlertFromMetric = function (metrica, alert) {
        console.log(alert);
        JsonHandler.removeSublevel(metrica, alert, "Alerts", "alertId");
    };


    // No momento do carregamento da página,
    // solicita que sejam carregadas as metas
    readAllMeta();

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
    $scope.validateMetricDescription = validateMetricDescription;
    $scope.validadeAlertPriority = validadeAlertPriority;
});

