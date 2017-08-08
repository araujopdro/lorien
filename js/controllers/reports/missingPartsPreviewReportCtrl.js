/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


﻿'use strict';

angular.module("cummins-supervisorio").controller("missingPartsPreviewReportCtrl", function ($scope, $http, $sce, reportUtilsService, portsAPI) {

  $scope.modelObj = null;

  var reportEndPoint = "MissingPartsPreview/General";

  var showReportContent = function (content) {
    $scope.reportContent = $sce.trustAsHtml(content);
  };

  $scope.clearInputs = function () {
    $scope.modelObj = null;
    
    $('.datepicker#missing-parts-preview-From').datepicker('update', '');
    $('.datepicker#missing-parts-preview-To').datepicker('update', '');
    
    $('#missing-parts-preview-Field').multiselect('deselectAll', false);
    $('#missing-parts-preview-Field').multiselect('refresh');
    
    $("input[name=missing-parts-preview-Active][value='BOTH']").prop("checked",true);
    $("input[name=missing-parts-preview-Supplied][value='BOTH']").prop("checked",true);

    showReportContent("<p>No content yet.</p>");
  };

  $scope.generateReport = function () {
    
    var reportContent = "<label class='text-primary' style='font-size: 1.5em;'><span class='glyphicon glyphicon-time' aria-hidden='true'></span> Aguarde...</labe1>";
    showReportContent(reportContent);
    
     if ($scope.modelObj == null)
      $scope.modelObj = {};
    
    $scope.modelObj.PartNum = $('#missing-parts-preview-PartNum').val();
    $scope.modelObj.Supplier = $('#missing-parts-preview-Supplier').val();
    $scope.modelObj.Planner = $('#missing-parts-preview-Planner').val();
    $scope.modelObj.Departure = $('#missing-parts-preview-Departure').val();

    $scope.modelObj.Active = $("input[name='missing-parts-preview-Active']:checked").val();
    $scope.modelObj.Supplied =$("input[name='missing-parts-preview-Supplied']:checked").val();
    
    $scope.modelObj.DataField =$('#missing-parts-preview-Field').val();
    
    $scope.modelObj.DateFrom = $('#missing-parts-preview-From').datepicker('getFormattedDate');
    $scope.modelObj.DateTo = $('#missing-parts-preview-To').datepicker('getFormattedDate');
    
    console.log("modelObj: " + $scope.modelObj);
    
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
  
  var initializeFrontObjects = function ()
  {
    // Select combo LineNamesOutOfLine
    $('#missing-parts-preview-Field').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200
    });
    
      var options = new Array();
      options.push({label: "Data Prevista", title: "Data Prevista", value: "PREVIEWED_DATE"});
      options.push({label: "Nova Data Prevista", title: "Nova Data Prevista", value: "NEW_PREVIEWED_DATE"});
      options.push({label: "Data Suprida", title: "Data Suprida", value: "SUPPLIED_AT"});
      options.push({label: "Data Criação", title: "Data Criação", value: "POSTED_AT"});

      $scope.LineNamesOutOfLineList = options;

      $('#missing-parts-preview-Field').multiselect('dataprovider', options);
    
    // Calendar Date From Start
    $('.datepicker#missing-parts-preview-From').datepicker({
      autoclose: true,
      format: 'dd/mm/yyyy',
      language: "pt-BR",
      todayHighlight: true
    });

    console.log("Inicializou DateMissingFrom");
    
    // Calendar Date Avalable End
    $('.datepicker#missing-parts-preview-To').datepicker({
      autoclose: true,
      format: 'dd/mm/yyyy',
      language: "pt-BR",
      todayHighlight: true
    });
  };
  
  // Initialiezes calendar objects
  initializeFrontObjects();

  $scope.clearInputs();
});