'use strict';

/***
 * Controller para gerenciamento das Metas
 * @Obs Utiliza o sevice portsAPI
 * @param {type} param1
 * @param {type} param2
 */
angular.module("cummins-supervisorio").controller("turnosCtrl", function ($scope, portsAPI, collapseManager, imageSrc, JsonHandler, orderByManagement, WeekDayManager) {

    /**
     * Declaração das variáveis globais do controller
     */
    $scope.shiftsList = [];
    $scope.exceptionsList = [];
    $scope.selectedSchedule = {};
    $scope.Schedule = [];
    /*
    * WeekDayManager no $scope
    */
    $scope.selectUnselectAllweekDays = WeekDayManager.selectUnselectAllweekDays;
    $scope.containsWeekDay = WeekDayManager.containsWeekDay;
    $scope.containsAllWeekDays = WeekDayManager.containsAllWeekDays;
    $scope.addOrRemoveWeekDayToWeekDaysList = WeekDayManager.addOrRemoveWeekDayToWeekDaysList;

    /**
     * Retorna a copia de um objeto, com todos os campos e valroes
     * @param {Object} o
     * @returns {Object}
     * @help Ajuda com listagem de properties de um objeto: https://developer.mozilla.org/pt-BR/docs/Web/JavaScript/Guide/Trabalhando_com_Objetos
     */
    var copyObject = function (o) {
        var c = {};
        for (var p in o) c[p] = o[p];
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
            if (typeof (o[p]) === 'object') s = s + describeObject(o[p]);
            else s = s + p + ": " + o[p] + ", ";
        }
        return s.substring(0, s.length - 2) + "}";;
    };

    $scope.formatingDate = function (_obj, _date) {
        // console.log('Before data formatting..');
        // console.log(_date);
        // console.log(_obj);
        var date = _date;       
        console.log(date.toString().length)
        if (date.toString().length > 10) {
            console.log("MM/dd/yyyy");
            var newDate = new Date(date);

            var year = newDate.getFullYear();

            var pad = "00";
            var month = "" + (newDate.getMonth() + 1);//getMonth is zero based;


            var formattedMonth = pad.substring(0, pad.length - month.length) + month;
            var day = "" + newDate.getDate();

            var formattedDay = pad.substring(0, pad.length - day.length) + day;
            date = formattedDay + "/" + formattedMonth + "/" + year;
            console.log(date);
        }
        else {
            console.log("dd/MM/yyyy");
        }
        _obj.Trigger.triggerDate = date;
        // console.log('After data formatting..');
        // console.log(formattedDate);
        // console.log(_obj);

    }

    //##
    //# GERENCIAMENTO DE META
    //##

    /***
     * Verifica se a Meta já existe.
     * A verificação é feita com baseno thingId e no thingType
     * @param {type} meta
     * @returns {Boolean}
     */
    var checarSeJaExisteAMeta = function (meta) {
        var storedMeta = $scope.metaList.find(function (m) {
            return m.thingId === meta.thingId && m.thingType === meta.thingType;
        });

        if (storedMeta != null) return true;
        else return false;
    };


    /**
     * Changes the order of the displayed lines
     * @param {string} field
     * @param {string} _id
     * @returns {undefined}
     */
    $scope.orderBy = function (field, _id) {
        orderByManagement.orderBy($scope, field, _id);
    };

    $scope.orderBy2 = function (field, _id) {
        orderByManagement.orderBySpecificDir1($scope, field, _id);
    };


    $scope.orderBy3 = function (field, _id) {
        orderByManagement.orderBySpecificDir2($scope, field, _id);
    };


    /**
    * General Schedule Creation
    * @param {type} schedule
    */
    var createSchedule = function (_schedule) {
        var postSchedulesFail = function (error) {
            console.log(describeObject(error));
        };

        var postSchedulesSuccess = function (response) {
            $scope.readAllSchedules();
        };

        portsAPI.postSchedules(_schedule).success(function (response) {
            postSchedulesSuccess(response);
        }).error(function (error) {
            postSchedulesFail(error);
        });
    };

    /**
    * Shift Creation
    * @param {type} shift
    */
    $scope.createShift = function (_schedule) {
        _schedule.scheduleType = "shift";
        _schedule.status = "active";
        createSchedule(_schedule);
    };


    /**
    * Exception Creation
    * @param {type} exception
    */
    $scope.createException = function (_exception, _scheduleType) {
        if (_scheduleType)
            _exception.scheduleType = "exception-work";
        else
            _exception.scheduleType = "exception-nowork";
        _exception.status = "active";
        createSchedule(_exception);
    };

    /**
     * Realiza o carregamento de todas as Metas
     * @returns {undefined}
     */
    $scope.readAllSchedules = function () {

        $scope.shiftsList = [];
        $scope.exceptionsList = [];

        // console.log("$scope.readAllSchedules");

        // Callback de erro do carregamento das metas
        var getSchedulesFail = function (error) {
            // console.log(describeObject(error));
            $scope.shiftsList = [];
            $scope.exceptionsList = [];
        };

        // Callback de sucesso do carregamento das metas
        var getSchedulesSuccess = function (response) {

            // console.log(response);
            response.forEach(function (schedule) {

                if (schedule.status === "inactive") return;

                switch (schedule.scheduleType) {
                    case 'shift':
                        $scope.shiftsList.push(schedule);
                        // console.log('$scope.shiftsList -copy');
                        // console.log(angular.copy($scope.shiftsList));
                        getThingBelongToTurno(schedule);
                        break;
                    case ('exception-nowork'):
                    case ('exception-work'):
                        $scope.exceptionsList.push(schedule);
                        break;
                    default:


                }
            });
        }

        //GETTING THINGS BELONG TO TURNO


        portsAPI.getSchedules().success(function (response) {


            portsAPI.getThings().success(function (_thingsResponse) {
                $scope.thingsResponse = _thingsResponse;
                getSchedulesSuccess(response);



            })
        }).error(function (error) {
            getSchedulesFail(error);
        });
    };

    var getThingBelongToTurno = function (response) {

        //for (var j = 0; j < response.length; j++) {

        //    var tamanhoThing = response[j].ThingLists.length;
        //    var newObj = {};
        //    $scope.thingsTurno = [];  // pega as things ja existentes no JSON

        //    for (var i = 0; i < tamanhoThing; i++) {

        //        newObj.scheduleId = response[j].ThingLists[i].scheduleId;
        //        newObj.thingId = response[j].ThingLists[i].thingId;
        //        newObj.autoCreated = response[j].ThingLists[i].autoCreated;
        //        newObj.thingName = null;

        //        $scope.thingsTurno.push(newObj);
        //        newObj = {};
        //    }
        //}
        $scope.thingsTurno = {};
        $scope.thingsTurno = response;
        // console.log('response');
        // console.log(response);
        var i = 0;

        for (var y = 0; i < response.ThingLists.length; y++) {
            //if ($scope.thingsTurno == undefined || $scope.thingsTurno == null) {

            //}
            if ($scope.thingsTurno.ThingLists[i].thingId == $scope.thingsResponse[y].thingId) {

                $scope.thingsTurno.ThingLists[i].thingName = $scope.thingsResponse[y].name;
                i++;
                y = -1;

            } else {
                //$scope.thingsTurno[i].thingName = $scope.thingsTurno[y].thingId;
                //console.log($scope.thingsTurno[i].thingName + "não existe");
            }
        }



        // console.log('thingsturno');
        // console.log(response);
        // console.log('thingsturno2');

        // console.log($scope.thingsTurno);
    }


    // POST THINGS IN TURNO
    $scope.putThings = function (_objSelecionado, id) {

        var objCreateThings = {};


        objCreateThings.scheduleId = $scope.selectedSchedule.scheduleId;
        objCreateThings.thingId = id;
        objCreateThings.autoCreated = false;

        $scope.selectedSchedule.ThingLists.push(objCreateThings);

        getThingBelongToTurno($scope.selectedSchedule);

        // $scope.createThings.push();       

        // $scope.readAllSchedules();
    }

    //var checarPeriodoTurno = function () {
    //    if ($scope.newSchedule.Trigger.triggerStartTime  == || $scope.newSchedule.Trigger.triggerEndTime ==)
    //    weekDayName



    //    triggerStartTime

    //    triggerEndTime
    //}

    /**
    * General Schedule Update
    * @param {type} schedule
    */
    var updateSchedule = function (schedule) {
        delete schedule.$$hashKey;
        // console.log('Update Schedule with the following:');        
        // console.log(schedule);

        //console.log("$scope.putschedule: " + describeObject(schedule));

        var putSchedulesFail = function (error) {
            // console.log(describeObject(error));
            alert(describeObject(error));
        };

        var putSchedulesSuccess = function (response) {
            $scope.readAllSchedules();
        };

        portsAPI.putSchedules(schedule.scheduleId, schedule).success(function (response) {
            putSchedulesSuccess(response);
        }).error(function (error) {
            putSchedulesFail(error);
        });
    };

    var getThingLvl = function () {
        portsAPI.getThingLevels().success(function (_thingLvl) {
            $scope.thingLvl = _thingLvl;

            //for (var i = 0 ; i < $scope.thingLvl; i++) {
            //    $scope.thingLvl[i].thingLvl = toString($scope.thingLvl[i].thingLvl);
            //}
        });
    }

    getThingLvl();

    /**
     * Udpates a shift
     * @param {type} shift
     * @returns {undefined}
     */
    $scope.updateShift = function (shift) {
        updateSchedule(shift);
    };

    /**
     * Udpates an exception 
     * @param {type} exception
     * @returns {undefined}
     */
    $scope.updateException = function (exception, _scheduleType) {
        if (_scheduleType)
            exception.scheduleType = "exception-work";
        else
            exception.scheduleType = "exception-nowork";
        updateSchedule(exception);
    };


    /**
     * Deletes a shift
     * @param {type} shift
     * @returns {undefined}
     */
    $scope.deleteShift = function (shift) {
        var deleteSchedulesFail = function (error) {
            // console.log(describeObject(error));
            alert(describeObject(error));
        };

        var deleteSchedulesSuccess = function (response) {
            $scope.readAllSchedules();
        };

        portsAPI.deleteSchedules(shift.scheduleId).success(function (response) {
            deleteSchedulesSuccess(response);
        }).error(function (error) {
            deleteSchedulesFail(error);
        });
    };

    /**
     * When the user expand the content, this function makes a copy
     * of the passed schedule, and display it, so the user can
     * change the schedule information.
     * @param {type} schedule
     * @returns {undefined}
     */
    $scope.selectSchedule = function (_schedule) {
        $scope.selectedSchedule = angular.copy(_schedule);

        // console.log($scope.selectedSchedule);
    };

    /**
    * Add a parentScheduleId to exception
    * @param {type} schedule 
    * @param {type} newBreak 
    * @returns {undefined}
    */
    $scope.addParentScheduleToException = function (schedule, newparentSchedule) {
        if (schedule.ParentScheduleIdLists === undefined)
            schedule.ParentScheduleIdLists = [];
        schedule.ParentScheduleIdLists.push(angular.copy(newparentSchedule));
        JsonHandler.clearAllLevelFields(newparentSchedule);
        //$scope.formatingDate(schedule, schedule.Trigger.triggerDate);        
    };


    $scope.showShiftOnSelect = function (_id, _shift) {
        if (_shift == null) {
            return
        }
        if (_shift.ParentScheduleIdLists == null) {
            _shift.ParentScheduleIdLists = [];
        }

        var _list = _shift.ParentScheduleIdLists;

        for (var i = 0; i < _list.length; i++) {
            if (_list[i].parentScheduleBindId == _id) {
                return false;
            };
        };
        return true;
    }

    /**
    * Get a parent schedule NAME for display
    * @param {type} parentScheduleId 
    * @returns {String} scheduleName
    */
    $scope.getParentScheduleNameForDisplay = function (parentScheduleId) {
        var _id = parentScheduleId.parentScheduleBindId
        var schedule = $scope.shiftsList;
        var name = '';
        for (var i = 0; i < schedule.length; i++) {
            if (schedule[i].scheduleId == _id) {
                name = schedule[i].scheduleName;
            };
        };
        return name;
    };

    /**
     * Remove a parentScheduleId from exception
     * @param {type} schedule 
     * @param {type} break 
     * @returns {undefined}
     */
    $scope.removeParentScheduleFromException = function (schedule, newparentSchedule) {
        var newArray = schedule.ParentScheduleIdLists.filter(function (el) {
            return el.parentScheduleBindId !== newparentSchedule.parentScheduleBindId;
        });
        schedule.ParentScheduleIdLists = newArray;
        //$scope.formatingDate(schedule, schedule.Trigger.triggerDate);        
    };

    $scope.removeThingFromTurno = function (thingListArray, newThing) {
        var newArray = thingListArray.ThingLists.filter(function (el) {
            return el.thingId !== newThing.thingId;
        });
        thingListArray.ThingLists = newArray;
    };

    /**
     * Add a break to schedule
     * @param {type} schedule 
     * @param {type} newBreak 
     * @returns {undefined}
     */

    $scope.addBreakToSchedule = function (schedule, newBreak) {
        // console.log(schedule);
        // console.log(newBreak);

        if (schedule.Trigger.Breaks === undefined)
            schedule.Trigger.Breaks = [];
        schedule.Trigger.Breaks.push(angular.copy(newBreak));
        JsonHandler.clearAllLevelFields(newBreak);
    };

    /**
     * Remove a break from schedule
     * @param {type} schedule 
     * @param {type} break 
     * @returns {undefined}
     */
    $scope.removeBreakFromSchedule = function (schedule, newBreak) {
        var newArray = schedule.Trigger.Breaks.filter(function (el) {
            return el.description !== newBreak.description;
        });
        schedule.Trigger.Breaks = newArray;
    };



    /**
    * Verify schedule is exception-work for the checkbox
    * @param {type} schedule
    */
    $scope.exceptionTypeWork = function (schedule) {
        if (schedule.scheduleType == 'exception-work')
            return true;
        else
            return false;
    }

    /**
      * Exclui uma meta
      * @param {type} meta - Meta selecionada no grid
      * @returns {undefined}
      */
    $scope.deleteException = function (exception) {
        // console.log("$scope.deleteException: " + describeObject(exception));

        var deleteExceptionFail = function (error) {
            // console.log(describeObject(error));
            alert(describeObject(error));
        };

        var deleteExceptionSuccess = function (response) {
            $scope.readAllSchedules();
        };

        portsAPI.deleteSchedules(exception.scheduleId).success(function (response) {
            deleteExceptionSuccess(response);
        }).error(function (error) {
            deleteExceptionFail(error);
        });
    };

    $scope.selectedToDelete = {};

    /**
    * Exclui uma meta
    * @param {type} meta - Meta selecionada no grid
    * @returns {undefined}
    */
    $scope.deleteMeta = function (meta) {
        // console.log(meta);

        portsAPI.deleteSchedules(meta.scheduleId).success(function () {
            $scope.readAllSchedules();
        });

    };

    /**
     * Adds two numbers
     * @param {String} _id #id do Modal que vai ser aberto
     * @param {String} _msg Mensagem que vai ser mostrada no Modal 
     * @return {}
     */
    $scope.openModal = function (_id, _msg, _data) {
        console.log(_data);
        $scope.selectedToDelete = _data;
        showModal(_id, _msg);
        clearFields();
        $scope.dialogMsg = _msg;
    };

    /*
    * Clear value of newSchedule
    *
    */
    $scope.clearScheduleValue = function () {
        delete $scope.newSchedule;
    };

    /**
     * Closes the Creation Modal
     * @param {string} _id
     * @returns {undefined}
     */
    $scope.closeModal = function (_id) {
        hideModal(_id);
    };

    // No momento do carregamento da página,
    // solicita que sejam carregadas as metas
    //ok
    $scope.readAllSchedules();


    $scope.toggle = function (_id, _class) {
        collapseManager.ToggleDetail(_id, _class);
    };

    $scope.loadingSrc = imageSrc.LoadingSrc;
});

