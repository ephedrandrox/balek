define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        //Digiscan Instance sub modules
        'balek-modules/digivigil/digiscan/Instance/main',
        //Balek Components
        'balek-modules/components/syncedCommander/Instance',
        'balek-modules/components/syncedMap/Instance',
        'balek-server/session/sessionsController/instanceCommands'
    ],
    function (declare, lang, topic,
              MainInstance,
              _SyncedCommanderInstance, SyncedMapInstance, SessionsControllerInstanceCommands) {

        return declare("moduleDigivigilDigiscanInstance", _SyncedCommanderInstance, {
            _instanceKey: null,

            _module: null,
            _moduleController: null,


            userCaptures: null, //if session has user key then this is dojo Stateful
            availableCaptures: null,             //SyncedMapInstance
         //   interestedCaptures: null,

            captureSets: null,

            uiState: null, //SyncedMapInstance


            controllerEntries: null,            //Controller Entries State
            controllerEntriesWatchHandle: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDigivigilDigiscanInstance starting...");

                let sessionsControllerInstanceCommands = new SessionsControllerInstanceCommands();
                this.sessionsControllerCommands = sessionsControllerInstanceCommands.getCommands();





                //set setRemoteCommander commands
                this._commands={
                    //captures
                    "addCapture" : lang.hitch(this, this.addCapture),
                    "removeAllCaptures" : lang.hitch(this, this.removeAllCaptures),
                    "getCaptureSyncedMap" : lang.hitch(this, this.getCaptureSyncedMap),

                    //"setCaptureUninterested" : lang.hitch(this, this.setCaptureUninterested),
                    //uiState Update Commands
                    "setUIActiveView" : lang.hitch(this, this.setUIActiveView),
                    "showHiddenCaptures": lang.hitch(this, this.showHiddenCaptures),
                    //CaptureSets
                    "newAllSet" : lang.hitch(this, this.newAllSet),
                    "newClearSet" : lang.hitch(this, this.newClearSet),
                    "deleteCaptureSet" : lang.hitch(this, this.deleteCaptureSet),
                    "renameCaptureSet" : lang.hitch(this, this.renameCaptureSet),
                    "clearCaptureSet" : lang.hitch(this, this.clearCaptureSet),

                    "selectCaptureSet" : lang.hitch(this, this.selectCaptureSet),
                    "removeCaptureFromSet": lang.hitch(this, this.removeCaptureFromSet),
                    "addCaptureToSet": lang.hitch(this, this.addCaptureToSet),
                    "getCaptureSetSyncedMap" : lang.hitch(this, this.getCaptureSetSyncedMap),

                };

                this.availableCaptures = new SyncedMapInstance({_instanceKey: this._instanceKey});
                this._interfaceState.set("availableCapturesComponentKey", this.availableCaptures._componentKey);

                this.captureSets = new SyncedMapInstance({_instanceKey: this._instanceKey});
                this._interfaceState.set("captureSetsComponentKey", this.captureSets._componentKey);

                let userKey = this.sessionsControllerCommands.getSessionUserKey(this._sessionKey)
                if (userKey != null ) {
                    this.userCaptures = this._moduleController.getCapturesForUser(userKey)
                    this.availableCaptures.relayState(this.userCaptures)

                    this.userCaptureSets = this._moduleController.getCaptureSetsForUser(userKey)

                    console.log("capt🔴🔴🤛", this.userCaptureSets)
                    this.captureSets.relayState(this.userCaptureSets)
                }



               // this.captureSets.relayState(this._moduleController.getCaptureSets())

                this.uiState = new SyncedMapInstance({_instanceKey: this._instanceKey});
                this.uiState.add("ActiveView", "previewDiv")


                this._interfaceState.set("uiStateComponentKey", this.uiState._componentKey);


                this._interfaceState.set("Component Name","Digivigil Digiscan - Change to Scaptura!");
                this._interfaceState.set("Status", "Starting");
                //creates component Key that can be used to connect to state
                this.setInterfaceCommands();
                this.prepareSyncedState();

                //Create the main Instance
                this.mainInstance = new MainInstance({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey, _userKey: this._userKey,
                    _Controller: this});
                //Set Main Instance keys for interface
                this._interfaceState.set("mainInstanceKeys", {instanceKey: this.mainInstance._instanceKey,
                     sessionKey: this.mainInstance._sessionKey,
                     componentKey: this.mainInstance._componentKey});


                // if(this.userCaptures !== null){
                //   //  this.availableCaptures.relayState(this.userCaptures)
                // }else{
                //     //Get Controller Entries State
                //     let Entries = this._moduleController.getCaptures()
                //     //Add all Controller Entries to our Available Entries
                //     for (const key in Entries) {
                //         let value = Entries[key]
                //         if(typeof value !== 'function' && value._id && value._id.toString() == key){
                //             console.log("adding Entries from controller entries State", key, value)
                //             this.availableCaptures.add(key, value );
                //             // this.interestedCaptures.add(value.entry.id, value.entry.id );
                //         }
                //     }
                //     //set and watch the Controller Entries State
                //     this.controllerEntries = Entries
                //     this.controllerEntriesWatchHandle = Entries.watch(lang.hitch(this, this.onControllerEntriesStateChange))
                // }

                this._interfaceState.set("Status", "Ready");

            },
            // onControllerEntriesStateChange: function (name, oldState, newState) {
            //     //When a new entry becomes available, add it to our Available State
            //     //check this is our users capture
            //     this.availableCaptures.add(name, newState );
            //
            //
            //     //this._moduleController.addCaptureToAllCaptureSets(name, newState)
            //     // if(this.interestedCaptures.add !== null){
            //     //     this.interestedCaptures.add(name, name );
            //     //
            //     // }else {
            //     //     console.log("Not setting InterestedCaptures")
            //     // }
            //
            // },
            addCapture: function(Entry, resultCallback){
                console.log("addCapture Entry:", Entry)
                this._moduleController.addCapture(Entry).then(lang.hitch(this, function(Result){
                    resultCallback({SUCCESS: Result})
                })).catch(lang.hitch(this, function(Error){
                    resultCallback({Error: Error})
                }))
            },
            addCaptureSet: function(CaptureSet, resultCallback){
                let userKey = this.sessionsControllerCommands.getSessionByKey(this._sessionKey).getUserKey()

                console.log("addCaptureSet:", CaptureSet, userKey)
                this._moduleController.addCaptureSet(CaptureSet, userKey).then(lang.hitch(this, function(Result){
                    resultCallback({SUCCESS: Result})

                })).catch(lang.hitch(this, function(Error){
                    resultCallback({Error: Error})
                }))
            },
            removeAllCaptures: function( resultCallback){
                console.log("removeAllCaptures Entry:")
                this._moduleController.removeAllCaptures().then(lang.hitch(this, function(Result){
                    resultCallback({SUCCESS: Result})
                    console.log("resultCallbacked ",Result)
                    this.availableCaptures.forEach(lang.hitch(this, function(id, capture){
                        console.log("availableCaptures", id, capture,  this.availableCaptures)
                        this.availableCaptures.add(id, undefined)

                    }))
                    console.log("resultCallbacked after ",Result)

                })).catch(lang.hitch(this, function(Error){
                    resultCallback({Error: Error})
                }))
            },

            getCaptureSyncedMap: function(captureID, resultCallback){
                console.log("getCaptureSyncedMap1:", captureID)
                this._moduleController.getCaptureSyncedMap(captureID, this._instanceKey).then(lang.hitch(this, function(Result){
                    resultCallback(Result)
                })).catch(lang.hitch(this, function(Error){
                     resultCallback({Error: Error})
                }))
            },
            getStatefulCaptureSet: function(captureID){
                return this._moduleController.getStatefulCaptureSet(captureID)
            },
            getCaptureSetSyncedMap: function(captureSetID, resultCallback){
                console.log("getCaptureSetSyncedMap:", captureSetID)
                this._moduleController.getCaptureSetSyncedMap(captureSetID, this._instanceKey).then(lang.hitch(this, function(Result){
                    resultCallback(Result)
                })).catch(lang.hitch(this, function(Error){
                    resultCallback({Error: Error})
                }))
            },
            // setCaptureUninterested:  function(captureID, resultCallback){
            //     console.log("setCaptureUninterested Entry", captureID)
            //     resultCallback({SUCCESS: "set interested"})
            //
            //     this.interestedCaptures.add(captureID.toString(), null )
            // },
            setUIActiveView: function(activeView, resultCallback){

                if(typeof activeView === "string"){
                    this.uiState.add("ActiveView", activeView)
                    resultCallback({SUCCESS: "set"})
                }else{
                    resultCallback({ERROR : "instance -> setUIActiveView: activeView is not a string"})
                }
            },
            //interface Command
            newAllSet : function(setName, resultCallback) {
                this.createCaptureSet(setName, true, resultCallback)
            },
            //interface Command
            newClearSet : function(setName, resultCallback){
                this.createCaptureSet(setName, false, resultCallback)
            },
            //Called from interface Commands
            createCaptureSet : function(name, appendAll, resultCallback){


                if(typeof name === "string" && typeof appendAll === "boolean"){

                    let captures = this.createInitialCaptureSetCaptures(appendAll)
                    this.addCaptureSet({name: name, appendAll: appendAll, captures: captures}, resultCallback)
                    resultCallback({SUCCESS: "New Capture Set " + name + "added successfully"})
                }else{
                    resultCallback({ERROR : "instance -> newAllSet: setName is not a string"})
                }
            },
            removeCaptureFromSet: function(captureSetID, captureID, resultCallback){

                console.log("removeCaptureFromSet",captureSetID, captureID, resultCallback )

                //resultCallback({  SUCCESS : "instance -> removeCapture"})

                if(typeof captureSetID === "string" && typeof captureID === "string" && typeof resultCallback === "function"){
                    console.log("removeCaptureFromSet2",captureSetID, captureID, resultCallback )

                    this._moduleController.removeCaptureFromSet(captureSetID, captureID ).then(lang.hitch(this, function(Result){
                        resultCallback({SUCCESS: Result})
                    })).catch(lang.hitch(this, function(Error){
                        console.log("removeCaptureFromSetError",captureSetID, captureID, Error )

                        resultCallback({Error: Error})
                    }))


                }else{
                    resultCallback({ERROR : "instance -> deleteCaptureSet: id is not a string"})
                }


            },
            addCaptureToSet: function(captureSetID, captureID, resultCallback){
                console.log("addCaptureToSet", captureSetID, captureID, resultCallback )

                //resultCallback({  SUCCESS : "instance -> removeCapture"})

                if(typeof captureSetID === "string" && typeof captureID === "string" && typeof resultCallback === "function"){
                    console.log("addCaptureToSet",captureSetID, captureID, resultCallback )

                    this._moduleController.addCaptureToSet(captureSetID, captureID ).then(lang.hitch(this, function(Result){
                        resultCallback({SUCCESS: Result})
                    })).catch(lang.hitch(this, function(Error){
                        console.log("addCaptureToSet Error",captureSetID, captureID, Error )

                        resultCallback({Error: Error})
                    }))


                }else{
                    resultCallback({ERROR : "instance -> addCaptureToSet: unexpected Data"})
                }


            },
            showHiddenCaptures: function (showHidden, resultCallback){
                if(typeof showHidden === "boolean" && typeof resultCallback === "function") {
                    this.uiState.add("showHiddenCaptures", showHidden)
                }
            },

            createInitialCaptureSetCaptures: function(appendAll)
            {
                let captures = {}
                if(appendAll === true){



                    for (const captureID in this.userCaptures) {
                        if (this.userCaptures.hasOwnProperty(captureID) && captureID !== "_watchCallbacks") {
                            const checkSum = this.userCaptures.get(captureID);
                            captures[captureID] = {inSet: true}
                            // Do something with the property
                            console.log("Property captureID:", captureID);
                            console.log("Property checkSum:", checkSum);
                        }
                    }

                    // this.availableCaptures.forEach(function (key, value){
                    //
                    // })

                }

                return captures
            },
            deleteCaptureSet : function(id, resultCallback){
                if(typeof id === "string" && typeof resultCallback === "function"){
                    this._moduleController.deleteCaptureSet(id).then(lang.hitch(this, function(Result){
                        this.captureSets.add(id, null)
                        resultCallback({SUCCESS: Result})
                    })).catch(lang.hitch(this, function(Error){
                        resultCallback({Error: Error})
                    }))


                }else{
                    resultCallback({ERROR : "instance -> deleteCaptureSet: id is not a string"})
                }
            },
            renameCaptureSet : function(id, name, resultCallback){
                if(typeof id === "string" && typeof name === "string" && typeof resultCallback === "function"){
                    this._moduleController.renameCaptureSet(id, name).then(lang.hitch(this, function(Result){
                     //   this.captureSets.add(id, null)
                        resultCallback({SUCCESS: Result})
                    })).catch(lang.hitch(this, function(Error){
                        resultCallback({Error: Error})
                    }))


                }else{
                    resultCallback({ERROR : "instance -> deleteCaptureSet: id is not a string"})
                }
            },
            clearCaptureSet: function(id, resultCallback){
                if(typeof id === "string" && typeof resultCallback === "function"){
                    this._moduleController.clearCaptureSet(id).then(lang.hitch(this, function(Result){

                        resultCallback({SUCCESS: Result})
                    })).catch(lang.hitch(this, function(Error){
                        resultCallback({Error: Error})
                    }))


                }else{
                    resultCallback({ERROR : "instance -> clearCaptureSet: id is not a string", is: id})
                }
            },

            selectCaptureSet : function(id, resultCallback){
                if(typeof id === "string" && typeof resultCallback === "function"){

this.uiState.add("selectedCaptureSet", id)


                        resultCallback({SUCCESS: "selectCaptureSet selected" + id})



                }else{
                    resultCallback({ERROR : "instance -> selectCaptureSet: id is not a string"})
                }
            },

            //##########################################################################################################
            //Base Instance Override Function
            //##########################################################################################################
            _end: function () {
                //calls inherited _end functions like stateSynced Object
                this.inherited(arguments);
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    console.log("destroying Digiscan Module Instance ");
                    this.controllerEntriesWatchHandle.unwatch()
                    Resolve({success: "Unloaded Instance"});
                }));
            }
        });
    }
);


