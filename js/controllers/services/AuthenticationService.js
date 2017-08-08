
//--------------------------------//
//--- AuthenticationService
//-- Factory que trabalha com a autenticação do usuário
//-- N
//--------------------------------//

angular.module("cummins-supervisorio").factory('AuthenticationService', function ($http, $cookieStore, $rootScope, $location, portsAPI, $base64) {
    var service = {};

    //--------------------------------//
    //--- AuthenticationService.Login
    //-- Função que recebe os dados do usuário, faz a autenticação
    //e redireciona o usuário em caso de sucesso
    //--------------------Username
    //--------------------Senha
    //--------------------Endereço para onde o usuário vai ser direcionado
    //--------------------caso o login tenha sucesso
    //-- N
    //--------------------------------//
    service.Login = function (username, password, redirectTo) {
        $http.defaults.headers.common.Authorization = "Basic " + $base64.encode(username + ":" + password);
        console.log($base64.encode(username + ":" + password));
        portsAPI.setUserCredentials(username).success(function (response) {
            service.SetCredentials(username, response.fullName, password);
            $location.path(redirectTo);
        });

        $http.defaults.headers.common.Authorization = 'Basic ';
    };

    

    //--------------------------------//
    //--- AuthenticationService.Set
    //-- Função que salva os dados do usuário caso o Login
    //tenha sucesso
    //--------------------Username -- fornecido por Login
    //--------------------Senha -- fornecido por Login
    //-- N
    //--------------------------------//
    
    service.SetCredentials = function (username, fullname, password) {
        var authdata = $base64.encode(username + ":" + password);
            $rootScope.globals = {
                currentUser: {
                    name: fullname,
                    username: username,
                    authdata: authdata
                }
            };

            $http.defaults.headers.common.Authorization = "Basic " + $base64.encode(username + ":" + password);
            $cookieStore.put('globals', $rootScope.globals);
    };

    //--------------------------------//
    //--- AuthenticationService.Set
    //-- Função que apaga os dados do usuário
    //-- N
    //--------------------------------//


    service.ClearCredentials = function () {
        $rootScope.globals = {};
        $cookieStore.remove('globals');
        $http.defaults.headers.common.Authorization = 'Basic ';
        $location.path('/login');
        console.log('Clear Credentials');
    };

    return service;

});