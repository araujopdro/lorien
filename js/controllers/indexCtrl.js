'use strict';
angular.module("cummins-supervisorio").controller("indexCtrl", function ($scope, portsAPI, AuthenticationService, imageSrc, $location, $interval, interceptorManager) {

    $scope.regexUsernamemin4max12 = "^[a-zA-Z0-9_.]{4,12}$";                                                                                                            //regex username para aceitar de 4 a 12 caracteres: ^[a-zA-Z0-9_.]{4,12}$
    $scope.regexFullnamemin3max20 = "^[a-z A-Z 0-9º àáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð]{3,30}$";               //regex para validar nome com acentos, numeros e letras de 3 a 20 caracteres: ^[a-z A-Z 0-9º àáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð]{3,20}$
    $scope.regexmin0max50 = "^[a-z A-Z 0-9º àáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð]{0,50}$";               //regex para validar nome com acentos, numeros e letras de 3 a 20 caracteres: ^[a-z A-Z 0-9º àáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð]{3,20}$
	$scope.regexPasswordmin6max12 = "^[a-zA-Z0-9*.&%$#@!?;/-_+=º;/àáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð]{6,12}$";    // regex para validação de senha de 6 a 12 caracteres sem espaço: ^[a-zA-Z0-9*&%$#@!?-_+=º;/àáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð]{6,12}$
    $scope.regexEmail = '^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$';                                                     //regex para validação do e-mail: ^([0-9a-zA-Z]+([_.-]?[0-9a-zA-Z]+)*@[0-9a-zA-Z]+[0-9,a-z,A-Z,.,-]*(.){1}[a-zA-Z]{2,4})+$
    $scope.logButton = 'Login';
    $scope.regexdescmin1max40 = "^[a-z A-Z 0-9º àáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð]{1,40}$";               //regex para validar nome com acentos, numeros e letras de 3 a 20 caracteres: ^[a-z A-Z 0-9º àáâäãåąčćęèéêëėįìíîïłńòóôöõøùúûüųūÿýżźñçčšžÀÁÂÄÃÅĄĆČĖĘÈÉÊËÌÍÎÏĮŁŃÒÓÔÖÕØÙÚÛÜŲŪŸÝŻŹÑßÇŒÆČŠŽ∂ð]{3,20}$
    $scope.regexHour = "^([01]?[0-9]|2[0-3]):[0-5][0-9]$";

    /**
     * Function, called by a button, that:
     * sends content from the input fields to the AuthenticationService.Login,
     * set the dataLoading to True, so the loding gif appears on the screen
     */
    $scope.login = function () {
        $scope.dataLoading = true;
        AuthenticationService.Login($scope.$username, $scope.$pass, '/home');
        $scope.currentLoggedUser = {
            userId: $scope.$username,
            pass: $scope.$pass
        };


        //portsAPI.getUser($scope.$username).success(function (response) {
        //    $scope.currentLoggedUser = response;
        //    console.log('Got');
        //});
    };
    
    $scope.logout = function () {
        AuthenticationService.ClearCredentials();
    };

    $scope.loadingSrc = imageSrc.LoadingSrc;
    
    /**
     * Call a Jquery function outside angular
     */
    $scope.closeErrorMessage = function(){
        hideError();
    };
	
    $scope.checkLoadingStatus = function () {
        interceptorManager.getStatus();
    };


	$scope.viewClass = 'view';
    $interval(updateTime, 400);
    function updateTime() {
        $scope.currentLocation = $location.path();
        if ($scope.currentLocation != '/tileDisplay') {
            $scope.viewClass = 'view';
        } else {
            $scope.viewClass = 'view-display-tile';
        }
    };
});
////////////Global JQuery Functions////////////////

/**
 * Hides the error modal
 */
var hideError = function(){
   $("#erroModal").hide();
};
