define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        //Digiscan Instance sub modules
        'balek-modules/digivigil/digiscan/Instance/main',
        'balek-modules/digivigil/digiscan/Instance/settings',
        //Balek Components
        'balek-modules/components/syncedCommander/Instance',
        'balek-modules/components/syncedMap/Instance',
        'balek-server/session/sessionsController/instanceCommands'
    ],
    function (declare, lang, topic,
              MainInstance,
              SettingsInstance,
              _SyncedCommanderInstance, SyncedMapInstance, SessionsControllerInstanceCommands) {

        return declare("moduleDigivigilDigiscanInstance", _SyncedCommanderInstance, {
            _instanceKey: null,

            _module: null,
            _moduleController: null,

            mainInstance: null,
            settingsInstance: null,

            userCaptures: null,                 //if session has user key then this is dojo Stateful
            availableCaptures: null,             //SyncedMapInstance relays userCaptures

            captureSets: null,

            uiState: null, //SyncedMapInstance

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDigivigilDigiscanInstance starting...");

                let sessionsControllerInstanceCommands = new SessionsControllerInstanceCommands();
                this.sessionsControllerCommands = sessionsControllerInstanceCommands.getCommands();


                //set setRemoteCommander commands
                this._commands={
                    //uiState Update Commands
                    "setShowHelpfulHints" : lang.hitch(this, this.setShowHelpfulHints),
                    "setUIActiveView" : lang.hitch(this, this.setUIActiveView),
                    "showHiddenCaptures": lang.hitch(this, this.showHiddenCaptures),
                    //captures
                    "addCapture" : lang.hitch(this, this.addCapture),
                    "removeAllCaptures" : lang.hitch(this, this.removeAllCaptures),
                    "updateCaptureImage" : lang.hitch(this, this.updateCaptureImage),
                    "retrieveCaptureImage" : lang.hitch(this, this.retrieveCaptureImage),

                    "retrieveCaptureImagePreview" : lang.hitch(this, this.retrieveCaptureImagePreview),

                    "selectCapture" : lang.hitch(this, this.selectCapture),
                    "clearSelectedCaptures" : lang.hitch(this, this.clearSelectedCaptures),




                    //CaptureSets
                    "newAllSet" : lang.hitch(this, this.newAllSet),
                    "newClearSet" : lang.hitch(this, this.newClearSet),
                    "deleteCaptureSet" : lang.hitch(this, this.deleteCaptureSet),
                    "renameCaptureSet" : lang.hitch(this, this.renameCaptureSet),
                    "clearCaptureSet" : lang.hitch(this, this.clearCaptureSet),
                    "selectCaptureSet" : lang.hitch(this, this.selectCaptureSet),
                    "removeCaptureFromSet": lang.hitch(this, this.removeCaptureFromSet),
                    "addCaptureToSet": lang.hitch(this, this.addCaptureToSet),
                    //Controller Interface Commands
                    "getCaptureSetSyncedMap" : lang.hitch(this, this.getCaptureSetSyncedMap),
                    "getCaptureSyncedMap" : lang.hitch(this, this.getCaptureSyncedMap),

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
                    this.captureSets.relayState(this.userCaptureSets)
                }

                this.uiState = new SyncedMapInstance({_instanceKey: this._instanceKey});
                this.uiState.add("ActiveView", "previewDiv")
                this.uiState.add("showHiddenViews", false)

                this._interfaceState.set("uiStateComponentKey", this.uiState._componentKey);


                this._interfaceState.set("Component Name","Scaptura");
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

                //Create the Settings Instance
                this.settingsInstance = new SettingsInstance({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey, _userKey: this._userKey,
                    _Controller: this});
                //Set Main Instance keys for interface
                this._interfaceState.set("settingsInstanceKeys", {instanceKey: this.mainInstance._instanceKey,
                    sessionKey: this.settingsInstance._sessionKey,
                    componentKey: this.settingsInstance._componentKey});


                this._interfaceState.set("Status", "Ready");

            },
            //##########################################################################################################
            //Interface Commands - UI
            //##########################################################################################################
            setShowHelpfulHints: function(show, resultCallback){
                if(typeof show === "boolean"){
                    this.uiState.add("showHelpfulHints", show)
                    resultCallback({SUCCESS: "set"})
                }else{
                    resultCallback({ERROR : "instance -> setShowHelpfulHints: activeView is not a string"})
                }
            },
            setUIActiveView: function(activeView, resultCallback){

                if(typeof activeView === "string"){
                    this.uiState.add("ActiveView", activeView)
                    resultCallback({SUCCESS: "set"})
                }else{
                    resultCallback({ERROR : "instance -> setUIActiveView: activeView is not a string"})
                }
            },
            showHiddenCaptures: function (showHidden, resultCallback){
                if(typeof showHidden === "boolean" && typeof resultCallback === "function") {
                    this.uiState.add("showHiddenCaptures", showHidden)
                }
            },
            //##########################################################################################################
            //Interface Commands - Captures
            //##########################################################################################################
            addCapture: function(Entry, resultCallback){
                this._moduleController.addCapture(Entry).then(lang.hitch(this, function(Result){
                    resultCallback({SUCCESS: "Capture added Successfully"})
                })).catch(lang.hitch(this, function(Error){
                    resultCallback({Error: Error})
                }))
            },
            removeAllCaptures: function( resultCallback){
                let userKey = this.sessionsControllerCommands.getSessionUserKey(this._sessionKey)
                if (userKey != null ) {

                    this._moduleController.removeAllCapturesFor(userKey).then(lang.hitch(this, function(Result){
                        resultCallback({SUCCESS: Result})
                        console.log("removeAllCapturesFor ",Result)
                        // this.availableCaptures.forEach(lang.hitch(this, function(id, capture){
                        //     console.log("availableCaptures", id, capture,  this.availableCaptures)
                        //     this.availableCaptures.add(id, undefined)
                        // }))
                        console.log("resultCallbacked after ",Result)
                    })).catch(lang.hitch(this, function(Error){
                        resultCallback({Error: Error})
                    }))

                }else{
                    resultCallback({Error: "Could Not get user Key"})

                }



            },
            updateCaptureImage : function(updateEntry, resultCallback){
                this._moduleController.updateCaptureImage(updateEntry).then(lang.hitch(this, function(Result){
                    resultCallback({SUCCESS: Result})
                })).catch(lang.hitch(this, function(Error){
                    resultCallback({Error: Error})
                }))
            },
            retrieveCaptureImage : function(captureID, resultCallback){
                this._moduleController.retrieveCaptureImage(captureID).then(lang.hitch(this, function(Result){
                    resultCallback({SUCCESS: Result})
                })).catch(lang.hitch(this, function(Error){
                    resultCallback({Error: Error})
                }))
            },
            retrieveCaptureImagePreview : function(captureID, resultCallback){
                this._moduleController.retrieveCaptureImagePreview(captureID).then(lang.hitch(this, function(Result){
                    resultCallback({SUCCESS: Result})
                })).catch(lang.hitch(this, function(Error){
                    resultCallback({Error: Error})
                }))
            },
            //##########################################################################################################
            //Interface Commands - Capture Sets
            //##########################################################################################################
            newAllSet : function(setName, resultCallback) {
                this.createCaptureSet(setName, true, resultCallback)
            },
            newClearSet : function(setName, resultCallback){
                this.createCaptureSet(setName, false, resultCallback)
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
            selectCapture: function(id, resultCallback){
                if(typeof id === "string" && typeof resultCallback === "function"){
                    this.uiState.add("selectedCaptures", [id])
                    resultCallback({SUCCESS: "selectCapture selected" + id})
                }else{
                    resultCallback({ERROR : "instance -> selectCapture: id is not a string"})
                }
            },
            clearSelectedCaptures: function(resultCallback){
                if(typeof resultCallback === "function"){
                    this.uiState.add("selectedCaptures", [])
                    resultCallback({SUCCESS: "Cleared Selected Captures"})
                }else{
                    resultCallback({ERROR : "instance -> clearSelectedCaptures: not expected"})
                }
            },
            removeCaptureFromSet: function(captureSetID, captureID, resultCallback){
                if(typeof captureSetID === "string" && typeof captureID === "string" && typeof resultCallback === "function"){
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
                if(typeof captureSetID === "string" && typeof captureID === "string" && typeof resultCallback === "function"){
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
            addCaptureSet: function(CaptureSet, resultCallback){
                let userKey = this.sessionsControllerCommands.getSessionByKey(this._sessionKey).getUserKey()
                this._moduleController.addCaptureSet(CaptureSet, userKey).then(lang.hitch(this, function(Result){
                    resultCallback({SUCCESS: Result})
                })).catch(lang.hitch(this, function(Error){
                    resultCallback({Error: Error})
                }))
            },
            //##########################################################################################################
            //Interface Commands - Controller Interface
            //##########################################################################################################
            getCaptureSetSyncedMap: function(captureSetID, resultCallback){
                console.log("getCaptureSetSyncedMap:", captureSetID)
                this._moduleController.getCaptureSetSyncedMap(captureSetID, this._instanceKey).then(lang.hitch(this, function(Result){
                    resultCallback(Result)
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
            //##########################################################################################################
            //Internal Methods
            //##########################################################################################################
            getStatefulCaptureSet: function(captureID){
                return this._moduleController.getStatefulCaptureSet(captureID)
            },
            createCaptureSet : function(name, appendAll, resultCallback){
                if(typeof name === "string" && typeof appendAll === "boolean"){
                    let captures = this.createInitialCaptureSetCaptures(appendAll)
                    this.addCaptureSet({name: name, appendAll: appendAll, captures: captures}, resultCallback)
                    resultCallback({SUCCESS: "New Capture Set " + name + "added successfully"})
                }else{
                    resultCallback({ERROR : "instance -> newAllSet: setName is not a string"})
                }
            },
            createInitialCaptureSetCaptures: function(appendAll) {
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
                }
                return captures
            },
            //##########################################################################################################
            //Base Instance Override Function
            //##########################################################################################################
            _end: function () {
                //calls inherited _end functions like stateSynced Object
                this.inherited(arguments);
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    console.log("destroying Scaptura Module Instance ");
                    Resolve({success: "Unloaded Instance"});
                }));
            }
        });
    }
);


