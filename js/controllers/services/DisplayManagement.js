//--------------------------------//
//--- DisplayManagement
//-- Factory que tira e coloca os displays de um profile do JSON selecionado
//-- N
//--------------------------------//
angular.module("cummins-supervisorio").factory('DisplayManagement', function (portsAPI) {
    var service = {};

    service.postDisplay = function (selectedProfile, display, _temp) {
        display.profileName = selectedProfile.profileName;
        display.profileId = selectedProfile.profileId;

        display.Endpoints = selectedProfile.Endpoints;
        portsAPI.postDisplays(display).success(function (data) {
            portsAPI.getDisplays().success(function (data) {
                _temp.displayList = data;
            });
        });      
    };

    //service.PutUser = function (gruposelecionado, user, _temp) {
    //    user.groupName = gruposelecionado.groupName;
    //    user.groupId = gruposelecionado.groupId;

    //    user.Endpoints = gruposelecionado.Endpoints;
    //    portsAPI.putUsers(user.userId, user).success(function () {
    //        portsAPI.getUsers().success(function (data) {
    //            _temp.usersList = data;
    //        });
    //    }
    //    );
    //};


    service.RemoveDisplays = function (_profile, _display, defaultProfile) {
        _display.profileName = defaultProfile.profileName;
        _display.profileId = defaultProfile.profileId;
    };


    service.AddDisplay = function (_profile, _display) {
        _display.profileName = _profile.profileName;
        _display.profileId = _profile.profileId;
    };

    service.DeactivateProfile = function (_selectedProfile, _scope) {
        var displayProfile = _scope.displayList.filter(function (el) {
            return el.profileId == _selectedProfile.profileId;
        });
        if (!_selectedProfile['removedDisplays']) {
            _selectedProfile['removedDisplays'] = [];
        }
        ;
        angular.forEach(displayProfile, function (display) {
            _selectedProfile['removedDisplays'].push({ "displayId": display.displayId });
        });
        _selectedProfile.status = 'inactive';
        _scope.putProfile(_selectedProfile);
    };

    return service;
});