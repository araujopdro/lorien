/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


﻿'use strict';

angular.module("cummins-supervisorio").controller("statisticsStationReportCtrl", function ($scope, $http, $sce, reportUtilsService, portsAPI) {

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
    
    $('.datepicker#report-statistics-station-InitialDate').datepicker('update', '');
    $('.datepicker#report-statistics-station-FinalDate').datepicker('update', '');

    $('#report-statistics-station-WS').multiselect('deselectAll', false);
    $('#report-statistics-station-WS').multiselect('refresh');
    
    $('#report-statistics-station-SO').multiselect('deselectAll', false);
    $('#report-statistics-station-SO').multiselect('refresh');
    
    $('#report-statistics-station-Family').multiselect('deselectAll', false);
    $('#report-statistics-station-Family').multiselect('refresh');

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

    // Get calendar's values
    $scope.modelObj.InitialDate = $('#report-statistics-station-InitialDate').datepicker('getFormattedDate');
    $scope.modelObj.FinalDate = $('#report-statistics-station-FinalDate').datepicker('getFormattedDate');

    // Get combos' values
    $scope.modelObj.WS = $('#report-statistics-station-WS').val();
    $scope.modelObj.SO = $('#report-statistics-station-SO').val();
    $scope.modelObj.Family = $('#report-statistics-station-Family').val();

    var queryParameters = reportUtilsService.generateQueryParametersFromModelObject($scope.modelObj);

    var url = portsAPI.getReportsAPI() + "/Statistics/Station" + queryParameters;

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
   * Load avalable WorkStations
   * @returns {undefined}
   */
  var loadAvalableWorkStations = function () {

    var onSuccessLoadAvalableWorkStations = function (response) {

      console.log("Fired onSuccessLoadAvalableWorkStations");

      var data = response.data;

      var options = new Array();

      for (var i = 0; i < data.length; i++) {
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }
      
      $scope.WorkStationsList = options;

      $('#report-statistics-station-WS').multiselect('dataprovider', options);
    };

    var onFailLoadAvalableWorkStations = function (response) {
      console.log("Fired onFailLoadAvalableWorkStations");
      alert("Falhou ao buscar os valores de Workstations para o combobox.");
    };

    var url = portsAPI.getReportsAPI() + "/Statistics/GetWorkStations";

    console.log("URL WS: " + url);

    $http({method: 'GET', url: url}).then(onSuccessLoadAvalableWorkStations, onFailLoadAvalableWorkStations);
  };

   /**
   * Do a Ping on server
   * If the response is ok,
   * do other requests
   * @returns {undefined}
   */
    var startWithPing = function () {

    var onSuccess = function (response) {
      loadAvalableWorkStations();
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
  
  /**
   * This method clears the values on comboboxes
   * @returns {undefined}
   */
  var clearShopOrderAndFamilyFields = function () {
    console.log("Fired clearShopOrderAndFamilyFields");
    $('#report-statistics-station-Family').multiselect('disable');
    $('#report-statistics-station-SO').multiselect('disable');
  };

  /**
   * Initializes the calendar objects
   * @returns {undefined}
   */
  var initializeFrontObjects = function ()
  {
    // Calendar Initial Date
    $('.datepicker#report-statistics-station-InitialDate').datepicker({
      autoclose: true,
      format: 'dd/mm/yyyy',
      language: "pt-BR",
      todayHighlight: true
    });
    
    // Calendar Inital Date calls when his date changes
    $('.datepicker#report-statistics-station-InitialDate').datepicker().on("changeDate", function (e) {
      clearShopOrderAndFamilyFields();
    });

    console.log("Inicializou InitialDate");

    // Calendar Final Date
    $('.datepicker#report-statistics-station-FinalDate').datepicker({
      autoclose: true,
      format: 'dd/mm/yyyy',
      language: "pt-BR",
      todayHighlight: true
    });
    
    // Calendar Final Date calls when his date changes
    $('.datepicker#report-statistics-station-FinalDate').datepicker().on("changeDate", function (e) {
      clearShopOrderAndFamilyFields();
    });

    console.log("Inicializou FinalDate");

    // Select combo WS
    $('#report-statistics-station-WS').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200,
      onChange: function(option, checked, select) {
                clearShopOrderAndFamilyFields();
            }
    });
    
    console.log("Inicializou WS select");

    // Select combo SO
    $('#report-statistics-station-SO').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200
    });

    console.log("Inicializou SO select");

    // Select combo Family
    $('#report-statistics-station-Family').multiselect({
      numberDisplayed: 1,
      nSelectedText: " selecionados",
      buttonWidth: "100%",
      maxHeight: 200
    });

    console.log("Inicializou Family select");
  };

  /**
   * Loads Shop Orders and Families
   * @returns {undefined}
   */
  $scope.loadShopOrdersAndFamilies = function () {

    var selectedWS = $('#report-statistics-station-WS').val();
    var initialDate = $('#report-statistics-station-InitialDate').datepicker('getFormattedDate');
    var finalDate = $('#report-statistics-station-FinalDate').datepicker('getFormattedDate');
    
    if(selectedWS == null){
      alert("Selecione a WorkStation");
      return;
    }
    
    if(initialDate == null || initialDate === ""){
      alert("Selecione a Data Inicial");
      return;
    }
    
    if(finalDate == null || finalDate === ""){
      alert("Selecione a Data Final");
      return;
    }
    
    console.log("Selected WS: " + selectedWS);

    var onSuccessLoadShopOrders = function (response) {

      console.log("Fired onSuccessLoadShopOrders");

      var data = response.data;

      var options = new Array();

      for (var i = 0; i < data.length; i++) {
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }

      $('#report-statistics-station-SO').multiselect('dataprovider', options);
    };

    var onFailLoadShopOrders = function (response) {
      console.log("Fired onFailLoadShopOrders");
      alert("Falhou ao buscar os valores de ShopOrders para o combobox.");
    };

    var onSuccessLoadFamilies = function (response) {

      console.log("Fired onSuccessLoadFamilies");

      var data = response.data;

      var options = new Array();

      for (var i = 0; i < data.length; i++) {
        var option = {label: data[i], title: data[i], value: data[i]};
        options.push(option);
      }

      $('#report-statistics-station-Family').multiselect('dataprovider', options);
    };

    var onFailLoadFamilies = function (response) {
      console.log("Fired onFailLoadFamilies");
      alert("Falhou ao buscar os valores de ShopOrders para o combobox.");
    };

    var urlSO = portsAPI.getReportsAPI() + "/Statistics/GetShopOrders?initialDate="+initialDate+"&finalDate="+finalDate+"&workStationsList=" + selectedWS;
    var urlFamily = portsAPI.getReportsAPI() + "/Statistics/GetFamilies?initialDate="+initialDate+"&finalDate="+finalDate+"&workStationsList=" + selectedWS;

    console.log("URL SO: " + urlSO);
    console.log("URL Family: " + urlFamily);

    $http({method: 'GET', url: urlSO}).then(onSuccessLoadShopOrders, onFailLoadShopOrders);
    $http({method: 'GET', url: urlFamily}).then(onSuccessLoadFamilies, onFailLoadFamilies);
  };

  // Initialiezes calendar objects
  initializeFrontObjects();

  startWithPing();
});