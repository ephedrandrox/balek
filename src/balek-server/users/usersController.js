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

            constructor: function (args) {
                declare.safeMixin(this, args);

                if(!this._usersManager){
                    console.log("balekUsersController NOT starting...");

                }else {
                    console.log("balekUsersController  starting...");

                    this._userStates = {};


                    let StatusState = declare([Stateful], {});
                    this.statusAsState = new StatusState({});
                    this.statusAsState.set("Status", "Starting")


                    this._instanceCommands = new InstanceCommands();
                    this._instanceCommands.setCommand("getUserState", lang.hitch(this, this.getUserState))
                    this._instanceCommands.setCommand("updateUsername", lang.hitch(this, this.updateUsername))

                    this._instanceCommands.setCommand("updateUserIcon", lang.hitch(this, this.updateUserIcon))



                    this._dbController = new userDbController();

                    this._dbController.getUsersFromDatabase().then(lang.hitch(this, function (results) {
                        results.forEach ( lang.hitch(this, function(user){
                            this._userStates[user.userKey] = new this._UserState({
                                userName: user.name,
                                userKey: user.userKey
                             //   icon: user.icon // todo add function and load this when requested
                            });
                        }));
                    })).catch(function (error) {
                        debugger;
                        console.log("Could not load users from database!!!!!!!!!!" , error);
                    });

                }
            },
            //Interface Commands:

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
                //todo make this return a promise to return state once available
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
