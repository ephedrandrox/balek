//##########################################################################################################
//  Server Users Controller
//  summary:
//          Used by Instances and the Users Manager to get and set User information
//  tags:
//          Balek-Server Controller Users
//##########################################################################################################
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        //Balek Commands and Controller Imports
        'balek-server/users/usersController/instanceCommands',
        'balek-server/session/sessionsController/instanceCommands',
        "balek-server/users/dbController"
    ],
    function (declare, lang, topic, Stateful,
              InstanceCommands, SessionInstanceCommands, userDbController
    ) {
        return declare("balekUsersController", null, {

            _instanceCommands: null,
            _sessionCommands: null,
            _dbController: null,
            _usersManager: null,

            _userInfoStates: null,
            _userListStates: null,

            _userInfoWatchers: null,
            _userListWatchers: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                if(this._usersManager){
                    console.log("balekUsersController  starting...");
                    //Create User Infos and User Lists Maps
                    this._userInfoStates = {};
                    this._userListStates = {};
                    this._userInfoWatchers = {}
                    this._userListWatchers = {}
                    //Initialize Instance Commands
                    this._instanceCommands = new InstanceCommands();
                    this._instanceCommands.setCommand("addNewUser", lang.hitch(this, this.addNewUser))
                    this._instanceCommands.setCommand("updateUsername", lang.hitch(this, this.updateUsername))
                    this._instanceCommands.setCommand("updateUserIcon", lang.hitch(this, this.updateUserIcon))
                    this._instanceCommands.setCommand("updateUserPassword", lang.hitch(this, this.updateUserPassword))
                    //Get Session Instance Commands and create Database Controller
                    let SessionsInstanceCommands = new SessionInstanceCommands()
                    this._sessionCommands = SessionsInstanceCommands.getCommands()
                    this._dbController = new userDbController();
                }else {
                    console.log("balekUsersController NOT starting...");
                }
            },
            //##########################################################################################################
            //Relay User Info State - UserManager Function
            //##########################################################################################################
            relayUserInfoState: function(userKey, sessionKey, messageReplyCallback){
                let userInfoState =  this.getUserInfoState(userKey)
                let stateEntries = Object.entries(userInfoState)
                for(KeyValIndex in stateEntries)
                {
                    let objectKey = stateEntries[KeyValIndex][0]
                    let object = userInfoState.get(objectKey)
                    if(typeof object !== 'function' ){
                        messageReplyCallback({userInfoState: {name: objectKey ,
                                newState: object }})
                    }
                }
                let watchHandle = userInfoState.watch(lang.hitch(this, function(name, oldState, newState){
                    messageReplyCallback({userInfoState: {name: name , newState: newState}})
                }))
                this.putUserInfoWatcher(userKey, sessionKey, watchHandle)
            },
            getUserInfoWatchers(sessionKey)
            {
                    if(!this._userInfoWatchers[sessionKey]){
                        this._userInfoWatchers[sessionKey] = {}
                    }
                    return this._userInfoWatchers[sessionKey]
            },
            putUserInfoWatcher(userKey, sessionKey,  watchHandle){
               let sessionWatchers =  this.getUserInfoWatchers(sessionKey)

                if(!sessionWatchers[userKey]){
                    sessionWatchers[userKey] = {}
                }
                sessionWatchers[userKey] = watchHandle

            },
            stopWatching(userKey, sessionKey){
                //todo Make this work and call from command when Interface is done watching
            },
            //##########################################################################################################
            //Relay User List State - UserManager Methods
            //##########################################################################################################
            relayUserListState: function( sessionKey, messageReplyCallback){
                let userKey = this._sessionCommands.getSessionByKey(sessionKey)
                 let userListState =  this.getUserListState(userKey)
                 let stateEntries = Object.entries(userListState)
                 for(KeyValIndex in stateEntries)
                 {
                    let objectKey = stateEntries[KeyValIndex][0]
                    let object = userListState.get(objectKey)
                    if(typeof object !== 'function' ){
                        messageReplyCallback({userListState: {name: objectKey ,
                                newState: object }})
                    }
                }
                let watchHandle = userListState.watch(lang.hitch(this, function(name, oldState, newState){
                    messageReplyCallback({userListState: {name: name , newState: newState}})
                }))
                this.putUserListWatcher(userKey, sessionKey, watchHandle)
            },
            getUserListWatchers(sessionKey)
            {
                if(!this._userListWatchers[sessionKey]){
                    this._userListWatchers[sessionKey] = {}
                }
                return this._userListWatchers[sessionKey]
            },
            putUserListWatcher(userKey, sessionKey,  watchHandle){
                let sessionWatchers =  this.getUserListWatchers(sessionKey)

                if(!sessionWatchers[userKey]){
                    sessionWatchers[userKey] = {}
                }
                sessionWatchers[userKey] = watchHandle

            },
            //##########################################################################################################
            //Instance Commands
            //##########################################################################################################
            addNewUser: function(userData, adminUserKey){
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if(userData && adminUserKey
                    && userData.userName && userData.icon && userData.icon.data
                    && userData.password){

                        const iconData = Object.values(userData.icon.data);
                        const iconBase64 = Buffer.from(iconData);

                        let userKey = this._usersManager.getUniqueUserKey()
                        let permissionGroups =  Buffer.from(JSON.stringify(["users"]).toString())

                        this.isUserAdmin(adminUserKey).then(lang.hitch(this, function (results) {
                            //todo update User Store
                            console.log("🟦🟦🟦🟦", results, userKey )
                            if(results)
                            {
                                console.log("addNewUser" , this._dbController)
                                this._dbController.addNewUser(userData.userName, userData.password, iconBase64, userKey, permissionGroups).then(lang.hitch(this, function (results) {
                                    console.log("addNewUseraddNewUser",userData.userName, userData.password, userKey )
                                    if(results[0].affectedRows === 1)
                                    {
                                        Resolve({Success: "User Added", Results: results})
                                        //Create User State
                                        let newUserState = this.getUserInfoState(userKey)
                                        newUserState.set("userName",  userData.userName )
                                        newUserState.set("icon",  iconBase64 )

                                        console.log("Userlists 🟢🟢🟢🟢🟢",  this._userListStates)
                                        //add userKey to userslists
                                        for(objectIndex in this._userListStates)
                                        {
                                            if(this._userListStates[objectIndex] !== null
                                                && this._userListStates[objectIndex].set
                                                && typeof this._userListStates[objectIndex].set === 'function'){
                                                console.log("Setting 🟢🟢🟢🟢🟢", objectIndex, this._userListStates[objectIndex])
                                                let userListState = this._userListStates[objectIndex]
                                                userListState.set(userKey.toString(), userKey.toString())
                                            }else {
                                                console.log("Skipping 🛑🛑🛑🛑", objectIndex, this._userListStates[objectIndex])
                                            }
                                        }
                                        console.log("Done Setting 🟢🟢🟢🟢🟢", objectIndex, this._userListStates[objectIndex])
                                    }else if(results[0].affectedRows === 0){
                                        Reject({Error: "No Rows Affected", Results: results})
                                    }else {
                                        Reject({Error: "Unexpected Results", Results: results})
                                    }
                                })).catch(function (Error) {
                                    Reject({Error: Error})
                                });
                            }else
                            {
                                Reject({Error: "Request needs administrative key"});
                            }
                        })).catch(function (error) {
                            Reject(error);
                        });
                    }else{
                        Reject({Error: "Error - new UserData or admin key not as expected", userInfo: [userData, adminUserKey]})
                    }
                }));
            },
            updateUsername: function(userName, userKey){
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if(userKey && userName){
                           this._dbController.updateUsernameInDatabase(userName, userKey).then(lang.hitch(this, function (results) {
                               console.log("updateUsername",userName, userKey, this.getUserInfoState(userKey),results )
                               if(results[0].affectedRows === 1)
                               {
                                   Resolve({Success: "Username Changed"})
                                   this.getUserInfoState(userKey).set("userName", userName)
                               }else if(results[0].affectedRows === 0){
                                   Reject({Error: "No Rows Affected"})
                               }else {
                                   Reject({Error: "Unexpected Results", Results: results})
                               }
                           })).catch(function (Error) {
                               Reject({Error: Error})
                           });
                    }else{
                        Reject({Error: "Error - userKey and userName must be provided", userInfo: [userName, userKey]})
                    }
                }));
            },
            updateUserIcon: function(iconBase64, userKey){
                console.log("updateUserIcon" , this.usersControllerCommands, iconBase64, userKey);
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if(userKey && iconBase64){
                        this._dbController.updateUserIconInDatabase(iconBase64, userKey).then(lang.hitch(this, function (results) {
                            console.log("updateUserIcon",iconBase64, userKey, this.getUserInfoState(userKey),results )
                            if(results[0].affectedRows === 1)
                            {
                                Resolve({Success: "Icon Changed"})
                                this.getUserInfoState(userKey).set("icon", iconBase64)
                            }else if(results[0].affectedRows === 0){
                                Reject({Error: "No Rows Affected"})
                            }else {
                                Reject({Error: "Unexpected Results", Results: results})
                            }
                        })).catch(function (Error) {
                            Reject({Error: Error})
                        });
                    }else{
                        Reject({Error: "Error - userKey and iconBase64 must be provided", userInfo: [iconBase64, userKey]})
                    }
                }));
            },
            updateUserPassword: function(password, userKey){
                console.log("updateUserPassword" , this.usersControllerCommands, password, userKey);
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if(userKey && password){
                        this._dbController.updateUserPasswordInDatabase(password, userKey).then(lang.hitch(this, function (results) {
                            console.log("updateUserPassword",password, userKey, this.getUserInfoState(userKey),results )
                            if(results[0].affectedRows === 1)
                            {
                                Resolve({Success: "Password Changed"})
                                this.getUserInfoState(userKey).set("password", Date(Date().getTime()).toString())
                            }else if(results[0].affectedRows === 0){
                                Reject({Error: "No Rows Affected"})
                            }else {
                                Reject({Error: "Unexpected Results", Results: results})
                            }
                        })).catch(function (Error) {
                            Reject({Error: Error})
                        });
                    }else{
                        Reject({Error: "Error - userKey and password must be provided", userInfo: [iconBase64, userKey]})
                    }
                }));
            },
            //##########################################################################################################
            //Private Methods
            //##########################################################################################################
            getUserListState: function(userKey){
                if(!this._userListStates[userKey]){
                    let UserListState =  declare([Stateful], {})
                    this._userListStates[userKey] = UserListState({})
                    this.loadUserListFor(userKey)
                }
                return this._userListStates[userKey]
            },
            getUserInfoState: function(userKey){
                if (!this._userInfoStates[userKey]){
                    let UserInfoState = declare([Stateful], {
                        userKey: null
                    });
                    this._userInfoStates[userKey] = new UserInfoState({
                        userKey: userKey
                    });
                    this.loadIconAndName(userKey)
                }
                return this._userInfoStates[userKey]
            },
            isUserAdmin: function(userKey){
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if(userKey){

                        this._dbController.getUserInfoFromDatabaseByKey(userKey).then(function (results) {
                            //todo update User Store
                            console.log("🟦🟦🟦🟦", results )
                            if(results && Array.isArray(results))
                            {
                                let userData = results[0]
                                let permissionGroups = JSON.parse(String.fromCharCode(...new Uint8Array(userData.permission_groups)));
                                if(permissionGroups && Array.isArray(permissionGroups)
                                    && permissionGroups.includes("admin")) {
                                    Resolve(true) ;
                                }else
                                {
                                    Reject({Error: "Not valid administration user Key"});
                                }
                            }else{
                                Reject({Error: "Not valid administration user Key"});
                            }
                        }).catch(function (error) {
                            Reject(error);
                        });
                    }else{
                        Reject({Error: "Error - new UserData or admin key not as expected", userInfo: [userData, adminUserKey]})
                    }
                }));
            },

            loadUserListFor: function(userKey){

                let userListState =  this.getUserListState(userKey)

                this._dbController.getUsersKeysFromDatabase().then(function (usersFromDatabase) {
                    if(typeof usersFromDatabase.forEach === 'function')
                    {
                        usersFromDatabase.forEach(lang.hitch(this, function(user){
                            userListState.set(user.userKey.toString(), user.userKey.toString())
                        }))
                    }
                }).catch(function (Error) {
                    console.log("loadUserListFor Error", Error);
                });
            },
            loadIconAndName: function(userKey){
                this._dbController.getUserIconAndNameFromDatabaseByKey(userKey).then(lang.hitch(this, function (results) {
                    this.getUserInfoState(userKey).set("icon", results[0].icon)
                    this.getUserInfoState(userKey).set("userName", results[0].name)

                })).catch(function (error) {
                });
            }

        });
    }
);
