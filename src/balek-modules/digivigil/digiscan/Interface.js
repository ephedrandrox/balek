define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',


        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",

        'balek-client/session/workspace/workspaceManagerInterfaceCommands',

        'balek-modules/digivigil/digiscan/Interface/main',

        'balek-modules/digivigil/digiscan/Interface/Controller/Captures/Interface',
        'balek-modules/digivigil/digiscan/Interface/Controller/CaptureSets/Interface',


        'balek-modules/components/syncedCommander/Interface',
        'balek-modules/components/syncedMap/Interface',
    ],
    function (declare, lang, topic, Stateful,
              domConstruct, domStyle, win,
              balekWorkspaceManagerInterfaceCommands,
              MainInterface,
              Captures,CaptureSets,
              _SyncedCommanderInterface, SyncedMapInterface) {

        return declare("moduleDigivigilDigiscanInterface",   _SyncedCommanderInterface, {
            _instanceKey: null,
            _mainInterface: null,

            _Captures: null,
            _CaptureSets: null,

            workspaceManagerCommands: null,

            availableEntries: null,
            interestedCaptures: null,
            captureSets: null,
            captureSetsSyncedMap: null,
            captureSetsWatchHandle: null,


            captureSyncedMaps: null,
            captureSyncedMapWatchHandles: null,

            uiState: null,
            uiStateSyncedMap: null,
            uiStateWatchHandle: null,

            availableEntriesResolveRequests: null,
            interestedCapturesResolveRequests: null,
            captureSetsResolveRequests: null,
            uiStateResolveRequests: null,


            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################
            constructor: function (args) {
                declare.safeMixin(this, args);

                this._Captures = new Captures({_interface: this})
                this._CaptureSets = new CaptureSets({_interface: this})

                this.captureSyncedMaps = {}
                this.captureSyncedMapWatchHandles = {}


                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();
                this.availableEntriesResolveRequests = []
                this.interestedCapturesResolveRequests = []
                this.captureSetsResolveRequests = []
                this.uiStateResolveRequests = []


                let CaptureSetsState = declare([Stateful], {});
                this.captureSets = CaptureSetsState()

                let UIState = declare([Stateful], {});
                this.uiState = UIState()
            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to be here so remoteCommander works
                this.inherited(arguments);

                if (name === "availableEntriesComponentKey") {
                    //Create availableEntries SyncedMap
                    if(this.availableEntries === null){
                        this.availableEntries = new SyncedMapInterface({_instanceKey: this._instanceKey, _componentKey: newState.toString()});
                        for( const ResolveKey in this.availableEntriesResolveRequests)
                        {
                           this.availableEntries[ResolveKey](this.availableEntries)
                        }
                    }
                } else if (name === "interestedCapturesComponentKey") {
                    //Create availableEntries SyncedMap
                    if(this.interestedCaptures === null){
                        this.interestedCaptures = new SyncedMapInterface({_instanceKey: this._instanceKey, _componentKey: newState.toString()});
                        for( const ResolveKey in this.interestedCapturesResolveRequests)
                        {
                            this.interestedCapturesResolveRequests[ResolveKey](this.interestedCaptures)
                        }
                    }
                }
                else if (name === "captureSetsComponentKey") {
                    //Create availableEntries SyncedMap
                    if(this.captureSetsSyncedMap === null){
                        this.captureSetsSyncedMap = new SyncedMapInterface({_instanceKey: this._instanceKey, _componentKey: newState.toString()});
                        this.captureSetsWatchHandle = this.captureSetsSyncedMap.setStateWatcher(lang.hitch(this,this.onCaptureSetStateChange))

                        for( const ResolveKey in this.captureSetsResolveRequests)
                        {
                            this.captureSetsResolveRequests[ResolveKey](this.captureSets)
                        }
                    }
                }
                else if (name === "uiStateComponentKey") {
                    //Create availableEntries SyncedMap
                    if(this.uiStateSyncedMap === null){
                        this.uiStateSyncedMap = new SyncedMapInterface({_instanceKey: this._instanceKey, _componentKey: newState.toString()});

                        this.uiStateWatchHandle = this.uiStateSyncedMap.setStateWatcher(lang.hitch(this,this.onUIStateChange))

                        for( const ResolveKey in this.uiStateResolveRequests)
                        {
                           this.uiStateResolveRequests[ResolveKey](this.uiState)
                        }
                    }
                }
                else if (name === "mainInstanceKeys") {
                    //Create Main Interface
                    if(this._mainInterface === null){
                        this._mainInterface = new MainInterface({_instanceKey: newState.instanceKey,
                            _sessionKey: newState.sessionKey,
                            _componentKey: newState.componentKey,
                            _interface: this});
                        //Get container Keys and add to static Workspace Container
                        this._mainInterface.getContainerKeys().then(lang.hitch(this, function(containerKeys){
                            if(Array.isArray(containerKeys) && containerKeys.length === 0)
                            {
                                let workspaceContainerWidgetPath = "balek-client/session/workspace/container/widgets/static/staticContainerWidget"
                                let activeWorkspaceKey = this.workspaceManagerCommands.getActiveWorkspace().getWorkspaceKey();
                                this.workspaceManagerCommands.addToWorkspaceContainer(this._mainInterface, workspaceContainerWidgetPath )
                                    .then(lang.hitch(this, function(workspaceContainerKey){
                                        console.log("gotWorkspaceContainerKey", workspaceContainerKey);
                                        this.workspaceManagerCommands.addContainerToWorkspace(workspaceContainerKey, activeWorkspaceKey)
                                            .then(lang.hitch(this, function(addContainerToWorkspaceResponse){
                                                console.log("Container added to workspace", addContainerToWorkspaceResponse);
                                            }))
                                            .catch(lang.hitch(this, function(error){
                                                console.log("Error adding container to workspace", error);
                                            }));
                                    })).catch(lang.hitch(this, function(error){
                                }));
                            }
                        })).catch(lang.hitch(this, function(error){
                            console.log(error);
                        }));
                    }
                }
            },
            onUIStateChange: function(name, oldValue, newValue){
                this.uiState.set(name, newValue);
            },
            onCaptureSetStateChange: function(name, oldValue, newValue){
                this.captureSets.set(name, newValue);
            },
            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################
            getAvailableEntries: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    if(this.availableEntries == null){
                        this.availableEntriesResolveRequests.push(Resolve)
                    }else
                    {
                        Resolve(this.availableEntries)
                    }
                }))
            },
            getInterestedCaptures: function()
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    if(this.interestedCaptures == null){
                        this.interestedCapturesResolveRequests.push(Resolve)
                    }else
                    {
                        Resolve(this.interestedCaptures)
                    }
                }))
            },
            getCaptureSets: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    if(this.captureSets == null){
                        this.captureSetsResolveRequests.push(Resolve)
                    }else
                    {
                        Resolve(this.captureSets)
                    }
                }))
            },
            getUIState: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    if(this.uiState == null){
                        this.uiStateResolveRequests.push(Resolve)
                    }else
                    {
                        Resolve(this.uiState)
                    }
                }))
            },


            getCaptureSetsController: function(){
                return this._CaptureSets
            },

            getCaptures: function(){
                    return this._Captures
            },

            getCaptureSyncedMap : function(captureID , resultCallback){
                this._instanceCommands.getCaptureSyncedMap(captureID).then(lang.hitch(this, function(commandReturnResults){

                    console.log("#getCaptureSyncedMap", commandReturnResults)
                    resultCallback(commandReturnResults)

                })).catch(function(commandErrorResults){
                    console.log("#getCaptureSyncedMap", "newAllSet Received Error Response" + commandErrorResults);
                });
            },
            getCaptureSetSyncedMap : function(captureSetID , resultCallback){
                console.log("#getCaptureSetSyncedMap", captureSetID)

                this._instanceCommands.getCaptureSetSyncedMap(captureSetID).then(lang.hitch(this, function(commandReturnResults){

                    console.log("#getCaptureSetSyncedMap", commandReturnResults)
                    resultCallback(commandReturnResults)

                })).catch(function(commandErrorResults){
                    console.log("#getCaptureSetSyncedMap", "newAllSet Received Error Response" + commandErrorResults);
                });
            },

            newAllSet : function(setName, resultCallback) {
                this._instanceCommands.newAllSet(setName).then(lang.hitch(this, function(commandReturnResults){
                    console.log("#newAllSet", commandReturnResults)
                })).catch(function(commandErrorResults){
                    console.log("#newAllSet", "newAllSet Received Error Response" + commandErrorResults);
                });
            },
            newClearSet : function(setName, resultCallback){
                this._instanceCommands.newClearSet(setName).then(lang.hitch(this, function(commandReturnResults){
                    console.log("#newClearSet", commandReturnResults)
                })).catch(function(commandErrorResults){
                    console.log("#newClearSet", "newClearSet Received Error Response" + commandErrorResults);
                });
            },
            deleteCaptureSet : function(id){
                this._instanceCommands.deleteCaptureSet(id).then(lang.hitch(this, function(commandReturnResults){
                    console.log("#deleteCaptureSet", commandReturnResults)
                })).catch(function(commandErrorResults){
                    console.log("#deleteCaptureSet", "deleteCaptureSet Received Error Response" + commandErrorResults);
                });
            },
            renameCaptureSet : function(id, name){
                this._instanceCommands.renameCaptureSet(id, name).then(lang.hitch(this, function(commandReturnResults){
                    console.log("#renameCaptureSet", commandReturnResults)
                })).catch(function(commandErrorResults){
                    console.log("#renameCaptureSet", "deleteCaptureSet Received Error Response" + commandErrorResults);
                });
            },
            selectCaptureSet: function(id){
                this._instanceCommands.selectCaptureSet(id).then(lang.hitch(this, function(commandReturnResults){
                    console.log("#selectCaptureSet", commandReturnResults)
                })).catch(function(commandErrorResults){
                    console.log("#selectCaptureSet", "selectCaptureSet Received Error Response" + commandErrorResults);
                });
            },

            sendEntry: function (digiscanEntry) {
                this._instanceCommands.addCapture(digiscanEntry).then(lang.hitch(this, function(commandReturnResults){
                    console.log("#ADDENTRY", commandReturnResults)
                })).catch(function(commandErrorResults){
                    console.log("#ADDENTRY", "ADDENTRY Received Error Response" + commandErrorResults);
                });
            },
            removeCaptureFromSet: function(captureSetID, captureID, resultCallback) {
                console.log("#removeCaptureFromSet", captureSetID, captureID, resultCallback)

                this._instanceCommands.removeCaptureFromSet(captureSetID, captureID).then(lang.hitch(this, function(commandReturnResults){
                    console.log("#removeCaptureFromSet", commandReturnResults)

                    resultCallback(commandReturnResults)
                })).catch(function(commandErrorResults){
                    console.log("#removeCaptureFromSet", "removeCaptureFromSet Received Error Response" + commandErrorResults);
                    resultCallback(commandReturnResults)

                });
            },
            addCaptureToSet: function(captureSetID, captureID, resultCallback) {
                console.log("#removeCaptureFromSet", captureSetID, captureID, resultCallback)

                this._instanceCommands.addCaptureToSet(captureSetID, captureID).then(lang.hitch(this, function(commandReturnResults){
                    console.log("#removeCaptureFromSet", commandReturnResults)

                    resultCallback(commandReturnResults)
                })).catch(function(commandErrorResults){
                    console.log("#removeCaptureFromSet", "removeCaptureFromSet Received Error Response" + commandErrorResults);
                    resultCallback(commandReturnResults)

                });
            },
            removeAllCaptures: function () {
                this._instanceCommands.removeAllCaptures().then(lang.hitch(this, function(commandReturnResults){
                    console.log("#Removed ALl Captures", commandReturnResults)
                })).catch(function(commandErrorResults){
                    console.log("#Removed ALl Captures", "Removed ALl Captures Received Error Response" + commandErrorResults);
                });
            },
            showHiddenCaptures: function(showHidden){
                this._instanceCommands.showHiddenCaptures(showHidden).then(lang.hitch(this, function(commandReturnResults){
                    console.log("#showHiddenCaptures", commandReturnResults)
                })).catch(function(commandErrorResults){
                    console.log("#showHiddenCaptures", "Received Error Response" + commandErrorResults);
                });
            },
            // setCaptureUninterested(CaptureID) {
            //     this._instanceCommands.setCaptureUninterested(CaptureID).then(lang.hitch(this, function(commandReturnResults){
            //         console.log("#setCaptureUninterested", commandReturnResults)
            //     })).catch(function(commandErrorResults){
            //         console.log("#setCaptureUninterested", "Received Error Response" + commandErrorResults);
            //     });
            // },
            setUIActiveView(activeView) {
                this._instanceCommands.setUIActiveView(activeView).then(lang.hitch(this, function(commandReturnResults){
                    console.log("#Set Active View", commandReturnResults)
                })).catch(function(commandErrorResults){
                    console.log("#SetACtive View", "Received Error Response" + commandErrorResults);
                });
            },
            unload: function () {
                this.uiStateWatchHandle.unwatch()
                this.uiStateWatchHandle.remove()

                this.captureSetsWatchHandle.remove()

                this._mainInterface.unload();
            }
        });
    }
);



