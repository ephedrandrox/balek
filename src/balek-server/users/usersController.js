define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/topic',

        'dojo/Stateful',

        'balek-server/users/usersController/instanceCommands',
        "balek-server/users/dbController"

    ],
    function (declare, lang, topic, Stateful,InstanceCommands, userDbController
    ) {
        return declare("balekUsersController", null, {

            statusAsState: null,
            _instanceCommands: null,
            _dbController: null,

            _usersManager: null,
            _userStates: null,

            _userInfoWatchers: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                if(!this._usersManager){
                    console.log("balekUsersController NOT starting...");

                }else {
                    console.log("balekUsersController  starting...");

                    this._UserState = declare([Stateful], {
                        userName: null,
                        userKey: null
                    });
                    this._userStates = {};


                    this._userInfoWatchers = {}

                    let StatusState = declare([Stateful], {});
                    this.statusAsState = new StatusState({});
                    this.statusAsState.set("Status", "Starting")


                    this._instanceCommands = new InstanceCommands();
                    this._instanceCommands.setCommand("getUserState", lang.hitch(this, this.getUserState))
                    this._instanceCommands.setCommand("updateUsername", lang.hitch(this, this.updateUsername))
                    this._instanceCommands.setCommand("updateUserIcon", lang.hitch(this, this.updateUserIcon))


                    this._dbController = new userDbController();

                    //todo remove loading all
                    //load as state is requested
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

                }
            },
            //Interface Commands:

            //##########################################################################################################
            //Relay User Info State
            //##########################################################################################################
            relayUserInfoState: function(userKey, sessionKey, messageReplyCallback){
                let userInfoState =  this._usersManager._userStates[userKey]
                let stateEntries = Object.entries(userInfoState)
                for(KeyValIndex in stateEntries)
                {
                    let objectKey = stateEntries[KeyValIndex][0]
                    let object = userInfoState.get(objectKey)
                    if(typeof object !== 'function' ){
                        messageReplyCallback({userInfoState: {name: objectKey ,
                                newState: object }})
                    }else {
                        console.log("Skipping 🛑🛑🔵🔵🔵🔵🔵🔵", objectKey, userInfoState[objectKey], Object.entries(userInfoState))
                    }
                }
                let watchHandle = userInfoState.watch(lang.hitch(this, function(name, oldState, newState){
                    messageReplyCallback({userInfoState: {name: name , newState: newState}})
                }))
                this.loadIcon(userKey)
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
            //Relay User Info State End
            //##########################################################################################################
            //Instance Commands
            updateUsername: function(userName, userKey){
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if(userKey && userName){
                           this._dbController.updateUsernameInDatabase(userName, userKey).then(lang.hitch(this, function (results) {
                               console.log("updateUsername",userName, userKey, this._usersManager._userStates[userKey],results )
                               if(results[0].affectedRows === 1)
                               {
                                   Resolve({Success: "Username Changed"})
                                   this._usersManager._userStates[userKey].set("userName", userName)
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
                            console.log("updateUserIcon",iconBase64, userKey, this._usersManager._userStates[userKey],results )
                            if(results[0].affectedRows === 1)
                            {
                                Resolve({Success: "Icon Changed"})
                                this._usersManager._userStates[userKey].set("icon", iconBase64)
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
            getUserState: function(userKey)
            {
                //todo make state then load from database
                this.loadIcon(userKey)
                return this._usersManager._userStates[userKey]
            },
            loadIcon: function(userKey){
                this._dbController.getUserIconFromDatabaseByKey(userKey).then(lang.hitch(this, function (results) {
                    this._usersManager._userStates[userKey].set("icon", results[0].icon)
                })).catch(function (error) {
                });
            }

        });
    }
);
