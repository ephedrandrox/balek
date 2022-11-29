define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/admin/users/Instance/userManagement',
        'balek-modules/admin/users/Instance/userEdit',
        'balek-modules/admin/users/Instance/newUser',

        'balek-modules/components/syncedCommander/Instance',

        'balek-server/session/sessionsController/instanceCommands',
        'balek-server/users/usersController/instanceCommands',
    ],
    function (declare, lang, topic,
              userManagementInstance, UserEditInstance, NewUserInstance,
              _syncedCommanderInstance,
              SessionsControllerInstanceCommands,UsersControllerInstanceCommands) {

        return declare("moduleAdminUsersInstance", _syncedCommanderInstance, {
            _instanceKey: null,

            _userManagementInstance: null,

            _editUserInstances: null,

            _newUserInstance: null,

            sessionsControllerCommands: null,
            usersControllerCommands: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._editUserInstances = {}
                console.log("moduleAdminUsersInstance starting...");

                this._interfaceState.set("Component Name","User Administration");
                this._interfaceState.set("Status", "Starting");

                let sessionsControllerInstanceCommands = new SessionsControllerInstanceCommands();
                this.sessionsControllerCommands = sessionsControllerInstanceCommands.getCommands();

                let usersControllerInstanceCommands = new UsersControllerInstanceCommands();
                this.usersControllerCommands = usersControllerInstanceCommands.getCommands();

                this._commands={
                    "addNewUser" : lang.hitch(this, this.addNewUser),


                    "updateUsername" : lang.hitch(this, this.updateUsername),
                    "updateUserIcon" : lang.hitch(this, this.updateUserIcon),
                    "updateUserPassword" : lang.hitch(this, this.updateUserPassword),

                    "getEditUserComponentKey" : lang.hitch(this, this.getEditUserComponentKey),
                    "getNewUserComponentKey" : lang.hitch(this, this.getNewUserComponentKey)

                };

                this.setInterfaceCommands();

                this.prepareSyncedState();

                this._userManagementInstance = new userManagementInstance({_instanceKey: this._instanceKey});

                this._interfaceState.set("userManagementInstanceKeys" , {instanceKey: this._userManagementInstance._instanceKey,
                    componentKey: this._userManagementInstance._componentKey});

                this._interfaceState.set("Status", "Started");

            },
            getEditUserInstance: function(userKey){
                if(!this._editUserInstances[userKey]){
                    this._editUserInstances[userKey] = new UserEditInstance({_instanceKey: this._instanceKey, editUserKey : userKey })
                }
                return this._editUserInstances[userKey]
            },
            getNewUserInstance: function(){
                if(!this._newUserInstance){
                    this._newUserInstance = new NewUserInstance({ _instanceKey: this._instanceKey})
                }
                return this._newUserInstance
            },
            getEditUserComponentKey: function(userKey, messageCallback){

                let userEditInstance = this.getEditUserInstance(userKey)
                let componentKey = userEditInstance._componentKey
                messageCallback(  {SUCCESS: {userKey:userKey, componentKey: componentKey }} )
            },
            getNewUserComponentKey: function(messageCallback){
                let newUserInstance = this.getNewUserInstance()
                let componentKey = newUserInstance._componentKey
                messageCallback(  {SUCCESS: { componentKey: componentKey }} )
            },
            addNewUser: function(userData, remoteCommandCallback){
                let adminUserKey = this.sessionsControllerCommands.getSessionByKey(this._sessionKey).getUserKey()
                this.usersControllerCommands.addNewUser(userData, adminUserKey).then(lang.hitch(this,function(Result){
                    remoteCommandCallback({SUCCESS: Result})
                })).catch(lang.hitch(this,function(Error){
                    remoteCommandCallback({Error: Error})
                }))
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


