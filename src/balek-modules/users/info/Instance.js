define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        //Balek Components
        'balek-modules/users/info/Instance/userInfo',
        'balek-modules/components/syncedMap/Instance',
        'balek-modules/components/syncedCommander/Instance',
        'balek-server/session/sessionsController/instanceCommands',

    ],
    function (declare, lang, topic, UserInfo, SyncedMapInstance, _SyncedCommanderInstance,SessionsControllerInstanceCommands) {
        return declare("moduleUsersInfoInstance", _SyncedCommanderInstance, {
            _instanceKey: null,
            _userInfoInstance: null,

            availableSessions: null,

            sessionsList: null,
            sessionsListWatchHandle: null,

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("moduleUsersInfoInstance starting...");
                this._interfaceState.set("Component Name","User Info");
                this._interfaceState.set("Status", "Starting");

                this.availableSessions = new SyncedMapInstance({_instanceKey: this._instanceKey});
                this._interfaceState.set("availableSessionsComponentKey", this.availableSessions._componentKey);

                let sessionsControllerInstanceCommands = new SessionsControllerInstanceCommands();
                this.sessionsControllerCommands = sessionsControllerInstanceCommands.getCommands();
                let sessionKey = this._sessionKey
                let session = this.sessionsControllerCommands.getSessionByKey(this._sessionKey)
                let sessions = this.sessionsControllerCommands.getSessionsForUserKey(session.getUserKey())
                //creates component Key that can be used to connect to state
                console.log("sessions for uer:", session, sessions);
                let sessionsList = this.sessionsControllerCommands.getUserSessionList(session.getUserKey())
                console.log("sessions state:", sessionsList);
                this.sessionsList = sessionsList


                // //todo make syncedmap addstate(state) start here and add watch function
                // for (const key in sessionsList) {
                //     let value = sessionsList[key]
                //     if(typeof value !== 'function' ){
                //         console.log("adding available Sessions from  State", key, value)
                //         this.availableSessions.add(key, value );
                //     }
                // }

               // sessionListWatchHandle = sessionsList.watch(lang.hitch(this, this.onSessionListChange))
                this.availableSessions.relayState(sessionsList)
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
            onSessionListChange: function(name, oldState, newState){
                console.log("onSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChange",name, oldState, newState)
//add this to suyncedmap as .relayState(stateToRelay)

                if (newState === undefined){
                    this.availableSessions.remove(name)
                    console.log("remove",name, oldState, newState)

                }else{
                    this.availableSessions.add(name, newState)
                    console.log("onSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChange",name, oldState, newState)

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


