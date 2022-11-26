define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/admin/users/Instance/userManagement',
        'balek-modules/components/syncedCommander/Instance',

        'balek-server/session/sessionsController/instanceCommands',
        'balek-server/users/usersController/instanceCommands',
    ],
    function (declare, lang, topic,
              userManagementInstance, _syncedCommanderInstance,
              SessionsControllerInstanceCommands,UsersControllerInstanceCommands) {

        return declare("moduleAdminUsersInstance", _syncedCommanderInstance, {
            _instanceKey: null,

            _userManagementInstance: null,

            sessionsControllerCommands: null,
            usersControllerCommands: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                console.log("moduleAdminUsersInstance starting...");

                this._interfaceState.set("Component Name","User Administration");
                this._interfaceState.set("Status", "Starting");

                let sessionsControllerInstanceCommands = new SessionsControllerInstanceCommands();
                this.sessionsControllerCommands = sessionsControllerInstanceCommands.getCommands();

                let usersControllerInstanceCommands = new UsersControllerInstanceCommands();
                this.usersControllerCommands = usersControllerInstanceCommands.getCommands();

                this._commands={
                    "updateUsername" : lang.hitch(this, this.updateUsername),
                    "updateUserIcon" : lang.hitch(this, this.updateUserIcon),
                    "updateUserPassword" : lang.hitch(this, this.updateUserPassword)

                };

                this.setInterfaceCommands();

                this.prepareSyncedState();

                this._userManagementInstance = new userManagementInstance({_instanceKey: this._instanceKey});

                this._interfaceState.set("userManagementInstanceKeys" , {instanceKey: this._userManagementInstance._instanceKey,
                    componentKey: this._userManagementInstance._componentKey});

                this._interfaceState.set("Status", "Started");

            },
            updateUsername: function(userKey, userName, remoteCommandCallback){
              //  let userKey = this.sessionsControllerCommands.getSessionByKey(this._sessionKey).getUserKey()
                console.log(arguments)
                this.usersControllerCommands.updateUsername(userName, userKey).then(lang.hitch(this,function(Result){
                    remoteCommandCallback({SUCCESS: Result})
                })).catch(lang.hitch(this,function(Error){
                    remoteCommandCallback({Error: Error})
                }))
            },
            updateUserIcon: function(userKey, iconBuffer, remoteCommandCallback){
                if(iconBuffer && iconBuffer.data){
                    try{
                   //     let userKey = this.sessionsControllerCommands.getSessionByKey(this._sessionKey).getUserKey()
                        const iconData = Object.values(iconBuffer.data);
                        const iconBase64 = Buffer.from(iconData);

                        this.usersControllerCommands.updateUserIcon(iconBase64, userKey)
                            .then(lang.hitch(this,function(Result){
                                remoteCommandCallback({SUCCESS: Result})
                            })).catch(lang.hitch(this,function(Error){
                            remoteCommandCallback({Error: Error,
                                From: "usersControllerCommands.updateUserIcon"})
                        }))
                    }catch(Error){
                        remoteCommandCallback({Error: Error,
                            From: "UpdateUserIcon Catch"})
                    }
                }else{
                    remoteCommandCallback({Error: "Did not receive an icon buffer",
                        From: "UpdateUserIcon If Logic"})
                }
            },
            updateUserPassword: function(userKey, password, remoteCommandCallback){
                if(userKey && password){
                    try{

            console.log(userKey, password, remoteCommandCallback)
                        this.usersControllerCommands.updateUserPassword(password, userKey)
                            .then(lang.hitch(this,function(Result){
                                remoteCommandCallback({SUCCESS: Result})
                            })).catch(lang.hitch(this,function(Error){
                            remoteCommandCallback({Error: Error,
                                From: "usersControllerCommands.updateUserPassword"})
                        }))
                    }catch(Error){
                        remoteCommandCallback({Error: Error,
                            From: "updateUserPassword Catch"})
                    }
                }else{
                    remoteCommandCallback({Error: "Did not receive an password or key",
                        From: "UpdateUserIcon If Logic"})
                }
            }
        });
    }
);


