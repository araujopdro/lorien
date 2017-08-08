'use strict';

//--------------------------------//
//--- $routeProvider
//-- Config que cria as rotas para os entereços HTML e manda
//para o display na NG-VIEW
//--------------------------------//

angular.module("cummins-supervisorio").config(function ($routeProvider) {
    $routeProvider
    .when("/login", {
        templateUrl: "loginForm.html",
        controller: "indexCtrl"
    })

    .when("/home", {
        templateUrl: "home.html",
        controller: "indexCtrl"
    })

    .when("/users", {
        templateUrl: "cadastro/userGeneral.html",
        controller: "gruposUsuarioCtrl"
    })

    .when("/groups", {
        templateUrl: "cadastro/gruposUsuariosGeral.html",
        controller: "gruposUsuarioCtrl"
    })

    .when("/things", {
        templateUrl: "cadastro/thingForm.html",
        controller: "thingsCtrl"
    })

    .when("/display", {
        templateUrl: "displayGeneral.html",
        controller: "profileCtrl"
    })

    .when("/profiles", {
        templateUrl: "profileGeneral.html",
        controller: "profileCtrl"
    })

    .when("/parts", {
        templateUrl: "missingParts.html",
        controller: "partsCtrl"
    })

    .when("/tileConfig", {
        templateUrl: "producao/tileConfig.html",
        controller: "tileCtrl"
    })

    .when("/tileDisplay", {
        templateUrl: "producao/shared/dashboard.html",
        controller: "tileDisplayCtrl"
    })

    .when("/gridConfig", {
        templateUrl: "producao/gridConfig.html",
        controller: "gridsCtrl"
    })

    .when("/gridDisplay", {
        templateUrl: "producao/shared/dashboard.html",
        controller: "gridDisplayCtrl"
    })

    .when("/metas", {
        templateUrl: "goalForm.html",
        controller: "goalsCtrl"
    })

    .when("/turnos", {
        templateUrl: "turnoForm.html",
        controller: "turnosCtrl"
    })

         //*Thais*
    .when("/groupMails", {
        templateUrl: "groupMails.html",
        controller: "groupMailsCtrl"
    })

        //Francisco
        .when("/stateMonitors", {
            templateUrl: "stateMonitorForm.html",
            controller: "stateMonitorCtrl"
        })
		
		.when("/partspreview", {
            templateUrl: "missingPartPreviewForm.html",
            controller: "partsPreviewCtrl"
        })
		
		//<!-- *CICERO* START -->
          .when("/missingPartsGeneral", {
            templateUrl: "reports/missingPartsGeneralReportForm.html",
            controller: "missingPartsGeneralReportCtrl"
          })
          .when("/missingPartsConsolidated", {
            templateUrl: "reports/missingPartsConsolidatedReportForm.html",
            controller: "missingPartsConsolidatedReportCtrl"
          })
          .when("/lineSets", {
            templateUrl: "reports/lineSetsReportForm.html",
            controller: "lineSetsReportCtrl"
          })
          .when("/cycleTimeWorkStation", {
            templateUrl: "reports/cycleTimeWorkStationReportForm.html",
            controller: "cycleTimeWorkStationReportCtrl"
          })
          .when("/cycleTimeLine", {
            templateUrl: "reports/cycleTimeLineReportForm.html",
            controller: "cycleTimeLineReportCtrl"
          })
          .when("/statisticsStation", {
            templateUrl: "reports/statisticsStationReportForm.html",
            controller: "statisticsStationReportCtrl"
          })
          .when("/wip-report", {
            templateUrl: "reports/wipReportForm.html",
            controller: "wipReportCtrl"
          })
          .when("/missing-parts-preview", {
            templateUrl: "reports/missingPartsPreviewReportForm.html",
            controller: "missingPartsPreviewReportCtrl"
          })
          //<!-- *CICERO* END -->

    .otherwise({ redirectTo: '/login' });
});