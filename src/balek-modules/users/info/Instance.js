define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        //Balek Components
        'balek-modules/users/info/Instance/userInfo',
        'balek-modules/components/syncedCommander/Instance',
        'balek-server/session/sessionsController/instanceCommands',

        'balek-server/users/usersController/instanceCommands',

    ],
    function (declare, lang, topic, UserInfo, _SyncedCommanderInstance,
              SessionsControllerInstanceCommands,UsersControllerInstanceCommands) {
        return declare("moduleUsersInfoInstance", _SyncedCommanderInstance, {
            _instanceKey: null,
            _userInfoInstance: null,


            sessionsList: null,
            sessionsListWatchHandle: null,
            sessionsControllerCommands: null,
            usersControllerCommands: null,

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("moduleUsersInfoInstance starting...");
                this._interfaceState.set("Component Name","User Info");
                this._interfaceState.set("Status", "Starting");

                let sessionsControllerInstanceCommands = new SessionsControllerInstanceCommands();
                this.sessionsControllerCommands = sessionsControllerInstanceCommands.getCommands();

                let usersControllerInstanceCommands = new UsersControllerInstanceCommands();
                this.usersControllerCommands = usersControllerInstanceCommands.getCommands();

                this._commands={
                    "updateUsername" : lang.hitch(this, this.updateUsername),
                    "updateUserIcon" : lang.hitch(this, this.updateUserIcon)
                };

                this.setInterfaceCommands();

                this.prepareSyncedState();

                //Create the main Instance
                this._userInfoInstance = new UserInfo({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey, _userKey: this._userKey,
                    _Controller: this});
                //Set Main Instance keys for interface
                this._interfaceState.set("userInfoInstanceKeys", {instanceKey: this._userInfoInstance._instanceKey,
                    sessionKey: this._userInfoInstance._sessionKey,
                    componentKey: this._userInfoInstance._componentKey});

                this._interfaceState.set("Status", "Started");

            },
            updateUsername: function(userName, remoteCommandCallback){
                let userKey = this.sessionsControllerCommands.getSessionByKey(this._sessionKey).getUserKey()
                this.usersControllerCommands.updateUsername(userName, userKey).then(lang.hitch(this,function(Result){
                    remoteCommandCallback({SUCCESS: Result})
                })).catch(lang.hitch(this,function(Error){
                    remoteCommandCallback({Error: Error})
                }))
            },
            updateUserIcon: function(iconBuffer, remoteCommandCallback){
                if(iconBuffer && iconBuffer.data){
                try{
                    let userKey = this.sessionsControllerCommands.getSessionByKey(this._sessionKey).getUserKey()
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
            //##########################################################################################################
            //Base Instance Override Function
            //##########################################################################################################
            _end: function () {
                //calls inherited _end functions like stateSynced Object
                this.inherited(arguments);
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    console.log("destroying User Info Instance ");
                    Resolve({success: "Unloaded Instance"});
                }));
            }
        });
    }
);


