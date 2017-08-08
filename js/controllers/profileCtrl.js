'use strict';

/**
 * Initiate the Profile/Displays Controller on the cummins-supervisorio module
 * @param {string} profileCtrl - Controller Name
 * @param {type} function - receive all libraries, directives and APIs
 */
angular.module("cummins-supervisorio").controller("profileCtrl", function ($scope, $timeout, collapseManager, $http, AuthenticationService, portsAPI, EndpointManagement, DisplayManagement, imageSrc) {
    $scope.app = "Display";
    $scope.displayList = [];
    $scope.selectedDisplay = {};
    $scope.sysEndpoints = [];
    $scope.profileList = [];
    $scope.displayProfile = '';
    $scope.time = '';
    $scope.order = '';

    var url = '';
    var profile = '';

    ////////////////////////////////////////////////
    /////////////////// PROFILES //////////////////

    /**
    * Creates new profile.
    * First, the function sends the newProfile and displayList to an external API,
    * Then, it gets the object of a newProfile and post it through the PortsAPI
    * @param {object} newProfile
    * @returns {undefined}
    */
    $scope.createProfile = function (newProfile) {
        newProfile.status = "active";
        EndpointManagement.AddDisplayToJSON_AddedDisplays(newProfile, $scope.displayList);

        var createProfileSuccess = function (response) {
            delete $scope.newProfile;
            getProfile();
            getDisplay();
        };

        var createProfileFail = function (error) {
            //alert(error);
            delete $scope.newProfile;
        };

        portsAPI.postProfiles(newProfile).success(function (response) {
            createProfileSuccess(response);
        }).error(function (error) {
            createProfileFail(error);
        });
    };

    /**
   * Realiza o carregamento de todos os EndPoints do sistema
   * @returns {undefined}
   */
    $scope.loadEndPoints = function () {

        var loadEndPointsSuccess = function (response) {
            $scope.sysEndpoints = response;
        };

        var loadEndPointsFail = function (error) {
            //alert(error);
        };

        portsAPI.getProdEndpoints().success(function (response) {
            loadEndPointsSuccess(response);
        }).error(function (error) {
            loadEndPointsFail(error);
        });
    };

    /**
     * Return list of profiles for profiles screen and for populating the dropdown in display screen
     * @returns {undefined}
     */
    var getProfile = function () {
        $scope.dataLoading = true;
        portsAPI.getProfiles().success(function (data) {
            $scope.profileList = data;
            $scope.defaultProfile = data[0];
            $scope.dataLoading = false;
        }).error(function (data, status) {
            $scope.message = "Erro: " + data;
        });
        
    };

    /**
     * Updates the data of the passed profile through the PortsAPI
     * @param {object} selectedProfile
     * @returns {undefined}
     */
    $scope.putProfile = function (selectedProfile) {
        EndpointManagement.AddDisplayToJSON_AddedDisplays(selectedProfile, $scope.displayList);
        EndpointManagement.AddDisplayToJSON_RemovedDisplays(selectedProfile, $scope.displayList, $scope.defaultProfile);
        console.log(selectedProfile);
        portsAPI.putProfiles(selectedProfile.profileId, selectedProfile).success(function (data) {
            getDisplay();
            getProfile();
        });
    };

    $scope.deleteProfile = function (selectedProfile) {
        DisplayManagement.DeactivateProfile(selectedProfile, $scope);
        getProfile();
        getDisplay();
    };

    /**
     * Deactivates the passed profile through an external API
     * @param {object} selectedProfile
     * @returns {undefined}
     */
    $scope.disableProfile = function (selectedProfile) {        
        DisplayManagement.DeactivateProfile(selectedProfile, $scope);
        getProfile();
        getDisplay();
    };

    $scope.loadEndPoints();
    getProfile();


    ////////////////////////////////////////////////////////////////
    /////////MANIPULATE ENDPOINTS AND DISPLAYS IN PROFILE SCREEN //

    /**
     * Validates if Profile has an EndPoint
     * @param {type} sysEndpoint
     * @param {type} newProfile
     * @returns {Boolean|undefined}
     */
    $scope.hasEndpoint = function (_endpoint, _profile) {
        if (!(typeof _profile !== 'undefined'))
            return;
        if (typeof _profile['Endpoints'] == 'undefined')
            _profile['Endpoints'] = [];

        var result = _profile['Endpoints'].filter(function (el) {
            return el.displayUrl == _endpoint.displayUrl;
        });

        if (result.length >= 2) {
            return false;
        }
        return true;
    };

    /**
   * Call modal for choosing ORDER and TIME information before adding endpoint to the passed profile
   * @param {string} _url
   * @param {array} _profile
   * @returns {undefined}
   */
    $scope.addEndPointToProfile = function (_url, _profile, close) {
        if (close === 'y') {
            $(document).find(".details").hide();
        }

        url = _url;
        profile = _profile;

        showModal('orderTimeDialog');
        //EndpointManagement.PutEndpoint(_profile, _url, $scope.displayList);
    };

    /**
    **/
    $scope.confirmEndpointToProfile = function (_time, _order) {
        console.log("EndPoint");
        EndpointManagement.PutDisplayTimeOrderEndpoint(profile, url, _time, _order, $scope.displayList);
    }

    /**
     * Remove Endpoints(url) from the passed profile
     * @param {string} _url
     * @param {array} _profile
     * @returns {undefined}
     */
    $scope.removeEndpointFromProfile = function (_url, _profile) {
        console.log("entrou");
        console.log(_url);
        EndpointManagement.RemoveEndpoint(_profile, _url);
    };

    /**
     * Sets the display profileName and display profileId to passed profile name and id respectively
     * @param {object} _display
     * @param {object} _profile
     * @returns {undefined}
     */
    $scope.addDisplayToProfile_profileSide = function (_display, _profile) {
        DisplayManagement.AddDisplay(_profile, _display);
    };

    /**
     * Sets the display profileName and display profileId to default.profile name and id respectively
     * @param {object} _display
     * @param {object} _profile
     * @param {boolean} _bool
     * @returns {undefined}
     */
    $scope.removeDisplayFromProfile = function (_display, _profile) {
        DisplayManagement.RemoveDisplays(_profile, _display, $scope.defaultProfile);
    };

    /////////////////////////////////////////////////
    ///////// PROFILE - MODAL ///////////////////////


    /**
    * Open any modal
    * @param {String} _id #id do Modal que vai ser aberto
    * @param {String} _msg Mensagem que vai ser mostrada no Modal 
    * @return {}
    */
    $scope.openModal = function (_id, _msg) {
        showModal(_id, _msg);
        $scope.dialogMsg = _msg;
    };

    var showModal = function (id) {
        $("#" + id).show();
    };

    /**
     * Closes the Creation Modal
     * @param {string} _id
     * @returns {undefined}
     */
    $scope.closeModal = function (_id) {
        hideModal(_id);
    };

    /**
     * Close the confirmation dialog and do stuff based on the booleans
     * @param {string} _id
     * @param {boolean} _clearFields
     * @param {boolean} _closeTab
     * @param {string} _tabToClose
     * @param {boolean} _classTab
     * @returns {undefined}
     */
    $scope.closeDialog = function (_id, _clearFields, _closeTab, _tabToClose, _classTab) {
        console.log("entrou");
        hideModal(_id);
        if (_clearFields) {
            clearFields();
        }
        if (_closeTab) {
            collapseManager(_tabToClose, _classTab); // CollapseManager is a external API
        }
    };

    ////////////////////////////////////////////////
    /////////////////// DISPLAYS //////////////////

    /**
    * Create a new display, based on the passed display through the PortsAPI
    * @param {object} display
    * @returns {undefined}
    */
    $scope.postDisplay = function (display) {
        display.status = "active";
        DisplayManagement.postDisplay($scope.displayProfile, display, $scope);
        //hideModal('createModal');
    };

    /**
     * Gets the displays from the DB through the PortsAPI
     * @returns {undefined}
     */
    var getDisplay = function () {
        $scope.dataLoading = true;
        portsAPI.getDisplays().success(function (data) {
            $scope.displayList = data;
            $scope.dataLoading = false;
        }).error(function (data, status) {
            $scope.message = "Erro: " + data;
        });
        console.log("get");
    };

    /**
     * Changes the order of the displayed lines
     * @param {string} field
     * @param {string} _id
     * @returns {undefined}
     */
    $scope.orderBy = function (field, _id) {
        
        $scope.orderCrit = field;
        $scope.orderDir = !$scope.orderDir;
        toggleOrderIcon(_id, $scope.orderDir);
    };

    /**
     * Toggles the line
     * @param {string} _id
     * @param {string} _class
     * @returns {undefined}
     */
    $scope.toggle = function (_id, _class) {
        var viewId = 'view-detail-' + _id;
        collapseManager.ToggleDetail(viewId, _class);
        toggleIcon(_id);
    };

    /**
     * Toggles the 'Expand' icon from the lines
     * @param {string} _id
     * @returns {undefined}
     */
    var toggleIcon = function (_id) {
        var _class = '.list-btn:not(#btn-list-' + _id + ')';
        $('#btn-list-' + _id).toggleClass('glyphicon-expand glyphicon-collapse-down');
        $(_class).removeClass('glyphicon-collapse-down');
        $(_class).addClass('glyphicon-expand');
    };

    /**
     * Toggles (up and down) the OrderBy Icon on the Headers
     * @param {string} _id
     * @param {boolean} bool
     * @returns {undefined}
     */
    var toggleOrderIcon = function (_id, bool) {
        var _class = '.list-header:not(#' + _id + ')';
        if (bool) {
            $('#' + _id).find('.glyphicon').removeClass('glyphicon-triangle-bottom glyphicon-triangle-top');
            $('#' + _id).find('.glyphicon').addClass('glyphicon-triangle-top');
        } else {
            $('#' + _id).find('.glyphicon').removeClass('glyphicon-triangle-bottom glyphicon-triangle-top');
            $('#' + _id).find('.glyphicon').addClass('glyphicon-triangle-bottom');
        }
        $(_class).find('.glyphicon').removeClass('glyphicon-triangle-bottom glyphicon-triangle-top');
    };

    /**
    * Updates the passed display data
    * @param {object} selectedDisplay
    * @param {object} displayProfile
    * @returns {undefined}
    */
    $scope.putDisplay = function (selectedDisplay, displayProfile) {
        selectedDisplay.Endpoints = displayProfile.Endpoints;
        selectedDisplay.profileName = displayProfile.profileName;
        selectedDisplay.profileId = displayProfile.profileId;

        var updateDisplaySuccess = function (response) {
            getDisplay();
        };

        var updateDisplayFail = function (error) {
            //alert(error);
        };

        portsAPI.putDisplays(selectedDisplay.displayId, selectedDisplay).success(function (response) {
            updateDisplaySuccess(response);
        }).error(function (error) {
            updateDisplayFail(error);
        });

        getDisplay();
    };



    $scope.deleteDisplay = function (selectedDisplay) {
        portsAPI.deleteDisplays(selectedDisplay.displayId).success(function (data) {
            getDisplay();
        });
    };

    /**
  * Selects and makes a copy of the selected display, so the User can make
  * changes on the selected display information
  * @param {object} display
  * @returns {undefined}
  */
    $scope.selectDisplay = function (display) {
        $scope.selectedDisplay = angular.copy(display);
        $timeout(function () {
            $scope.displayProfile = findProfile($scope.profileList, "profileName", display.profileName); // The select box from the details needs the whole group data to set a default value
        }, 100);
    };

    getDisplay();

    $scope.clearDisplayFields = function () {
        $scope.selectedDisplay = {};
        clearFields();
        hideModal();
    };

    /**
    * Clears the form fields, sets the form to pristine, hides the modal
    * and set the selected group to an empty list
    * @returns {undefined}
    */
    $scope.clearProfileFields = function () {
        $scope.selectedProfile = {};
        clearFields();
        hideModal();

        $scope.profileForm.$setPristine();
    };

    var hideModal = function (id) {
        $("#" + id).hide();
    };

    var clearFields = function (id) {
        if (id)
            $("#" + id).val('');
        else
            $(".form-control").val('');
    };


    //##
    //#     REFERENTE A TELA DE PERFIL
    //##
    
    /**
     * Find the value of PROFILE that must be shown inside DISPLAY DETAILS
     * @param {array} arr
     * @param {string} propName
     * @param {string} propValue
     * @returns {undefined}
     */
    var findProfile = function (arr, propName, propValue) {
        for (var i = 0; i < arr.length; i++)
            if (arr[i][propName] == propValue)
                return arr[i];

        // will return undefined if not found; you could return a default instead
    };

    $scope.clearNewProfile = function () {
        $scope.groupForm.$setPristine();
        delete $scope.newProfile;
    };

    $scope.selectProfile = function (profile) {
        $scope.selectedProfile = profile;
    };



});
