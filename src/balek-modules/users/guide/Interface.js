define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'dojo/topic',

        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",

        'balek-modules/users/guide/Interface/usersGuide',
        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',
        'balek-client/session/workspace/workspaceManagerInterfaceCommands',


    ],
    function (declare, lang, baseInterface, topic, domConstruct, domStyle, win, UsersGuide, _SyncedCommanderInterface, _BalekWorkspaceContainerContainable,balekWorkspaceManagerInterfaceCommands) {
        return declare("moduleUsersGuideInterface", [_SyncedCommanderInterface], {
            _instanceKey: null,
            workspaceManagerCommands: null,

            _usersGuideInterface: null,

            constructor: function (args) {

                declare.safeMixin(this, args);
                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();

                //this._usersGuideInterface = new usersGuide({_instanceKey: this._instanceKey});
               // topic.publish("addToCurrentWorkspace", this);

            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to be here so remoteCommander works
                this.inherited(arguments);
               console.log("onInterfaceStateChange", name, oldState, newState)

                if (name === "userGuideInstanceKeys") {
                    if( this._usersGuideInterface === null)
                    {
                        this._usersGuideInterface = new UsersGuide({ _instanceKey: newState.instanceKey,
                        _sessionKey: newState.sessionKey,
                        _componentKey: newState.componentKey,
                        _interface: this})
                    }
                    this._usersGuideInterface.getContainerKeys().then(lang.hitch(this, function(containerKeys){
                        if(Array.isArray(containerKeys) && containerKeys.length === 0)
                        {
                            let workspaceContainerWidgetPath = "balek-client/session/workspace/container/widgets/movable/movableContainerWidget"
                            let activeWorkspaceKey = this.workspaceManagerCommands.getActiveWorkspace().getWorkspaceKey();
                            this.workspaceManagerCommands.addToWorkspaceContainer(this._usersGuideInterface, workspaceContainerWidgetPath )
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
            },
            getWorkspaceDomNode: function () {
                return this._usersGuideInterface.domNode;
            },
            receiveMessage: function (moduleMessage) {
                console.log("shouldn't be seeing anything here", moduleMessage);
            },
            toggleShowView: function () {
                let currentStateToggle = {"visible": "hidden", "hidden": "visible"};
                domStyle.set(this._usersGuideInterface.domNode, {"visibility": currentStateToggle[domStyle.get(this._usersGuideInterface.domNode, "visibility")]});
            },
            unload: function () {
                console.log("Unloading user guide Main interface");
                this._usersGuideInterface.unload();
                delete this._usersGuideInterface;
            }
        });
    }
);



