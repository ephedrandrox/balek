define(['dojo/_base/declare',
        'dojo/topic',
        'dojo/_base/lang',

        //Balek Instance Includes
        "balek-server/session/sessionsController/instanceCommands",

        'balek-modules/components/syncedCommander/Instance',
        'dojo/node!qrcode'
    ],
    function (declare,
              topic,
              lang,

              //Balek Instance Includes
              SessionControllerInstanceCommands,
              _SyncedCommanderInstance,
              QRCode) {
        return declare("moduleBalekuteConnectMainInstance", [_SyncedCommanderInstance], {

            _connectController: null,

            sessionControllerCommands: null,

            target : null,
            targetState: null,
            targetStateWatchHandle: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                // console.log("starting moduleBalekuteConnectMainInstance");


                let sessionControllerInstanceCommands = new SessionControllerInstanceCommands();
                this.sessionControllerCommands = sessionControllerInstanceCommands.getCommands();

                // console.log("SessionCommands created" )
                //set setRemoteCommander commands
                if(this._connectController !== null)
                {
                    this._commands={
                        "getQRCode": lang.hitch(this, this.getQRCode)
                    };
                    this.setInterfaceCommands();

                   this.target =  this._connectController.createTarget(this._sessionKey);

                    this.targetState = this.target.getState()

                    this._interfaceState.set("Component Name","Connect Main");
                    this._interfaceState.set("targetKey",this.target.getKey())

                    this.targetStateWatchHandle = this.targetState.watch(lang.hitch(this, this.onTargetStateUpdate))
                    //creates component Key that can be used to connect to state
                    this.prepareSyncedState();

                    this._interfaceState.set("Status", "Ready");

                }


            },
            onTargetStateUpdate: function(name, oldState, newState)
            {
                if(name == "targetActivated")
                {
                    debugger;
                    let currentSessionKey = this._sessionKey



                    let sessionCommands = this.sessionControllerCommands


                    let userKey = sessionCommands.getSessionUserKey(currentSessionKey);
                    let allSessions = sessionCommands.getUserSessionList(userKey);


                    const allSessionKeys = Object.keys(allSessions);
                    let looking = true
                    console.log("allSessionKeys.length", allSessionKeys.length);
                    //print allSessionKeys keys and values
                    allSessionKeys.forEach(function(key) {
                        console.log(key, allSessions[key]);
                    });

                    if(allSessionKeys.length > 1)
                    {

                        allSessionKeys.forEach(function(availableSession){
                            if(availableSession.toString() != currentSessionKey.toString()
                            && looking === true){

                                console.log("session key", availableSession);

                                let session = sessionCommands.getSessionByKey(availableSession)
                                console.log("session", session);

                                if (session && session._syncedState && session._syncedState.get("name") == "Main Web Session" ){
                                    looking = false
                                    sessionCommands.switchToSession(currentSessionKey, availableSession)
                                    looking = false
                                    sessionCommands.unloadSession(currentSessionKey).catch(lang.hitch(this, function(Error){
                                        console.log("XCVB:Error Unloading Session From Target", Error)
                                    }))
                                    const allSessionKeys = Object.keys(allSessions);
                                    looking = true
                                    //print allSessionKeys keys and values
                                    // allSessionKeys.forEach(function(key) {
                                    //     console.log(key, allSessions[key]);
                                    // });

                                }

                            }
                        })
                    }
                    if (looking === true){
                        //No Other Sessions
                        let currentSession = sessionCommands.getSessionByKey(currentSessionKey)

                        // currentSession.loadModuleInstance("diaplode/elements/files")
                        // currentSession.loadModuleInstance("diaplode/elements/notes")
                        // currentSession.loadModuleInstance("diaplode/elements/tasks")
                        //
                        // currentSession.loadModuleInstance("diaplode/navigator")
                        // currentSession.loadModuleInstance("diaplode/commander")
                        //
                        // currentSession.unloadAllInstancesOf("diaplode/login")

                        currentSession.loadModuleInstance("digivigil/digiscan")
                        currentSession.unloadAllInstancesOf("balekute/connect")
                        currentSession.unloadAllInstancesOf("diaplode/login")
                        currentSession.unloadAllInstancesOf("admin/users")
                        currentSession.updateSessionStatus({name: "Main Web Session"})

                    }

                    this._interfaceState.set("targetActivated", newState)


                    //todo if true, switch to main session or load the modules and unload login module
                    //todo allow a login module to pass a load function when balekute/connect loads
                }
            },
            getQRCode: function(input, remoteCallback){

                QRCode.toDataURL(input,{type:'terminal'}, function (err, url) {

                    remoteCallback({Result: url})
                })
            },
            //##########################################################################################################
            //Instance Override Functions Section
            //##########################################################################################################
            _end: function(){
                //calls inherited _end functions like stateSynced Object
                this.targetStateWatchHandle.unwatch()
                this.inherited(arguments);
            }
        });
    });