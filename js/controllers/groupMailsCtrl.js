'use strict'

angular.module("cummins-supervisorio").controller("groupMailsCtrl", function ($scope, portsAPI, collapseManager, imageSrc, JsonHandler, orderByManagement) {

    var groupMails2;
    var userList2;
    var selectedId;
    var newObj = {};
    var newObjUser = {};
   
    $scope.groupMail;
    $scope.listEmails = [];
    $scope.listUser = [];
    $scope.usersList = [];
    $scope.selectableUsers = [];
   

    /* INICIO DETAILS BUTON*/
    $scope.selectGroupMails = function (_groupMails, _groupMailsUsers, _allUsers, _selectables, _id) {
        console.log(_groupMailsUsers);
        console.log(_allUsers);
        var _selectables = new Array();
        $scope.groupMails = angular.copy(_groupMails);
        
        for (var i = 0; i < _groupMailsUsers.length; i++) {
            if (_groupMailsUsers[i].GroupMails_groupMailsId != _id) {
                var newUser = _allUsers.find(function (user) {
                    console.log(user.userId +' '+ _groupMailsUsers[i].userIdAPIUser)

                    return user.userId == _groupMailsUsers[i].userIdAPIUser;
                });

                if (newUser)
                    $scope.selectableUsers.push(newUser);
            };
        };
        console.log($scope.selectableUsers)
    };

    $scope.toggle = function (_id, _class) {
        collapseManager.ToggleDetail(_id, _class);
    };
    /* FIM DETAILS BUTON*/


    // PEGA O ID SELECIONADO PARA PASSAR PARA O DELETEGROUP - PARA USAR O "INDEX" COLOCAR $INDEX NO HTML !!! 
    $scope.grupoSelecionado = function (_id/*, _index*/) {
        selectedId = _id;
        $scope.currentId = _id;
    }

    var getGroupMailsFail = function (error) {
        console.log(describeObject(error));

        $scope.usersList = [];
    };

    var selected = [];
    $scope.userSelected = [];
    $scope.userSelection = function (GroupMails, _user) {

        selected.push(angular.copy(_user));
        $scope.userSelected = selected; 
    }

    var selectedEmail = [];
    $scope.emailSelected = [];
    $scope.emailSelection = function (GroupMails, _email) {

        selectedEmail.push(angular.copy(_email));
        $scope.emailSelected = selectedEmail;

    }

    // GET GROUPMAIL([USER],[EMAIL],ID,NAME)
    var getGroupMail = function () {
        portsAPI.getGroupMails().success(function (response) {
            groupMails2 = response;
            $scope.groupMail = response;

            portsAPI.getUsers().success(function (response) {
                userList2 = response;
                $scope.usersList = response;

                buscarEmails(groupMails2);
                buscarUser(groupMails2);
            });

        }).error(function (error) {
            getGroupMailsFail(error);
        });
    };

    //CHAMANDO GET
    getGroupMail();

    // CRIANDO GROUPMAIL
    $scope.createPost = function () {
        criarObjetoGrupo(/*GroupMails,*/ newObj, newObjUser, name);
    }

    $scope.createGroupMails = function (_groupMails) {


        portsAPI.postGroupMails(_groupMails).success(function (response) {
            console.log(response);

            getGroupMail();
        }).error(function (error) {
            console.log(error);
        });
    };

    // DELETING GROUPMAIL
    $scope.deleteGroupMail = function (_groupMail) {

        portsAPI.deleteGroupMails(selectedId).success(function (response) {
            console.log(response);

            getGroupMail();

        }).error(function (error) {
            console.log(error);
        });
    };

    // UPDATE
    $scope.UpdateGroup = function (_objUser, _objEmail, _groupMail) {
        var objUpdate = {};
        var id;

        objUpdate.Emails = [];
        objUpdate.Users = [];

        //atribuindo valor para name e id do grupo
        name = _groupMail.nameGroup;
        id = _groupMail.groupMailsId;

        //Validação
        //User
        if (_objUser === undefined || _objUser === null) {
            for (var i = 0; i < $scope.listUser.length; i++) {
                var idScope2 = $scope.listUser[i].GroupMails_groupMailsId;
                if (idScope2 == id) {

                    var obj1 = {};
                    obj1.userIdAPIUser = $scope.listUser[i].userIdAPIUser;
                    objUpdate.Users.push(angular.copy(obj1));

                    //objUpdate.Users.push(angular.copy($scope.listUser.userIdAPIUser));
                }
            }
        } else {
            if (_groupMail.Users != undefined || _groupMail.Users != null) {
                objUpdate.Users = _groupMail.Users;
                objUpdate.Users.push(angular.copy(_objUser));
            } else {
                //$scope.listUser.push(angular.copy(_objUser));
                objUpdate.Users.push(angular.copy(_objUser));
            }
        }
        //Validação
        //Email
        if (_objEmail === undefined || _objEmail === null) {
            for (var i = 0; i < $scope.listEmails.length; i++) {
                var idScope = $scope.listEmails[i].GroupMails_groupMailsId;
                if (idScope == id) {

                    var obj = {};
                    obj.email = $scope.listEmails[i].email
                    objUpdate.Emails.push(angular.copy(obj));
                }
            }

        } else {
            if (_groupMail.Emails != undefined || _groupMail.Emails != null) {
                objUpdate.Emails = _groupMail.Emails;
                objUpdate.Emails.push(angular.copy(_objEmail));
            } else {
                //$scope.listEmails.push(angular.copy(_objEmail));
                objUpdate.Emails.push(angular.copy(_objEmail));
            }
        }

        objUpdate.groupMailsId = id;
        objUpdate.nameGroup = name;
        objUpdate.status = "active";

        $scope.ObjectUpdate = {};
        $scope.ObjectUpdate = objUpdate;
    }
    //UPDATE - CHAMADA
    //UpdateGroup(newObjUser,newObj);

    // ATUALIZANDO GROUPMAIL
    $scope.updateGroupMails = function (GroupMails) {
        delete GroupMails.$$hashKey;
        console.log(GroupMails);

        portsAPI.putGroupMails(GroupMails.groupMailsId, GroupMails).success(function () {
            console.log('Put');
            getGroupMail();

        }).error(function (error) {
            console.log(error);
        });
    };
    // ADD USER TO GROUPMAIL
    $scope.addUserToGroupMails = function (GroupMails, newUser) {

        //Cria o obj completo
        newObjUser = newUser;
        $scope.newObjUser = newObjUser;

        //JsonHandler.clearAllLevelFields(newUser);
        //JsonHandler.clearFields();
    };

    // ADD E-MAIL TO GROUPMAIL
    $scope.addEmailToGroupMails = function (GroupMails, Email) {
      
        newObj = Email;
        $scope.newObj = newObj;

        //JsonHandler.clearAllLevelFields(Email);
    };


    // CRIAR OBJETO 
    var criarObjetoGrupo = function (/*ArrayGroup,*/email, user, name) {
        var objAll = {};
        var ArrayGroup = {};
        $scope.ArrayGroupView;
        name = $scope.nameGroup

        objAll.Emails = [];
        objAll.Users = [];
        objAll.nameGroup;

        objAll.Emails.push(angular.copy(email));
        objAll.Users.push(angular.copy(user));
        objAll.nameGroup = name;
        objAll.status = "active";

        //ArrayGroup.push(angular.copy(objAll));
        ArrayGroup = objAll;

        $scope.ArrayGroupView = ArrayGroup;

    }

    // FILTRA OS ELEMENTOS DA LISTA DE USUÁRIOS
    $scope.filterSelection = function (_user) {
        
        return true;
    };

    // BUSCANDO EMAILS DOS GRUPOS DE EMAIL
    var buscarEmails = function (_email) {
        var newEmail = {};
        // $scope.GroupMails = _email;
        var i = 0;
        var j = i;
        for (i = 0; i < groupMails2.length; i++) {

            var arrayEmails = groupMails2[i].Emails;
            j = 0;

            while (j < arrayEmails.length) {
                newEmail.email = arrayEmails[j].email;
                newEmail.emailId = arrayEmails[j].emailId;
                newEmail.GroupMails_groupMailsId = arrayEmails[j].GroupMails_groupMailsId;

                $scope.listEmails.push(angular.copy(newEmail));
                newEmail = {};
                j++;
            }

        }
    }

    //BUSCANDO USER DOS GRUPOS DE EMAILS
    var buscarUser = function (_user) {
        var newUser = {};
        // $scope.usersList = _user;
        var i = 0;
        var j = i;
        for (i = 0; i < groupMails2.length; i++) {
            // newEmail.email = groupMails2[i].Emails[i].email;

            var arrayUser = groupMails2[i].Users;
            j = 0;

            while (j < arrayUser.length) {
                newUser.userIdAPIUser = arrayUser[j].userIdAPIUser;
                newUser.GroupMails_groupMailsId = arrayUser[j].GroupMails_groupMailsId;

                $scope.listUser.push(angular.copy(newUser));
                newUser = {};
                j++;
            };
        }
    }


    // BOTÃO ABRE MODAL 
    $scope.openModal = function (_id, _msg) {
        showModal(_id, _msg);
        clearFields();
        $scope.dialogMsg = _msg;
        $scope.currentId = undefined;
    };
    // LIMPA CAMPOS QUANDO MODAL É ABERTO
    $scope.clearGroupMailsValue = function () {
        //delete $scope.groupMails;
        //delete $scope.listEmails;
        //delete $scope.listUser;

    };

    //FECHA MODAL
    $scope.closeModal = function (_id) {
        hideModal(_id);
    };

    // REMOVE EMAIL
    $scope.removeEmailFromGroupMails = function (GroupMails, Email) {
        var newArray = GroupMails.filter(function (el) {
            return el.email !== Email.email;
        });
        GroupMails.email = newArray;
        $scope.listEmails = newArray;
    };

    //REMOVE USER
    $scope.removeUserFromGroupMails = function (GroupMails, user) {
        var newArray = GroupMails.filter(function (el) {
            return el.userIdAPIUser !== user.userIdAPIUser;
        });
        GroupMails.users = newArray;
        $scope.listUser = newArray;
    };

    $scope.removeUserSelected = function (_listaUserSelected, _userSelected) {
        var newArray = _listaUserSelected.filter(function (el) {
            return el.userIdAPIUser !== _userSelected.userIdAPIUser;
        });
        _listaUserSelected = newArray;
        selected = newArray;
        $scope.userSelected = newArray;
    };

    $scope.removeEmailSelected = function (_listaEmailSelected, _emailSelected) {
        var newArray = _listaEmailSelected.filter(function (el) {
            return el.email !== _emailSelected.email;
        });
        _listaEmailSelected = newArray;
        selectedEmail = newArray;
        $scope.emailSelected = newArray;
    };












    $scope.readAllGroupMails = function () {
        $scope.usersList = [];

        console.log("$scope.readAllGroupMails");

        // Callback de erro do carregamento das metas
        var getGroupMailsFail = function (error) {
            console.log(describeObject(error));

            $scope.usersList = [];
        };
    }

});