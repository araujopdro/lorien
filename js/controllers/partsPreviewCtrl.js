'use strict';

angular.module("cummins-supervisorio").controller("partsPreviewCtrl", function ($scope, portsAPI, collapseManager, imageSrc, orderByManagement) {
    /**
     * Declaração das variáveis globais do controller
     */
    $scope.partsPreviewList = [];

    $scope.partPreview = {};
    //$scope.supplied = false;

    /**
    * Realiza o carregamento de todas as previsões de peças faltantes
    * @returns {undefined}
    */
    var getAllPartPreviews = function () {
        // Callback de erro do carregamento das metas
        var getPartPreviewsFail = function (error) {
            console.log(describeObject(error));
        };

        // Callback de sucesso do carregamento das metas
        var getPartPreviewsSuccess = function (response) {
            $scope.partsPreviewList = response;
        };

        portsAPI.getPartPreview().success(function (response) {
            getPartPreviewsSuccess(response);
        }).error(function (error) {
            PreviewsFail(error);
        });
    };

    /**
     * When the user expand the content, this function makes a copy
     * of the passed partPreview, and display it, so the user can
     * change the schedule information.
     * @param {type} schedule
     * @returns {undefined}
     */
    $scope.selectPartPreview = function (partPreview) {
        $scope.partPreview = angular.copy(partPreview);
    };


    /*
   * Clear value of partPreview
   *
   */

    var clearPartPreview = function () {
        delete $scope.partPreview ;
        $scope.partPreview = {};
    };

    $scope.clearPartPreview = clearPartPreview();

  
    /**
   * General partPreview Creation
   * @param {type} partPreview
   */
    $scope.createPartPreview = function (_partPreview) {
        //_partPreview.supplied = 'false';
        //_partPreview.postedUserName = 'USER atual' //Precisa buscar dos cookies ou do service

        console.log(_partPreview);

        var postPartPreviewFail = function (error) {
            console.log(describeObject(error));
        };

        var postPartPreviewSuccess = function (response) {
            getAllPartPreviews();
        };

        portsAPI.postPartPreview(_partPreview).success(function (response) {
            postPartPreviewSuccess(response);
        }).error(function (error) {
            postPartPreviewFail(error);
        });

        clearPartPreview();
        clearFields();
    };

    /**
  * Update partPreview 
  * @param {type} partPreview
  */
    $scope.updatePartPreview = function (_partPreview) {
        //console.log(supplied);

        //if (supplied) {
        //    _partPreview.supplied = 'true';
        //    //_partPreview.suppliedUserName = 'USER atual' //Precisa buscar dos cookies ou do service
        //}
        //else
        //    _partPreview.supplied = 'false';

        //console.log(_partPreview);

        var putPartPreviewFail = function (error) {
            console.log(describeObject(error));
        };

        var putPartPreviewSuccess = function (response) {
            getAllPartPreviews();
        };

        portsAPI.putPartPreview(_partPreview.partId, _partPreview).success(function (response) {
            putPartPreviewSuccess(response);
        }).error(function (error) {
            putPartPreviewFail(error);
        });

        clearPartPreview();
        clearFields();
    };

    /**
    * Deletes a partPreview
    * @param {type} shift
    * @returns {undefined}
    */
    $scope.deletePartPreview = function (partPreview) {
        var deletePartPreviewFail = function (error) {
            console.log(describeObject(error));
            alert(describeObject(error));
        };

        var deletePartPreviewSuccess = function (response) {
            getAllPartPreviews();
        };

        portsAPI.deletePartPreview(partPreview.partId).success(function (response) {
            deletePartPreviewSuccess(response);
        }).error(function (error) {
            deletePartPreviewFail(error);
        });

        clearPartPreview();
        clearFields();
    };

    /**
    Verify if checkbox must be checked for that element
    */

    //$scope.checkSupplied = function (_partPreview) {
    //    if (_partPreview) {
    //        if (_partPreview.supplied == 'true')
    //            return true;
    //        else
    //            return false;
    //    }
    //};

    /**
 * Changes the order of the displayed lines
 * @param {string} field
 * @param {string} _id
 * @returns {undefined}
 */
    $scope.orderBy = function (field, _id) {
        orderByManagement.orderBy($scope, field, _id);
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


    /**
    * Open Modal
    * @param {String} _id #id do Modal que vai ser aberto
    * @param {String} _msg Mensagem que vai ser mostrada no Modal 
    * @return {}
    */
    $scope.openModal = function (_id, _msg, _data) {
        $scope.selectedToDelete = _data;
        showModal(_id, _msg);
        $scope.dialogMsg = _msg;
    };

    /**
 * Closes Modal
 * @param {string} _id
 * @returns {undefined}
 */
    $scope.closeModal = function (_id) {
        hideModal(_id);
    };


    /*
    Toggle Details
    */
    $scope.toggle = function (_id, _class) {
        collapseManager.ToggleDetail(_id, _class);
    };

    /*
    * Calendar
    */
    $scope.dateFilter = function (partPreview, _modelDate) {
        var date = moment(_modelDate).format('DD/MM/YYYY');
        partPreview.previewedDate = date;

    };

    $scope.newDateFilter = function (partPreview, _modelDate) {
        var date = moment(_modelDate).format('DD/MM/YYYY');
        partPreview.newPreviewedDate = date;
    };

    $scope.formatDatabaseDate = function (_partPreview) {
        if (_partPreview)
            return moment(_partPreview.postedEventTime).format('DD/MM/YYYY');
    }

    getAllPartPreviews();
});