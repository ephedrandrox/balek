define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/Stateful",
        'dojo/node!crypto',

        "balek-server/users/dbController"],
    function (declare, lang, topic, Stateful, crypto, userDbController) {
        return declare("usersManager", null, {

            _UserState: null, //constructor for state object

            _userStates: null,

            _dbController: null,
            _usersManagerState: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                console.log("Initializing Users Manager");

                this._UserState = declare([Stateful], {
                    userName: null,
                    userKey: null
                });
                this._userStates = {};

                //todo make User Store
                //todo watch User Store changes in sessions

                this._dbController = new userDbController();

                this._dbController.getUsersFromDatabase().then(lang.hitch(this, function (results) {
                    results.forEach ( lang.hitch(this, function(user){
                        this._userStates[user.userKey] = new this._UserState({
                            userName: user.name,
                            userKey: user.userKey
                        });
                    }));
                })).catch(function (error) {
                    debugger;
                    console.log("Could not load users from database!!!!!!!!!!" , error);
                });

                topic.subscribe("getUserState", lang.hitch(this, this.getUserState));

                //replace these with state object
                topic.subscribe("getUserFromDatabase", lang.hitch(this, this.getUserFromDatabase));
                topic.subscribe("getUsersFromDatabase", lang.hitch(this, this.getUsersFromDatabase));

                topic.subscribe("receiveUserManagerMessage", lang.hitch(this, this.receiveUserManagerMessage));

            },
            getUserState: function(userKey, returnGetUserState)
            {
                if (this._userStates[userKey])
                {
                    returnGetUserState(this._userStates[userKey]);
                }else
                {
                    returnGetUserState({error: "there is no state for that userID"});
                }
            },
            getUserFromDatabase: function (username, returnGetUserFromDatabase) {
                this._dbController.getUserFromDatabase(username).then(function (results) {
                    //todo update User Store
                    returnGetUserFromDatabase(results);
                }).catch(function (error) {
                    returnGetUserFromDatabase(error);
                });
            },
            getUsersFromDatabase: function (returnGetUsersFromDatabase) {
                this._dbController.getUsersFromDatabase().then(function (results) {
                    //update User Store
                    returnGetUsersFromDatabase(results);
                }).catch(function (error) {
                    returnGetUsersFromDatabase(error);
                });
            },
            receiveUserManagerMessage(userManagerMessage, wssConnection, messageReplyCallback) {

                if (userManagerMessage.messageData.request) {
                    topic.publish("getUsersFromDatabase", lang.hitch(this, function (usersFromDatabase) {
                        topic.publish("sendBalekProtocolMessage", wssConnection, {
                            userManagerMessage: {
                                messageData: {userData: usersFromDatabase}
                            }
                        });
                    }));
                } else if (userManagerMessage.messageData.updateUserData) {

                    let updateUserData = userManagerMessage.messageData.updateUserData;

                    let updateRequest = this.updateUserFromSession(wssConnection._sessionKey, updateUserData);

                    updateRequest.then(lang.hitch(this, function (updatedData) {
                        messageReplyCallback({
                            userManagerMessage: {
                                messageData: {userUpdatedData: updatedData}
                            }
                        });
                        //update success send result back
                    })).catch(lang.hitch(this, function (error) {
                        messageReplyCallback({
                            userManagerMessage: {
                                messageData: {error: error}
                            }
                        });
                    }));
                }

            },
            updateUserFromSession: function (sessionKey, updateUserData) {

                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    topic.publish("getSessionUserInfo", sessionKey, lang.hitch(this, function (userInfo) {

                        let permissionGroups = JSON.parse(String.fromCharCode(...new Uint8Array(userInfo[0].permission_groups)));

                        let userKey = userInfo[0].userKey;

                        if (userKey === updateUserData.userKey || 0 <= permissionGroups.indexOf("admin")) {
                            //todo make this a user key and user able to have same names
                            // user can edit their own things

                            if (!(updateUserData.userKey)) {
                                updateUserData.userKey = this.getUniqueUserKey();
                            }

                            if (!updateUserData.permissionGroups) {
                                updateUserData.permissionGroups = `["users"]`;
                            }

                            if (updateUserData.icon != null) {
                                var iconData = Object.values(updateUserData.icon.data);
                                var base64Buffer = Buffer.from(iconData);
                                updateUserData.icon = base64Buffer;
                            }
                            if (updateUserData.password != null) {
                                var passwordData = updateUserData.password;
                                updateUserData.password = passwordData;
                                //what is the point of this?
                            }

                            this._dbController.updateUserInDatabase(updateUserData).then(function (results) {
                                //todo update User Store
                                Resolve(results);
                            }).catch(function (error) {
                                Reject(error);
                            });

                        } else {
                            Reject("Permission Denied");
                        }

                    }));
                }));

            },
            getUniqueUserKey: function () {
                let id = crypto.randomBytes(20).toString('hex');
                return id;
            }
        });
    });