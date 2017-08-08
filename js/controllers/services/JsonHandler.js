angular.module("cummins-supervisorio").factory('JsonHandler', function () {
    var service = {};

    /*
    * Coloca todos os subniveis existentes em uma mesma lista
    */
    service.getCompletedSublevelList = function (list, sublevelProperty) {
        var CompletedSublevelList = [];
        list.map(function (a) {
            var subLevelListItem = a[sublevelProperty];
            CompletedSublevelList = CompletedSublevelList.concat(subLevelListItem);
        });
        return CompletedSublevelList;
    };

    /*
    * Verifica se determinado item existe em um sublevel
    * Se retornar -1 é porque não existe. Qualquer outro valor apresenta o index no qual está o elemento dentro da lista
    */
    service.checkIfItemExistsInSublevel = function (level, sublevel, sublevelName, sublevelPropertyId) {
        var index = level[sublevelName].map(function (e) {
            return e[sublevelPropertyId];
        }).indexOf(sublevel[sublevelPropertyId]);
        return index;
    };

    /*
    * Verifica se o objeto existe dentro do array com base no nome de uma propriedade
    * Se não existir uma regra de exceção, ignorar os dois últimos parâmtros
    */
    service.checkIfItemExistsInArray = function (array, propertyName, propertyValue, exceptionPropertyName, exceptionPropertyValue) {
        var found = false;
        for (var i = 0; i < array.length; i++) {
            if (array[i][propertyName] == propertyValue &&
                (array[i][exceptionPropertyName] == undefined || array[i][exceptionPropertyName] != exceptionPropertyValue)) {
                found = true;
                break;
            }
        }
        return found;
    }


    /*
    * Remove um determinado item de um sublevel
    */
    service.removeSublevel = function (level, sublevel, sublevelName, sublevelPropertyId) {
        var index = service.checkIfItemExistsInSublevel(level, sublevel, sublevelName, sublevelPropertyId)
        level[sublevelName].splice(index, 1);
    };

    /*
    * Limpa todas as propriedades de um determinado level
    * Util para zerar um JSON ou parte dele (as keys continuam existindo porém com valor nulo
    */
    service.clearAllLevelFields = function (level) {
        for (var p in level)
            if (level.hasOwnProperty(p))
                level[p] = '';
    };

    /*
    * Compara dois arrays de objetos para ver se são identicos
    */
    service.arraysEqual = function (arr1, arr2) {
        if (arr1.length !== arr2.length)
            return false;
        for (var i = arr1.length; i--;) {
            if (arr1[i] !== arr2[i])
                return false;
        }
        return true;
    };

    return service;
});
