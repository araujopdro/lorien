/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


﻿'use strict';

angular.module("cummins-supervisorio").controller("missingPartsGeneralReportCtrl", function ($scope, $http, $sce, reportUtilsService, portsAPI) {

  $scope.modelObj = null;

  var reportEndPoint = "MissingParts/General";

  var showReportContent = function (content) {
    $scope.reportContent = $sce.trustAsHtml(content);
  };

  $scope.clearInputs = function () {
    $scope.modelObj = null;
    
    $('.datepicker#missingpartsgeneral-DateFromStart').datepicker('update', '');
    $('.datepicker#missingpartsgeneral-DateAvalableEnd').datepicker('update', '');
    
    $('#report-missingpartsgeneral-SO').multiselect('deselectAll', false);
    $('#report-missingpartsgeneral-SO').multiselect('refresh');
    
    $('#report-missingpartsgeneral-PartNum').multiselect('deselectAll', false);
    $('#report-missingpartsgeneral-PartNum').multiselect('refresh');
    
    clearShopOrderAndPartNumberFields();
    
    showReportContent("<p>No content yet.</p>");
  };

  $scope.generateReport = function () {
    
    var reportContent = "<label class='text-primary' style='font-size: 1.5em;'><span class='glyphicon glyphicon-time' aria-hidden='true'></span> Aguarde...</labe1>";
    showReportContent(reportContent);
    
     if ($scope.modelObj == null)
      $scope.modelObj = {};
    
    // Get calendar's values
    $scope.modelObj.DateFromStart = $('#missingpartsgeneral-DateFromStart').datepicker('getFormattedDate');
    $scope.modelObj.DateAvalableEnd = $('#missingpartsgeneral-DateAvalableEnd').datepicker('getFormattedDate');
    
    $scope.modelObj.SO = $('#report-missingpartsgeneral-SO').val();
    $scope.modelObj.PartNum = $('#report-missingpartsgeneral-PartNum').val();
    
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
    // Calendar Date From Start
    $('.datepicker#missingpartsgeneral-DateFromStart').datepicker({
      autoclose: true,
      format: 'dd/mm/yyyy',
      language: "pt-BR",
      todayHighlight: true
    });

    console.log("Inicializou DateFromStart");
    
    // Calendar Date Avalable End
    $('.datepicker#missingpartsgeneral-DateAvalableEnd').datepicker({
      autoclose: true,
      format: 'dd/mm/yyyy',
      language: "pt-BR",
      todayHighlight: true
    });

    console.log("Inicializou DateAvalableEnd");
    
    // Select combo SO
    $('#report-missingpartsgeneral-SO').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200
    });

    console.log("Inicializou ShopOrders combobox");
    
    // Select combo PartNum
    $('#report-missingpartsgeneral-PartNum').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200
    });

    console.log("Inicializou PartNumbers combobox");
  };
  
  var clearShopOrderAndPartNumberFields = function () {
    console.log("Fired clearShopOrderAndPartNumberFields");
    $('#report-missingpartsgeneral-SO').multiselect('disable');
    $('#report-missingpartsgeneral-PartNum').multiselect('disable');
    loadPartNumbers();
    loadShopOrders();
  };
  
  /**
   * Loads Shop Orders
   * @returns {undefined}
   */
  var loadShopOrders = function () {

    var onSuccessLoadShopOrders = function (response) {

      console.log("Fired onSuccessLoadShopOrders");

      var data = response.data;

      var options = new Array();

      options.push({
        label: "All",
        title: "All",
        value: "--All--"
      });
      
      for (var i = 0; i < data.length; i++) {
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }

      $('#report-missingpartsgeneral-SO').multiselect('dataprovider', options);
    };

    var onFailLoadShopOrders = function (response) {
      console.log("Fired onFailLoadShopOrders");
      alert("Falhou ao buscar os valores de ShopOrders para o combobox.");
    };

    var urlSO = portsAPI.getReportsAPI() + "/MissingParts/GetShopOrders";

    console.log("URL SO: " + urlSO);

    $http({method: 'GET', url: urlSO}).then(onSuccessLoadShopOrders, onFailLoadShopOrders);
  };
  
  /**
   * Loads Part Numbers
   * @returns {undefined}
   */
  var loadPartNumbers = function () {

    var onSuccessPartNumbers = function (response) {

      console.log("Fired onSuccessPartNumbers");

      var data = response.data;

      var options = new Array();

      options.push({
        label: "All",
        title: "All",
        value: "--All--"
      });
      
      for (var i = 0; i < data.length; i++) {
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }

      $('#report-missingpartsgeneral-PartNum').multiselect('dataprovider', options);
    };

    var onFailPartNumbers = function (response) {
      console.log("Fired onFailPartNumbers");
      alert("Falhou ao buscar os valores de PartNumbers para o combobox.");
    };

    var urlSO = portsAPI.getReportsAPI() + "/MissingParts/GetPartNumbers";

    console.log("URL SO: " + urlSO);

    $http({method: 'GET', url: urlSO}).then(onSuccessPartNumbers, onFailPartNumbers);
  };
  
  // Initialiezes calendar objects
  initializeFrontObjects();
  
  loadShopOrders();
loadPartNumbers();

  $scope.clearInputs();
});