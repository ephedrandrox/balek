define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",

        'balek-client/session/workspace/workspaceManagerInterfaceCommands',

        'balek-modules/digivigil-www/guestbook/Interface/main',

        'balek-modules/components/syncedCommander/Interface',
        'balek-modules/components/syncedMap/Interface',
    ],
    function (declare, lang, topic, domConstruct, domStyle, win, balekWorkspaceManagerInterfaceCommands, MainInterface, _SyncedCommanderInterface, SyncedMapInterface) {

        return declare("moduleDigivigilWWWGuestbookInterface",   _SyncedCommanderInterface, {
            _instanceKey: null,
            _mainInterface: null,

            workspaceManagerCommands: null,

            availableEntries: null,

            availableEntriesResolveRequests: null,
            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################
            constructor: function (args) {
                declare.safeMixin(this, args);
                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();
                this.availableEntriesResolveRequests = []
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
                            Resolve(this.availableEntries[ResolveKey])
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
            sendEntry: function (guestbookEntry) {
                this._instanceCommands.addEntry(guestbookEntry).then(lang.hitch(this, function(commandReturnResults){
                    console.log("#ADDENTRY", commandReturnResults)
                })).catch(function(commandErrorResults){
                    console.log("#ADDENTRY", "ADDENTRY Received Error Response" + commandErrorResults);
                });
            },
            unload: function () {
                this._mainInterface.unload();
            }
        });
    }
);



