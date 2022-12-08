//##########################################################################################################
//  Server Users Manager
//  summary:
//          Loaded by the server to receive and route user system messages
//  tags:
//          Balek-Server Manager Users
//##########################################################################################################
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/Stateful",
        'dojo/node!crypto',
        'balek-server/users/usersController',

        "balek-server/users/dbController"],
    function (declare, lang, topic, Stateful, crypto,  UsersController, userDbController) {
        return declare("usersManager", null, {

            _dbController: null,

            _usersManagerState: null,

            _instanceCommands: null,


            constructor: function (args) {

                declare.safeMixin(this, args);

                console.log("Initializing Users Manager");

                //todo make User Store
                //todo watch User Store changes in sessions

                this._Controller = new UsersController({_usersManager: this});
                this._dbController = new userDbController();


                //todo move these and their uses to the Controller
                    topic.subscribe("getUserFromDatabase", lang.hitch(this, this.getUserFromDatabase));
                    topic.subscribe("getUsersFromDatabase", lang.hitch(this, this.getUsersFromDatabase));
                    topic.subscribe("getUserInfoFromDatabaseByKey", lang.hitch(this, this.getUserInfoFromDatabaseByKey));
                    topic.subscribe("receiveUserManagerMessage", lang.hitch(this, this.receiveUserManagerMessage));

            },
            getUserFromDatabase: function (username, returnGetUserFromDatabase) {
                this._dbController.getUserFromDatabase(username).then(function (results) {
                    //todo update User Store
                    returnGetUserFromDatabase(results);
                }).catch(function (error) {
                    returnGetUserFromDatabase(error);
                });
            },
            getUserInfoFromDatabaseByKey: function (userKey, returnGetUserFromDatabase) {
                this._dbController.getUserInfoFromDatabaseByKey(userKey).then(function (results) {
                    //todo update User Store
                    returnGetUserFromDatabase(results);
                }).catch(function (error) {
                    returnGetUserFromDatabase(error);
                });
            },
            getUsersFromDatabase: function (returnGetUsersFromDatabase) {
                this._dbController.getUsersFromDatabase().then(function (results) {
                    //todo update User Store
                    returnGetUsersFromDatabase(results);
                }).catch(function (error) {
                    returnGetUsersFromDatabase(error);
                });
            },
            receiveUserManagerMessage(userManagerMessage, wssConnection, messageReplyCallback) {
                if (userManagerMessage.messageData.request && userManagerMessage.messageData.request.toString() ) {
                    //todo remove/change this to not get all users on load
                    if(userManagerMessage.messageData.request.toString() === "usersData")
                    {
                        console.log("Should Not Be seeing this....")
                    }else if(userManagerMessage.messageData.request.toString() === "userInfoWatch")
                    {
                        if(userManagerMessage.messageData.userKey && userManagerMessage.messageData.userKey.toString()){
                            this._Controller.relayUserInfoState(userManagerMessage.messageData.userKey, wssConnection._sessionKey, messageReplyCallback)
                        }else{
                            messageReplyCallback({Error: "No UserKey Provided"})
                        }
                    }else if(userManagerMessage.messageData.request.toString() === "userListWatch")
                    {
                          this._Controller.relayUserListState(wssConnection._sessionKey, messageReplyCallback)
                    }

                } else if (userManagerMessage.messageData.updateUserData) {
                    console.log("Should Not Be seeing this....")
                }
            },
            getUniqueUserKey: function () {
                let id = crypto.randomBytes(20).toString('hex');
                return id;
            }
        });
    });