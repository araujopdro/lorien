'use strict';
var configGlobal;

var interceptor = function ($q, $location, interceptorManager) {
    return {
        request: function (config) {
            configGlobal = config;
            //console.log(config);
            if (!config.url.match('http://SERVTI:8099/api/cache/'))
                $("#loadingModal").show();
            return config;
        },
        response: function (response) {
            $("#loadingModal").hide();
            if (configGlobal.url != 'loginForm.html' && configGlobal.url != 'home.html')
                $("#erroModal").hide();
            return response;
        },
        responseError: function (rejection) {
            $("#loadingModal").hide();

            if (rejection.status === 403) {
                $location.path('/home');
                $("#erroModal").show();
                $('#error-msg').text('Você não tem permissão para acessar essa tela');
            }
            else if (rejection.status === 401) {
                $location.path('#/login');
                $("#erroModal").show();
                $('#error-msg').text('Login e/ou senha inválidos');
            }
            else if (rejection.status !== 404) {
                if (rejection.config.timeout.abortedStatus)
                    return;
                $("#erroModal").show();
                $('#error-msg').text('Erro: Falha na comunicação com o servidor. Tente atualizar a página');
            }

            return $q.reject(rejection);
        }
    };
};




angular.module("cummins-supervisorio", ['ngRoute', 'ngCookies', 'ui.bootstrap', 'mp.colorPicker', 'ngMessages', 'ngMaterial', 'mdColorPicker', 'ngMask', 'base64'])
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push(interceptor);
        })

        //--------------------------------//
        //--- Diretiva 'Last Item'
        //-- Diretiva que chama a função Front quando o último item do
        // ng-repeat em questão é carregado
        //-- Pedro?
        //--------------------------------//
        .directive('lastItem', function () {
            return function (scope) {
                if (scope.$last) {
                    scope.dataLoading = false;
                }
            };
        })
        .directive('lastTile', function () {
            console.log('not the last')
            return function (scope) {
                if (scope.$last) {
                    alert('Last');
                }
            };
        })
        //--------------------------------//
        //--- Run
        //-- Check se o usuário já está logado
        //-- N
        //--------------------------------//

        .run(['$rootScope', '$location', '$cookieStore', '$http',
            function ($rootScope, $location, $cookieStore, $http) {
                $rootScope.regex = '^[a-zA-Z0-9]+$';

                // Keep user logged in after page refresh
                $rootScope.globals = $cookieStore.get('globals') || {};
                if ($rootScope.globals.currentUser) {
                    $http.defaults.headers.common['Authorization'] = 'Basic ' + $rootScope.globals.currentUser.authdata; // jshint ignore:line
                }
            }])

       .config(function ($mdThemingProvider) {
           $mdThemingProvider.theme('default')
             .primaryPalette('grey')
             .accentPalette('blue-grey');
       })
       .config(['$compileProvider', function ($compileProvider) {
           $compileProvider.aHrefSanitizationWhitelist(/^\s*(|blob|):/);
       }]);