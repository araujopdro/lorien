/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */


﻿angular.module("cummins-supervisorio").factory("reportUtilsService", function (portsAPI) {

    function ReportUtilsService() {

        this.injectReportAPIUrlOnReportViewerResult = function (iframeContent) {
            iframeContent = iframeContent.replace('src="/', 'src="' + portsAPI.getReportsAPI() + "/");
            return iframeContent;
        };

        this.generateQueryParametersFromModelObject = function (modelObj) {

            if(typeof modelObj === 'undefined' || modelObj === null) modelObj = {};
    
            // To avoid cache.
            // Every request receives a key named ticks with the current timestamp.
            modelObj.ticks = new Date().getTime();
            
            var first = true;
            var queryParameters = "";

            for (var key in modelObj) {
                if (key === null || key === "")
                    continue;

                var value = modelObj[key];

                if (value === null || value === "")
                    continue;

                if (first === true)
                    queryParameters += "?";
                else
                    queryParameters += "&";

                queryParameters += key + "=" + value;

                first = false;
            }

            return queryParameters;
        };
    }

    // Return an object of type ReportUtilsService
    return new ReportUtilsService();
});