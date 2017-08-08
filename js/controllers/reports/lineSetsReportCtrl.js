/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


﻿'use strict';

angular.module("cummins-supervisorio").controller("lineSetsReportCtrl", function ($scope, $http, $sce, reportUtilsService, portsAPI) {

  $scope.modelObj = null;

  var reportEndPoint = "LineSets";

  var showReportContent = function (content) {
    $scope.reportContent = $sce.trustAsHtml(content);
  };

  $scope.clearInputs = function () {
    $scope.modelObj = null;
    showReportContent("<p>No content yet.</p>");
  };

  $scope.generateReport = function () {
    
    var reportContent = "<label class='text-primary' style='font-size: 1.5em;'><span class='glyphicon glyphicon-time' aria-hidden='true'></span> Aguarde...</labe1>";
    showReportContent(reportContent);

    console.log($scope.modelObj);

    var queryParameters = reportUtilsService.generateQueryParametersFromModelObject($scope.modelObj);

    var url = portsAPI.getReportsAPI() + "/" + reportEndPoint + queryParameters;

    console.info("Report URL: " + url);
    
    var onSuccessGetReport = function (response) {
      console.log("Fired onSuccessGetReport");
      var reportContent = reportUtilsService.injectReportAPIUrlOnReportViewerResult(response.data);
      showReportContent(reportContent);
    };

    var onFailGetReport = function (response) {
      console.log("Fired onFailGetReport");
      var msg = "Erro ao gerar o relatório: " + response.status + ": " + response.statusText;
      var reportContent = "<label class='text-danger' style='font-size: 1.5em;'><span class='glyphicon glyphicon-remove-circle' aria-hidden='true'></span> " + msg + "</labe1>";
      showReportContent(reportContent);
    };

    $http.get(url).then(function (response) {
      if (response.status === 200)
        onSuccessGetReport(response);
      else
        onFailGetReport(response);
    }, function (response) {
      onFailGetReport(response);
    });
  };

  $scope.clearInputs();
});