define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/balekute/connect/Instance/main',

        'balek-modules/components/syncedCommander/Instance',
        'balek-modules/components/syncedMap/Instance',

    ],
    function (declare, lang, topic, MainInstance, _SyncedCommanderInstance, SyncedMapInstance) {

        return declare("moduleBalekuteConnectInstance", _SyncedCommanderInstance, {
            _instanceKey: null,


            mainInstance: null,

            stateWatchers: null,

            availableInvitations: null,
            constructor: function (args) {

                declare.safeMixin(this, args);

                this.stateWatchers = {}
                console.log("moduleBalekuteConnectInstance starting...",this);

                //set setRemoteCommander commands
                this._commands={
                    "useTargetKey" : lang.hitch(this, this.useTargetKey),
                    "acceptDeviceInfo" : lang.hitch(this, this.acceptDeviceInfo),
                    "useInvitationKey": lang.hitch(this, this.useInvitationKey),
                    "createInvitationKey" : lang.hitch(this, this.createInvitationKey),
                    "connectInvitationState" : lang.hitch(this,this.connectInvitationState)
                };

                this.availableInvitations  = new SyncedMapInstance({_instanceKey: this._instanceKey});


                this._interfaceState.set("availableInvitationsComponentKey", this.availableInvitations._componentKey);


                this._interfaceState.set("Component Name","Connect");
                //creates component Key that can be used to connect to state
                this.setInterfaceCommands();

                this.prepareSyncedState();

                this._interfaceState.set("Status", "Ready");

                this.mainInstance = new MainInstance({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey, _userKey: this._userKey,
                _connectController: this.moduleController});

                this._interfaceState.set("mainInstanceKeys", {instanceKey: this.mainInstance._instanceKey,
                    sessionKey: this.mainInstance._sessionKey,
                   userKey: this.mainInstance._userKey,
                    componentKey: this.mainInstance._componentKey});

               // this.setInterfaceCommands();

            },
            acceptDeviceInfo: function(invitationKey, remoteCallback)
            {
                console.log("acceptDeviceInfo", invitationKey);

                topic.publish("getSessionUserKey", this._sessionKey, lang.hitch(this, function (userKey) {
                    if (userKey != null ){
                        this._userKey = userKey;


                        this.moduleController.userAcceptDeviceInfo({owner: {instanceKey: this._instanceKey,
                                sessionKey: this._sessionKey,
                                userKey: this._userKey}, invitationKey:
                            invitationKey,}).then(lang.hitch(this, function (Result) {

                            remoteCallback({Result: Result})
                            if(Result && Result.newKey){
                                let newInvitationKey = Result.newKey
                                console.log("Adding invitation to available list with key:", newInvitationKey);

                                let newInvitation = this.moduleController.getInvitationState(newInvitationKey);
                                console.log("Adding invitation:", newInvitation);

                                this.availableInvitations.add(newInvitationKey, newInvitation );

                            }


                        })).catch(function(rejectError){
                            remoteCallback({error: rejectError})
                        })
                    }else{
                        remoteCallback({error: "Cannot create Invitation without user Key"})
                    }

                }));
            },
            useTargetKey: function( targetKey, signature, deviceInfo, remoteCallback){
                console.log("useTargetKey", targetKey, deviceInfo, arguments);


                if( typeof targetKey === 'string' && typeof signature === 'string' && typeof deviceInfo === 'object' &&
                    typeof remoteCallback === 'function'  )
                {
                    this.moduleController.useTargetKey(targetKey,signature,deviceInfo).then(lang.hitch(this, function (Result) {
                        console.log("this.moduleController.useTargetKey",Result)
                        remoteCallback({Result: Result})
                    })).catch(function(rejectError){
                        remoteCallback({error: rejectError})
                    })
                }else {
                    console.log("❗️Unexpected Arguments! useTargetKey: function( targetKey, signature, deviceInfo, remoteCallback)‼️",arguments)
                }


            },
            useInvitationKey: function( invitationKey, deviceInfo, remoteCallback){
                console.log("useInvitationKey", invitationKey, deviceInfo, arguments);


                if( typeof invitationKey === 'string' && typeof deviceInfo === 'object' &&
                    typeof remoteCallback === 'function'  )
                {
                    this.moduleController.useInvitationKey(invitationKey,deviceInfo).then(lang.hitch(this, function (Result) {
                        console.log("this.moduleController.useInvitationKey",Result)
                        remoteCallback({Result: Result})
                    })).catch(function(rejectError){
                        remoteCallback({error: rejectError})
                    })
                }else {
                    console.log("❗️Unexpected Arguments! useInvitationKey: function( invitationKey, hostname, publicSigningKey, remoteCallback)‼️",arguments)
                }


            },
            createInvitationKey: function( input, remoteCallback){
                console.log("createInvitationKey", input);

                let invitationHost = input

                topic.publish("getSessionUserKey", this._sessionKey, lang.hitch(this, function (userKey) {
                    if (userKey != null ){
                        this._userKey = userKey;
                        console.log("createInvitationKey - UserKey", userKey);

                        this.moduleController.createInvitation({owner: {instanceKey: this._instanceKey,
                                sessionKey: this._sessionKey,
                                userKey: this._userKey}, host:
                        invitationHost}).then(lang.hitch(this, function (Result) {

                            remoteCallback({Result: Result})
                            if(Result && Result.newKey){
                                let newInvitationKey = Result.newKey
                                console.log("Adding invitation to available list with key:", newInvitationKey);

                                let newInvitation = this.moduleController.getInvitationState(newInvitationKey);
                                console.log("Adding invitation:", newInvitation);

                                this.availableInvitations.add(newInvitationKey, newInvitation );

                            }


                        })).catch(function(rejectError){
                            remoteCallback({error: rejectError})
                        })
                    }else{
                        remoteCallback({error: "Cannot create Invitation without user Key"})
                    }

                }));
                },
            connectInvitationState: function(invitationKey, remoteCallback){

                let invitationState = this.moduleController.getInvitationState(invitationKey)
                if(invitationState && typeof invitationState.watch === 'function'){

                    //Send state that already exists
                         Object.entries(invitationState).forEach(function(entry) {
                             const key = entry[0]
                             const value = entry[1]
                        if(typeof value !== 'function')
                        {
                            console.log("🟦🟩🟦🟩", key, value);
                            remoteCallback({name: key, newState: value})
                        }else {
                            console.log("🟥🟧🟥🟧", key, value);
                        }
                     });

                    if( !this.stateWatchers[invitationKey] )
                    {
                        this.stateWatchers[invitationKey] = invitationState.watch(lang.hitch(this, function(name, oldState, newState){
                            remoteCallback({name: name, oldState: oldState, newState: newState})
                        }))
                    }else{
                        this.stateWatchers[invitationKey].unwatch()
                        this.stateWatchers[invitationKey] = invitationState.watch(lang.hitch(this, function(name, oldState, newState){
                            remoteCallback({name: name, oldState: oldState, newState: newState})
                        }))
                    }


                }else {
                    remoteCallback({Error: "wrong type", type: typeof invitationState})
                }

            },
            _end: function () {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    console.log("destroying balekute connect Module Interface ");

                    Resolve({success: "Unloaded Instance"});
                }));
            }
        });
    }
);