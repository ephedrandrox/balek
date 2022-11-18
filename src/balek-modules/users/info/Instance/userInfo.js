define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-server/session/sessionsController/instanceCommands',
        'balek-modules/components/syncedCommander/Instance',
        'balek-modules/components/syncedMap/Instance'
    ],
    function (declare,
              lang,
              SessionsControllerInstanceCommands,
              _SyncedCommanderInstance,
              SyncedMapInstance) {
        return declare("moduleUserInfoMainInstance", [_SyncedCommanderInstance], {
            sessionsControllerCommands: null,

            userSessions: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleUserInfoMainInstance");

                this.userSessions = new SyncedMapInstance({_instanceKey: this._instanceKey})
                this._interfaceState.set("userSessionsComponentKey", this.userSessions._componentKey);

                let sessionsControllerInstanceCommands = new SessionsControllerInstanceCommands();
                this.sessionsControllerCommands = sessionsControllerInstanceCommands.getCommands();
                let sessionKey = this._sessionKey
                let session = this.sessionsControllerCommands.getSessionByKey(this._sessionKey)
                let sessions = this.sessionsControllerCommands.getSessionsForUserKey(session.getUserKey())
                //creates component Key that can be used to connect to state
                console.log("sessions for uer:", session, sessions);
                let sessionsList = this.sessionsControllerCommands.getUserSessionList(session.getUserKey())
                console.log("sessions state:", sessionsList);

                this.userSessions.add("Status", "Ready")
                this.prepareSyncedState();
                this._interfaceState.set("Status", "Ready")
            },
            //##########################################################################################################
            //Base Instance Override Function
            //##########################################################################################################
            _end: function(){
                //calls inherited _end functions like stateSynced Object
                this.inherited(arguments);
            }
        });
    });