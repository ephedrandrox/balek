define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        
        'balek-client/session/workspace/workspaceManagerInterfaceCommands',

        'balek-modules/diaplode/conversations/Interface/main',

        'balek-modules/components/syncedCommander/Interface',
        'balek-modules/components/syncedMap/Interface'

    ],
    function (declare, lang, topic, balekWorkspaceManagerInterfaceCommands, MainInterface, syncedCommanderInterface, syncedMapInterface) {
        return declare("moduleDiaplodeConversationsInterface", syncedCommanderInterface, {
            _instanceKey: null,

            _mainInterface: null,
            _availableConversations: null,
            workspaceManagerCommands: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();

            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to inherited() so remoteCommander works
                this.inherited(arguments);

                if (name.toString() === "moduleName") {
                    //Got Module Name = newState
                }else if(name.toString() === "mainInterfaceKeys"){
                    if(this._mainInterface === null){
                        let mainInterface = new MainInterface({_instanceKey: newState.instanceKey,
                            _sessionKey: newState.sessionKey,
                            _componentKey: newState.componentKey,
                            _conversationsInstanceCommands: this._instanceCommands})
                        this._mainInterface = mainInterface;
                        mainInterface.getContainerKeys().then(lang.hitch(this, function(containerKeys){
                           if(Array.isArray(containerKeys) && containerKeys.length === 0)
                            {
                                topic.publish("addToCurrentWorkspace",mainInterface );
                            }else
                            {
                                console.log("error", containerKeys.length);
                            }
                        })).catch(lang.hitch(this, function(error){
                            console.log(error);
                        }));
                    }
                }else if(name.toString() === "availableConversationsComponentKey") {
                    console.log("#CD", name, newState)
                    if( this._availableConversations === null){
                        this._availableConversations = new syncedMapInterface({_instanceKey: this._instanceKey, _componentKey: newState.toString()});
                        console.log("#CD", this._availableConversations)
                        this._availableConversations.setStateWatcher(function(name, oldState, newState){
                            console.log("#CD", name, oldState, newState)
                        });
                    }
                }
            },
            toggleShowView: function(){
                if (this._mainInterface !== null && typeof this._mainInterface.toggleShowView === 'function'){
                    this._mainInterface.toggleShowView()
                }else {
                    alert("No mainInterface yet")
                }
            },
            unload: function () {
                this.inherited(arguments);
            }
        });
    }
);



