define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",

        'balek-client/session/workspace/workspaceManagerInterfaceCommands',
        'balek-modules/components/syncedMap/Interface',


        'balek-modules/users/info/Interface/userInfo',
        'balek-modules/components/syncedCommander/Interface',
    ],
    function (declare, lang, topic, domConstruct, domStyle, win, balekWorkspaceManagerInterfaceCommands, SyncedMapInterface, UserInfo, _SyncedCommanderInterface) {
        return declare("moduleUserInfoInterface", _SyncedCommanderInterface, {
            _instanceKey: null,

            _userInfoInterface: null,

            workspaceManagerCommands: null,

            availableSessions: null,
            availableSessionsResolveRequests: null,

            userInfoState: null,
            userInfoStateResolveRequests: null,

            constructor: function (args) {

                declare.safeMixin(this, args);
                this.availableSessionsResolveRequests = []
                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();



            },  //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to be here so remoteCommander works
                this.inherited(arguments);

                if (name === "availableSessionsComponentKey") {
                    //Create availableEntries SyncedMap
                    if(this.availableSessions === null){
                        this.availableSessions = new SyncedMapInterface({_instanceKey: this._instanceKey, _componentKey: newState.toString()});
                        for( const ResolveKey in this.availableSessionsResolveRequests)
                        {
                            Resolve(this.availableSessions[ResolveKey])
                        }
                    }
                } else if (name === "userInfoStateRelayComponentKey") {
                    //Create availableEntries SyncedMap
                    if(this.userInfoState === null){
                        this.userInfoState = new SyncedMapInterface({_instanceKey: this._instanceKey, _componentKey: newState.toString()});
                        for( const ResolveKey in this.userInfoStateResolveRequests)
                        {
                            Resolve(this.userInfoState[ResolveKey])
                        }
                    }
                } else if (name === "userInfoInstanceKeys") {
                    //Create Main Interface
                    if(this._userInfoInterface === null){
                        this._userInfoInterface = new UserInfo({_instanceKey: newState.instanceKey,
                            _sessionKey: newState.sessionKey,
                            _componentKey: newState.componentKey,
                            _interface: this});
                        //Get container Keys and add to static Workspace Container
                        this._userInfoInterface.getContainerKeys().then(lang.hitch(this, function(containerKeys){
                            if(Array.isArray(containerKeys) && containerKeys.length === 0)
                            {
                                let workspaceContainerWidgetPath = "balek-client/session/workspace/container/widgets/movable/movableContainerWidget"
                                let activeWorkspaceKey = this.workspaceManagerCommands.getActiveWorkspace().getWorkspaceKey();
                                this.workspaceManagerCommands.addToWorkspaceContainer(this._userInfoInterface, workspaceContainerWidgetPath )
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
            getAvailableSessions: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    if(this.availableSessions == null){
                        this.availableSessionsResolveRequests.push(Resolve)
                    }else
                    {
                        Resolve(this.availableSessions)
                    }
                }))
            },
            getUserState: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    if(this.userInfoState == null){
                        this.userInfoStateResolveRequests.push(Resolve)
                    }else
                    {
                        Resolve(this.userInfoState)
                    }
                }))
            },
            unload: function () {
                console.log("Unloading user info Main interface");
                this._userInfoInterface.unload();
                delete this._userInfoInterface;
            }
        });
    }
);



