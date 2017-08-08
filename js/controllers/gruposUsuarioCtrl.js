'use strict';
/**
 * Initiate the Group/Users Controller on the cummins-supervisorio module
 * @param {string} gruposUsuarioCtrl - Controller Name
 * @param {type} function - receive all libraries, directives and APIs
 */
angular.module("cummins-supervisorio").controller("gruposUsuarioCtrl", function ($scope, $timeout, collapseManager, UserManagement, portsAPI, EndpointManagement, imageSrc, orderByManagement) {
    $scope.gruposLista = [];
    $scope.gruposelecionado = {};
    $scope.newGroup = { "groupName": "", "description": "", "groupUsers": [], "status": "", "endpoints": [] };

    $scope.sysEndpoints = [];
    //$scope.c1 = "";
    //$scope.c2 = "";
    $scope.invalidPass = false;

    $scope.repeatedUser = false;
    $scope.testedUserOnce = false;
    $scope.testUserId = function (_userId, _usersList) {
        console.log('teste');
        for (var i = 0; i < _usersList.length; i++) {
            console.log(_usersList[i].userId);
            console.log(_userId);

            if (_usersList[i].userId == _userId) {
                $scope.repeatedUser = true;
                $scope.userOk = false;
                break;
            } else {
                $scope.repeatedUser = false;
                $scope.userOk = true;
            }
        }
    };

    $scope.checkPass = function (newUser) {
        if (newUser)
        {
            var pass = $scope.user.pass;
            var passconfirmation = $scope.user.confirmpass;
        }
        else
        {
            var pass = $scope.selectedUser.pass;
            var passconfirmation = $scope.selectedUser.confirmpass;
        }
        

        if (pass == passconfirmation) {
            $scope.invalidPass = false;      
        }
        else {
            $scope.invalidPass = true;          
        }      
    };



    $scope.$on('$viewContentLoaded', function () { //Essa fun��o s� roda ap�s a p�gina ter carregado por completo!
        //var checkPass = function ($scope) {
        //    console.log("entrou na checkpass");

        //    var password = document.getElementById("newuserpassword").value;
        //    var chkpassword = document.getElementById("chkpassword").value;

        //    console.log("pass " + password);
        //    console.log("chkpass " + chkpassword);

        //    $scope.invalidPass = $scope.c1 === $scope.c2;

        //    if (password == chkpassword) {
        //        console.log($('#username'));
        //        $('#username').focus();
        //        console.log("As senhas batem");
        //        alert("ok");
        //        $scope.invalidPass = true;
        //    }
        //};     
    });



    /**
     * First, the function sends the group and userslist to an external API,
     * Then, it gets the array of a new group and post it through the PortsAPI
     * @param {array} grupo
     * @returns {undefined}
     */
    $scope.adicionarGrupo = function (grupo) {
      
         //======================================
        // *CICERO_2017-03-07*
        // Valida se o grupo já existe
        for(var i=0; i<$scope.gruposLista.length; i++){
          var g = $scope.gruposLista[i];
          if(grupo.groupName === g.groupName){
            alert("O grupo '" + grupo.groupName + "' já existe!");
            return;
          }
        }
        
        // Valida se o grupo recebeu pelo menos 1 endpoint
        if(grupo.Endpoints.length === 0){
            alert("Não é permitido criar um grupo sem associar pelo menos 1 endpoint!");
            return;
        }
        //======================================
        
        
        //return;
      
        grupo.status = 'active';
        EndpointManagement.AddUserToJSON_AddedUsers(grupo, $scope.usersList); // This Service adds all users, with the user.groupId equivalent to grupo.groupId, to AddedUsers
        portsAPI.postGroups(grupo).success(function () {
            console.log(grupo);
            carregarGrupos(); // Get the Users JSON after posting the new group for a 'refreshless' uptade
        }).error(function () {
            console.log('Erro ao fazer o post para api de grupos');
        });
    };

    $scope.$on('ngRepeatFinished', function (ngRepeatFinishedEvent) {
        $scope.dataLoading = false;
    });

    /**
     * Gets all Endpoints through the PortsAPI
     * @returns {undefined}
     */
    var carregarEndpoints = function () {
        portsAPI.getSysEndpoints().success(function (data) {
            $scope.sysEndpoints = data;
        });
    };

    /**
     * Gets all Groups through the PortsAPI
     * @returns {undefined}
     */
    var carregarGrupos = function () {
        $scope.dataLoading = true;
        portsAPI.getGroups().success(function (data) {
            $scope.gruposLista = angular.copy(data);
            $scope.defaultGroup = data[0];
            getUser();
        }).error(function (data, status) {
            $scope.message = "Erro: " + data;
        });
    };

    /**
     * Updates the data of the passed group through the PortsAPI
     * @param {array} _gruposelecionado
     * @returns {undefined}
     */
    $scope.atualizarGrupo = function (_gruposelecionado) {
        EndpointManagement.AddUserToJSON_AddedUsers(_gruposelecionado, $scope.usersList);
        EndpointManagement.AddUserToJSON_RemovedUsers(_gruposelecionado, $scope.usersList, $scope.defaultGroup); // This Service adds all users to AddedUsers
        portsAPI.putGroups(_gruposelecionado.groupId, _gruposelecionado).success(function (data) {
            //delete $scope.gruposelecionado;
            carregarGrupos();
        });
    };

    /**
     * Deactivates the passed group through an external API
     * @param {array} _gruposelecionado
     * @returns {undefined}
     */
    $scope.apagarGrupo = function (gruposelecionado) {
        ('DeactivateGroup');
        UserManagement.DeactivateGroup(gruposelecionado, $scope);
    };

    /**
     * When the user expand the content, this function makes a copy
     * of the passed group data, and display it, so the user can
     * change the group information.
     * @param {type} _group
     * @returns {undefined}
     */
    $scope.selectGroup = function (_group) {
        $scope.gruposelecionado = angular.copy(_group);
    };

    carregarGrupos(); // Loads all groups
    carregarEndpoints(); // Loads all endpoints

    /**
     * Clears the form fields, sets the form to pristine, hides the modal
     * and set the selected group to an empty list
     * @returns {undefined}
     */
    $scope.clearGroupFields = function () {
        $scope.newGroup = { "groupName": "", "description": "", "groupUsers": [], "status": "", "endpoints": [] };
        clearFields();
        hideModal();

        $scope.groupForm.$setPristine();
    };

    $scope.usersList = [];
    $scope.selectedUser = {};
    $scope.userGroup = '';


    /**
     * Clears the form fields, sets the form to pristine, hides the modal
     * and set the selected user to an empty list
     * @returns {undefined}
     */
    $scope.clearUserFields = function () {
        $scope.selectedUser = {};
        $scope.user = {};
        delete $scope.userGroup;
        clearFields();
        hideModal();

        $scope.groupForm.$setPristine();
    };

    /**
     * Create a new user, based on the passed array/user through the PortsAPI
     * @param {array} user
     * @returns {undefined}
     */
    var nome = [
        'Miguel', 'Sophia','Davi'	,	'Alice'
        ,	'Arthur'	,'Julia'
        ,	'Pedro'	,	'Isabella'
        ,	'Gabriel'	,	'Manuela'
        ,	'Bernardo'	,	'Laura'
        ,	'Lucas'	,	'Luiza'
        ,	'Matheus'	,'Valentina'
        ,	'Rafael',	'Giovanna'
        ,	'Heitor',	'Maria Eduarda'
        ,	'Enzo',	'Helena'
        ,	'Guilherme'	,	'Beatriz'
        ,	'Nicolas'	,	'Maria Luiza'
        ,	'Renan'	,	'Lara'
        ,	'Gustavo'	,	'Mariana'
        ,	'Felipe'	,	'Nicole'
    ]

    var sobrenomenome = [
        'Alves', 'Campos', 'Cardoso', 'Moura'
        , 'Costa', 
         'Teixeira',
         'Farias', 
         'Viana',
         'Rodrigues', 
         'Arag�o', 
         'Martins', 
         'Lopes', 
         'Gomes', 
         'Mendes', 
         'Carvalho', 
         'Nunes', 
         'Melo', 
         'Pires'
    ]


    $scope.postUser = function (user) {
        user.status = "active";
        UserManagement.PostUser($scope.userGroup, user, $scope);
        //createFakeUsers(fakeUsers, user);
    };

    var fakeUsers = new Array(50);

    var createFakeUsers = function (_list, _user) {
        _list.forEach(function (item) {
            item = _user;

            var _nome = nome[getRandomIntInclusive(0, nome.length - 1)]
            var _sobrenome = sobrenomenome[getRandomIntInclusive(0, sobrenomenome.length - 1)];

            var lc_name = nome[getRandomIntInclusive(0, nome.length - 1)];
            var lc_sobrenome = sobrenomenome[getRandomIntInclusive(0, sobrenomenome.length - 1)];


            item.fullName = _nome + ' ' + _sobrenome;
            item.userId = lc_name.toLowerCase() + '.' + lc_sobrenome.toLowerCase();
            item.email = item.userId + '@integradora.com.br'
            UserManagement.PostUser($scope.userGroup, item, $scope);

        });
    };

    /**
     * Gets the users from the DB through the PortsAPI
     * @returns {undefined}
     */
    var getUser = function () {
        $scope.dataLoading = true;
        portsAPI.getUsers().success(function (data) {
            $scope.usersList = angular.copy(data);
        }).error(function (data) {
            $scope.message = "Erro: " + data;
        });
    };

    /**
     * Updates the passed user data
     * @param {array} _user
     * @returns {undefined}
     */
    $scope.putUser = function (_user) {
        portsAPI.putUsers(_user.userId, _user).success(function () {
            getUser();
        });
    };

    /**
     * Deactivates the passed user through the PortsAPI
     * @param {array} selectedUser
     * @returns {undefined}
     */
    $scope.deleteUser = function (selectedUser) {
        portsAPI.deleteUsers(selectedUser.userId).success(function (data) {
            //delete $scope.selectedUser;
            getUser();
        });
    };

    /**
     * Selects and makes a copy of the selected user, so the User can make
     * changes on the selected user information
     * @param {array} user
     * @returns {undefined}
     */
    $scope.selectUser = function (user) {
        $scope.selectedUser = angular.copy(user);
        $timeout(function () {
            $scope.userGroup = findGroup($scope.gruposLista, "groupName", user.groupName); // The select box from the details needs the whole group data to set a default value
        }, 100);
    };


    //    $scope.getListContent = function (_list, _param) {
    //        var _contents = [];
    //        angular.forEach(_list, function (object) {
    //            var content = object[_param];
    //            _contents.push(content);
    //        });
    //        return _contents;
    //    };

    getUser();
    /**
     * Update de user.groupId&Name through the User screen
     * @param {array} _user
     * @param {array} _group
     * @param {boolean} close
     * @returns {undefined}
     */
    $scope.addUserToGroup_userSide = function (_user, _group, close) {
        if (close === 'y') {
            $(document).find(".details").hide();
        }
        UserManagement.PutUser(_group, _user, $scope);
    };

    /**
     * Sets the user groupname and user groupid to passed group name and id respectively
     * @param {array} _user
     * @param {array} _group
     * @returns {undefined}
     */
    $scope.addUserToGroup_groupSide = function (_user, _group) {
        UserManagement.AddUser(_group, _user);
    };
    /**
     * Sets the user groupname and user groupid to default.group name and id respectively
     * @param {array} _user
     * @param {array} _group
     * @param {boolean} _bool
     * @returns {undefined}
     */
    $scope.removeUserFromGroup = function (_user, _group, _bool) {
        UserManagement.RemoveUsers(_group, _user, $scope.defaultGroup, _bool);
    };
    /**
     * Chacks if the selected group has the endpoint and returns a boolean as reponse for the NG-IF
     * @param {type} _endpoint
     * @param {type} _group
     * @returns {Boolean}
     */
    $scope.hasEndpoint = function (_endpoint, _group) {
        if (!(typeof _group !== 'undefined'))
            return;
        if (typeof _group['Endpoints'] == 'undefined')
            _group['Endpoints'] = [];
       
        var result = _group['Endpoints'].filter(function (el) {
            return el.displayUrl == _endpoint.displayUrl;
        });

        if (result.length >= 2) {
            return false;
        }
        return true;
    };
    /**
     * Add Endpoints(url) from the passed group
     * @param {string} _url
     * @param {array} _group
     * @returns {undefined}
     */
    $scope.addEntpointToGroup = function (_url, _group, close) {
        if (close === 'y') {
            $(document).find(".details").hide();
        }
        EndpointManagement.PutEndpoint(_group, _url, $scope.usersList);

    };
    /**
     * Remove Endpoints(url) from the passed group
     * @param {string} _url
     * @param {array} _group
     * @returns {undefined}
     */
    $scope.removeEndpointFromGroup = function (_url, _group) {
        EndpointManagement.RemoveEndpoint(_group, _url);
    };
    /**
     * Changes the order of the displayed lines
     * @param {string} field
     * @param {string} _id
     * @returns {undefined}
     */
    $scope.orderBy = function (field, _id) {
        orderByManagement.orderBy($scope, field, _id);
    };

    $scope.reactivateUser = function (user) {
        user.status = "active";
    };
    $scope.reactivateGroup = function (group) {
        group.status = "active";

    };
    /**
     * Toggles the line
     * @param {string} _id
     * @param {string} _class
     * @returns {undefined}
     */
    $scope.toggle = function (_id, _class) {
        console.log(typeof _id)
        var id;
        if (typeof _id == 'string') {
            console.log('Replace');

            id = _id.replace(/\./g, "");
        } else {
            id = _id;
        }

        var viewId = 'view-detail-' + id;
        collapseManager.ToggleDetail(viewId, _class);
        toggleIcon(_id);
    };
    /**
    * Adds two numbers
    * @param {String} _id #id do Modal que vai ser aberto
    * @param {String} _msg Mensagem que vai ser mostrada no Modal 
    * @return {}
    */
    $scope.openModal = function (_id, _msg) {
        showModal(_id, _msg);
        $scope.dialogMsg = _msg;
    };

    /**
    * To obvious
    * @param (String) String with dot
    * @return (String) String with no dot
    */
    $scope.removeDotFromString = function (_string) {
        return _string.replace(/\./g, "");
    }

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
        hideModal(_id);
        if (_clearFields) {
            clearFields();
        }
        if (_closeTab) {
            collapseManager(_tabToClose, _classTab); // CollapseManager is a external API
        }
    };
});

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
 * This filter prevent the view from displaying 2 endpoints on the group detail
 * @param {array} collection - array that will be filtered
 * @param {string} keyname - key to comparison
 */
angular.module("cummins-supervisorio").filter('unique', function () {
    return function (collection, keyname) {
        var output = [],
                keys = [];

        angular.forEach(collection, function (item) {
            var key = item[keyname];
            if (keys.indexOf(key) === -1) {
                keys.push(key);
                output.push(item);
            }
        });

        return output;
    };
});




var hideModal = function (id) {
    $("#" + id).hide();
};
var clearFields = function () {
    $(".modal-content").find("input[type=text], textarea, select").val("");
};

var findGroup = function (arr, propName, propValue) {
    for (var i = 0; i < arr.length; i++)
        if (arr[i][propName] == propValue)
            return arr[i];

    // will return undefined if not found; you could return a default instead
};

var showModal = function (id) {
    $("#" + id).show();
};

// Returns a random integer between min (included) and max (included)
// Using Math.round() will give you a non-uniform distribution!
function getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}