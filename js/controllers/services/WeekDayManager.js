angular.module("cummins-supervisorio").factory('WeekDayManager', function (JsonHandler) {
    var service = {};

    /**
     * Adiciona ( se checkbox está marcado ) ou remove ( se checkbox não está marcado) um dia da semana
     * @param {bool} checked - Se checkbox está marcado:
     * @param {type} weekDayName - Dia da semana a ser adicionado na lista
     * @returns {undefined}
     */
    var addOrRemoveWeekDayToWeekDaysList = function (parent, weekDayName, weekDayListPropertyName) {
        if (parent[weekDayListPropertyName] === undefined || parent[weekDayListPropertyName] === '')
            parent[weekDayListPropertyName] = new Array();

        //Verifica indice do elemento 
        var index = parent[weekDayListPropertyName].map(function (e) {
            return e.weekDayName;
        }).indexOf(weekDayName);

        if (index === -1)
            parent[weekDayListPropertyName].push({ "weekDayName": weekDayName });
        else {
            parent[weekDayListPropertyName].splice(index, 1);
        }
    };

    service.addOrRemoveWeekDayToWeekDaysList = addOrRemoveWeekDayToWeekDaysList;

    /**
    * Select/Unselect all weekDays
    * @param {type} schedule
    * @returns bool
    */
    service.selectUnselectAllweekDays = function (parent, weekDayListPropertyName) {
        if (parent !== undefined) {            
            if (parent[weekDayListPropertyName] === undefined || parent[weekDayListPropertyName] === '')
                parent[weekDayListPropertyName] = new Array();

            if (parent[weekDayListPropertyName].length == 7) {
                parent[weekDayListPropertyName] = [];
                return false;
            }
            else {
                parent[weekDayListPropertyName] = new Array();
                addOrRemoveWeekDayToWeekDaysList(parent, 'sunday', weekDayListPropertyName);
                addOrRemoveWeekDayToWeekDaysList(parent, 'monday', weekDayListPropertyName);
                addOrRemoveWeekDayToWeekDaysList(parent, 'tuesday', weekDayListPropertyName);
                addOrRemoveWeekDayToWeekDaysList(parent, 'wednesday', weekDayListPropertyName);
                addOrRemoveWeekDayToWeekDaysList(parent, 'thursday', weekDayListPropertyName);
                addOrRemoveWeekDayToWeekDaysList(parent, 'friday', weekDayListPropertyName);
                addOrRemoveWeekDayToWeekDaysList(parent, 'saturday', weekDayListPropertyName);
                return true;
            }
        }
    };

    /**
    * Checks if weekDay is in a schedule object, to determine if checkbox must be checked 
    * @param {type} schedule, weekDayName
    * @returns bool
    */
    var containsWeekDay = function (parent, _weekDayName, weekDayListPropertyName) {

        if (parent !== undefined && parent !== null) {
            var emptySchedule = (Object.keys(parent).length === 0 && parent.constructor === Object);
            if (!emptySchedule) {
                var weekDayObj = {
                    "weekDayName": _weekDayName
                }

                if (parent !== undefined && parent !== null && parent[weekDayListPropertyName] !== undefined && parent[weekDayListPropertyName] !== null) {
                    if (JsonHandler.checkIfItemExistsInSublevel(parent, weekDayObj, weekDayListPropertyName, 'weekDayName') != -1)
                        return true;
                    else
                        return false;
                }
            }
        }
    };

    service.containsWeekDay = containsWeekDay;

    /**
    * Checks if all weekDays are selected in a schedule object, to determine if checkbox must be checked 
    * @param {type} schedule, weekDayName
    * @returns bool
    */
    service.containsAllWeekDays = function (parent, weekDayListPropertyName) {
        if (parent !== undefined  && parent !== undefined && parent !== null) {
            if (containsWeekDay(parent, 'sunday', weekDayListPropertyName) &&
                containsWeekDay(parent, 'monday', weekDayListPropertyName) &&
                containsWeekDay(parent, 'tuesday', weekDayListPropertyName) &&
                containsWeekDay(parent, 'wednesday', weekDayListPropertyName) &&
                containsWeekDay(parent, 'thursday', weekDayListPropertyName) &&
                containsWeekDay(parent, 'friday', weekDayListPropertyName) &&
                containsWeekDay(parent, 'saturday', weekDayListPropertyName))
                return true;
            else
                return false;
        }
    };
    return service;
});
