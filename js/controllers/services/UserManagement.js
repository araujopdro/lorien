//--------------------------------//
//--- UserManagement
//-- Factory que tira e coloca os usuários de um grupo do JSON selecionado
//-- N
//--------------------------------//
angular.module("cummins-supervisorio").factory('UserManagement', function (portsAPI) {
    var service = {};

    service.PostUser = function (gruposelecionado, user, _temp) {
        user.groupName = gruposelecionado.groupName;
        user.groupId = gruposelecionado.groupId;

        user.Endpoints = gruposelecionado.Endpoints;
        portsAPI.postUsers(user).success(function () {
            portsAPI.getUsers().success(function (data) {
                _temp.usersList = data;
            });
        }
        );
//        gruposelecionado['groupUsers'].push({"userId": user.userId});
//        portsAPI.putGroups(gruposelecionado.groupId, gruposelecionado);
    };
    service.PutUser = function (gruposelecionado, user, _temp) {
        user.groupName = gruposelecionado.groupName;
        user.groupId = gruposelecionado.groupId;

        user.Endpoints = gruposelecionado.Endpoints;
        portsAPI.putUsers(user.userId, user).success(function () {
            portsAPI.getUsers().success(function (data) {
                _temp.usersList = data;
            });
        }
        );
//        gruposelecionado['groupUsers'].push({"userId": user.userId});
//        portsAPI.putGroups(gruposelecionado.groupId, gruposelecionado);
    };


    service.RemoveUsers = function (gruposelecionado, user, defaultGroup) {
        ///---Tira o elemento do JSON do Grupo

//        gruposelecionado['groupUsers'] = newArray;
//        portsAPI.putGroups(gruposelecionado.groupId, gruposelecionado);

//        defaultGroup['groupUsers'].push({"userId": user.userId});
//        console.log(defaultGroup);
//        console.log(defaultGroup['groupUsers']);
//        portsAPI.putGroups(defaultGroup.groupId, defaultGroup);
//        
        ///--- Set o group como Default e faz um Update no JSON do Usuário
        user.groupName = defaultGroup.groupName;
        user.groupId = defaultGroup.groupId;

//        if(gruposelecionado['removedUsers']===null){
//            gruposelecionado['removedUsers'] = [];
//        };
//        if(_bool)
//            gruposelecionado['removedUsers'].push({"userId": user.userId});
//        user.Endpoints = defaultGroup.endpoints;
//        portsAPI.putUsers(user.userId, user);
    };


    service.AddUser = function (gruposelecionado, user) {
        ///---Tira o elemento do JSON do Grupo

//        gruposelecionado['groupUsers'] = newArray;
//        portsAPI.putGroups(gruposelecionado.groupId, gruposelecionado);

//        defaultGroup['groupUsers'].push({"userId": user.userId});
//        console.log(defaultGroup);
//        console.log(defaultGroup['groupUsers']);
//        portsAPI.putGroups(defaultGroup.groupId, defaultGroup);
//        
        ///--- Set o group como Default e faz um Update no JSON do Usuário
        user.groupName = gruposelecionado.groupName;
        user.groupId = gruposelecionado.groupId;

//        if(gruposelecionado['addedUsers']===null){
//            gruposelecionado['addedUsers'] = [];
//        };

//        
//        if(_bool)
//            gruposelecionado['removedUsers'].push({"userId": user.userId});
//        user.Endpoints = defaultGroup.endpoints;
//        portsAPI.putUsers(user.userId, user);
    };

    service.DeactivateGroup = function (_gruposelecionado, _scope) {
        var userGroup = _scope.usersList.filter(function (el) {
            return el.groupId === _gruposelecionado.groupId;
        });
        if (_gruposelecionado['removedUsers'] == null) {
            _gruposelecionado['removedUsers'] = [];
        }
        ;
        angular.forEach(userGroup, function (user) {
            _gruposelecionado['removedUsers'].push({"userId": user.userId});
        });
        _gruposelecionado.status = 'inactive';
        _scope.atualizarGrupo(_gruposelecionado);
    };
    return service;
});