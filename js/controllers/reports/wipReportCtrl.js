/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


﻿'use strict';

angular.module("cummins-supervisorio").controller("wipReportCtrl", function ($scope, $http, $sce, reportUtilsService, portsAPI) {

  /**
   * Model object shared among view and controller
   */
  $scope.modelObj = {};

  /**
   * Array of WorkStations to fill the combobox
   */
  $scope.WorkStationsList = new Array();

  /**
   * Shows the report content returned by backend
   * @param {type} content
   * @returns {undefined}
   */
  var showReportContent = function (content) {
    console.log("Fired showReportContent");
    $scope.reportContent = $sce.trustAsHtml(content);
  };

  /**
   * Clear the inputed field values
   * @returns {undefined}
   */
  $scope.clearInputs = function () {
    console.log("Fired clearInputs");
    
    $scope.modelObj = null;

    $('#report-wip-LineNamesOutOfLine').multiselect('deselectAll', false);
    $('#report-wip-LineNamesOutOfLine').multiselect('refresh');
    
    $('#report-wip-WS').multiselect('deselectAll', false);
    $('#report-wip-WS').multiselect('refresh');
    
    $('#report-wip-LineWIP').multiselect('deselectAll', false);
    $('#report-wip-LineWIP').multiselect('refresh');
    
    $('#report-wip-SO').multiselect('deselectAll', false);
    $('#report-wip-SO').multiselect('refresh');
    
    $('#report-wip-WO').multiselect('deselectAll', false);
    $('#report-wip-WO').multiselect('refresh');
    
    $('#report-wip-Family').multiselect('deselectAll', false);
    $('#report-wip-Family').multiselect('refresh');
    
    $('#report-wip-StatusWIP').multiselect('deselectAll', false);
    $('#report-wip-StatusWIP').multiselect('refresh');
    
    $('#report-wip-CustomerName').multiselect('deselectAll', false);
    $('#report-wip-CustomerName').multiselect('refresh');

    showReportContent("<p>No content yet.</p>");
  };

  /**
   * Generates the report
   * @returns {undefined}
   */
  $scope.generateReport = function () {
    console.log("Fired generateReport");
    
    var reportContent = "<label class='text-primary' style='font-size: 1.5em;'><span class='glyphicon glyphicon-time' aria-hidden='true'></span> Aguarde...</labe1>";
    showReportContent(reportContent);

    if ($scope.modelObj == null)
      $scope.modelObj = {};

    // Get combos' values
    $scope.modelObj.LineNameOutOfLine = $('#report-wip-LineNamesOutOfLine').val();
    $scope.modelObj.WS = $('#report-wip-WS').val();
    $scope.modelObj.LineWIP = $('#report-wip-LineWIP').val();
    $scope.modelObj.SO = $('#report-wip-SO').val();
    $scope.modelObj.WO = $('#report-wip-WO').val();
    $scope.modelObj.Family = $('#report-wip-Family').val();
    $scope.modelObj.StatusWIP = $('#report-wip-StatusWIP').val();    
    $scope.modelObj.CustomerName = $('#report-wip-CustomerName').val();

    var queryParameters = reportUtilsService.generateQueryParametersFromModelObject($scope.modelObj);

    var url = portsAPI.getReportsAPI() + "/Wip/General" + queryParameters;

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

/**
 * Loads the WorkStations
 * @returns {undefined}
 */
var loadWorkStations = function () {

    var onSuccess = function (response) {

      console.log("Fired loadWorkStations > onSuccess");

      var data = response.data;

      var options = new Array();

      for (var i = 0; i < data.length; i++) {
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }
      
      $scope.WorkStationsList = options;

      $('#report-wip-WS').multiselect('dataprovider', options);
    };

    var onFail = function (response) {
      console.log("Fired loadWorkStations > onFail");
      var msg = "Falhou ao buscar os valores de WorkStations para o combobox.";
      checkServerReturnedStatus(response, msg);
    };

    var url = portsAPI.getReportsAPI() + "/Wip/GetWorkStations";

    console.log("URL WS: " + url);

    $http({method: 'GET', url: url}).then(onSuccess, onFail);
  };
  
  /**
   * Loads the ShopOrders
   * @returns {undefined}
   */
  var loadShopOrders = function () {

    var onSuccess = function (response) {

      console.log("Fired loadShopOrders > onSuccess");

      var data = response.data;

      var options = new Array();

      for (var i = 0; i < data.length; i++) {
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }
      
      $scope.WorkStationsList = options;

      $('#report-wip-SO').multiselect('dataprovider', options);
    };

    var onFail = function (response) {
      console.log("Fired loadShopOrders > onFail");
      var msg = "Falhou ao buscar os valores de ShopOrders para o combobox.";
      checkServerReturnedStatus(response, msg);
    };

    var url = portsAPI.getReportsAPI() + "/Wip/GetShopOrders";

    console.log("URL SO: " + url);

    $http({method: 'GET', url: url}).then(onSuccess, onFail);
  };
  
  /**
   * Loads the WorkOrders
   * @returns {undefined}
   */
    var loadWorkOrders = function () {

    var onSuccess = function (response) {

      console.log("Fired loadWorkOrders > onSuccess");

      var data = response.data;

      var options = new Array();

      for (var i = 0; i < data.length; i++) {
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }
      
      $scope.WorkStationsList = options;

      $('#report-wip-WO').multiselect('dataprovider', options);
    };

    var onFail = function (response) {
      console.log("Fired loadWorkOrders > onFail");
      var msg = "Falhou ao buscar os valores de WorkOrders para o combobox.";
      checkServerReturnedStatus(response, msg);
    };

    var url = portsAPI.getReportsAPI() + "/Wip/GetWorkOrders";

    console.log("URL WO: " + url);

    $http({method: 'GET', url: url}).then(onSuccess, onFail);
  };
  
  /**
   * Loads the Families
   * @returns {undefined}
   */
    var loadFamilies = function () {

    var onSuccess = function (response) {

      console.log("Fired loadFamilies > onSuccess");

      var data = response.data;

      var options = new Array();

      for (var i = 0; i < data.length; i++) {
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }
      
      $scope.WorkStationsList = options;

      $('#report-wip-Family').multiselect('dataprovider', options);
    };

    var onFail = function (response) {
      console.log("Fired loadFamilies > onFail");
      var msg = "Falhou ao buscar os valores de Falilies para o combobox.";
      checkServerReturnedStatus(response, msg);
    };

    var url = portsAPI.getReportsAPI() + "/Wip/GetFamilies";

    console.log("URL Family: " + url);

    $http({method: 'GET', url: url}).then(onSuccess, onFail);
  };
  
  /**
   * Loads the Customer Names
   * @returns {undefined}
   */
    var loadCustomerNames = function () {

    var onSuccess = function (response) {

      console.log("Fired loadCustomerNames > onSuccess");

      var data = response.data;

      var options = new Array();

      for (var i = 0; i < data.length; i++) {
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }
      
      $scope.WorkStationsList = options;

      $('#report-wip-CustomerName').multiselect('dataprovider', options);
    };

    var onFail = function (response) {
      console.log("Fired loadCustomerNames > onFail");
      var msg = "Falhou ao buscar os valores de CustomerNames para o combobox.";
      checkServerReturnedStatus(response, msg);
    };

    var url = portsAPI.getReportsAPI() + "/Wip/GetCustomerNames";

    console.log("URL CustomerName: " + url);

    $http({method: 'GET', url: url}).then(onSuccess, onFail);
  };
  
  /**
   * Loads the Customer Names
   * @returns {undefined}
   */
    var loadLineNamesOutOfLine = function () {

    var onSuccess = function (response) {

      console.log("Fired loadLineNamesOutOfLine > onSuccess");

      var data = response.data;

      var options = new Array();

      for (var i = 0; i < data.length; i++) {
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }
      
      $scope.LineNamesOutOfLineList = options;

      $('#report-wip-LineNamesOutOfLine').multiselect('dataprovider', options);
    };

    var onFail = function (response) {
      console.log("Fired loadLineNamesOutOfLine > onFail");
      var msg = "Falhou ao buscar os valores de LineNamesOutOfLine para o combobox.";
      checkServerReturnedStatus(response, msg);
    };

    var url = portsAPI.getReportsAPI() + "/Wip/GetLineNamesOutOfLine";

    console.log("URL LineNamesOutOfLine: " + url);

    $http({method: 'GET', url: url}).then(onSuccess, onFail);
  };
  
  
   /**
   * Loads the Customer Names
   * @returns {undefined}
   */
    var loadLinesWIP = function () {

    var onSuccess = function (response) {

      console.log("Fired loadLinesWIP > onSuccess");

      var data = response.data;

      var options = new Array();

      for (var i = 0; i < data.length; i++) {
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }
      
      $scope.LinesWIPList = options;

      $('#report-wip-LineWIP').multiselect('dataprovider', options);
    };

    var onFail = function (response) {
      console.log("Fired loadLinesWIP > onFail");
      var msg = "Falhou ao buscar os valores de Lines WIP para o combobox.";
      checkServerReturnedStatus(response, msg);
    };

    var url = portsAPI.getReportsAPI() + "/Wip/GetLinesWIP";

    console.log("URL LinesWIP: " + url);

    $http({method: 'GET', url: url}).then(onSuccess, onFail);
  };
  
  /**
   * Loads the Customer Names
   * @returns {undefined}
   */
    var loadStatusWIP = function () {

    var onSuccess = function (response) {

      console.log("Fired loadStatusWIP > onSuccess");

      var data = response.data;

      var options = new Array();

      for (var i = 0; i < data.length; i++) {
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }
      
      $scope.LinesWIPList = options;

      $('#report-wip-StatusWIP').multiselect('dataprovider', options);
    };

    var onFail = function (response) {
      console.log("Fired loadLinesWIP > onFail");
      var msg = "Falhou ao buscar os valores de Status WIP para o combobox.";
      checkServerReturnedStatus(response, msg);
    };

    var url = portsAPI.getReportsAPI() + "/Wip/GetStatusWIP";

    console.log("URL StatusWIP: " + url);

    $http({method: 'GET', url: url}).then(onSuccess, onFail);
  };
  
  /**
   * Loads the Customer Names
   * @returns {undefined}
   */
    var loadStatus = function () {

    var onSuccess = function (response) {

      console.log("Fired loadStatus > onSuccess");

      var data = response.data;

      var options = new Array();

      for (var i = 0; i < data.length; i++) {
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }
      
      $scope.WorkStationsList = options;

      $('#report-wip-StatusWIP').multiselect('dataprovider', options);
    };

    var onFail = function (response) {
      console.log("Fired loadStatus > onFail");
      var msg = "Falhou ao buscar os valores de Status para o combobox.";
      checkServerReturnedStatus(response, msg);
    };

    var url = portsAPI.getReportsAPI() + "/Wip/GetStatus";

    console.log("URL Status: " + url);

    $http({method: 'GET', url: url}).then(onSuccess, onFail);
  };
  
   /**
   * Do a Ping on server
   * If the response is ok,
   * do other requests
   * @returns {undefined}
   */
    var startWithPing = function () {

    var onSuccess = function (response) {
      loadWorkStations();
      loadShopOrders();
      loadWorkOrders();
      loadFamilies();
      loadCustomerNames();
      loadLinesWIP();
      loadStatusWIP();
      loadLineNamesOutOfLine();
    };

    var onFail = function (response) {
      // Falhou miseravelmente ao comunicar-se com o servidor
      // Um mensagem de erro será exibida pelo angular para informar
      // o usuário.
    };

    var url = portsAPI.getReportsAPI() + "/Ping/AreYouThere";

    console.log("URL Ping: " + url);

    $http({method: 'GET', url: url}).then(onSuccess, onFail);
  };
  
  var checkServerReturnedStatus = function (response, msg){
    if(response.status !== 401 && response.status !== 403) alert(msg);
  };  
  
  /**
   * Initializes the calendar objects
   * @returns {undefined}
   */
  var initializeFrontObjects = function ()
  {
    // Select combo LineNamesOutOfLine
    $('#report-wip-LineNamesOutOfLine').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200
    });
    
    // Select combo WS
    $('#report-wip-WS').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200
    });
    
    // Select combo LinesetWIP
    $('#report-wip-LineWIP').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200
    });
    
    // Select combo SO
    $('#report-wip-SO').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200
    });

    // Select combo WO
    $('#report-wip-WO').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200
    });
    
    // Select combo Family
    $('#report-wip-Family').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200
    });

    // Select combo CustoemrName
    $('#report-wip-StatusWIP').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200
    });
    
    // Select combo CustomerName
    $('#report-wip-CustomerName').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200
    });
  };

  // Initialiezes calendar objects
  initializeFrontObjects();
  
  startWithPing();
});