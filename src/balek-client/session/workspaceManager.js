define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'dojo/dom-construct',

        'balek/session/workspaceManager',
        'balek-client/session/workspace/workspaceManagerInterfaceCommands',
        'balek-client/session/workspace/workspace',
        'balek-client/session/workspace/containerManager'],
    function (declare,
              lang,
              topic,
              Stateful,
              domConstruct,
              balekWorkspaceManager,
              balekWorkspaceManagerInterfaceCommands,
              balekWorkspace,
              balekWorkspaceContainerManager) {

        return declare("balekClientWorkspaceManager", balekWorkspaceManager, {
            _sessionKey: null,

            _commandsForInterface: null,


            containerManager: null,


            _workspaceManagerState: null,
            _workspaceManagerStateWatchHandle: null,

            _availableWorkspacesState: null,
            _availableWorkspacesStateWatchHandle: null,


            _workspaces: null,
            constructor: function (args) {
                //todo audit/comment this file

                declare.safeMixin(this, args);

                this._commandsForInterface = new balekWorkspaceManagerInterfaceCommands();

                this._commandsForInterface.setCommand('getAvailableWorkspacesState' , lang.hitch(this, this.getAvailableWorkspacesState));
                this._commandsForInterface.setCommand('getWorkspaceManagerState' , lang.hitch(this, this.getWorkspaceManagerState));
                this._commandsForInterface.setCommand('getWorkspaceState' , lang.hitch(this, this.getWorkspaceState));

                this._commandsForInterface.setCommand('getActiveWorkspace' , lang.hitch(this, this.getActiveWorkspace));
                this._commandsForInterface.setCommand('getWorkspaceContainers' , lang.hitch(this, this.getWorkspaceContainers));

                this._commandsForInterface.setCommand('getContainer' , lang.hitch(this, this.getContainer));


                this._commandsForInterface.setCommand('addToWorkspaceContainer' , lang.hitch(this, this.addToWorkspaceContainer));
                this._commandsForInterface.setCommand('addContainerToWorkspace' , lang.hitch(this, this.addContainerToWorkspace));

                this._commandsForInterface.setCommand('getActiveOverlayWorkspace' , lang.hitch(this, this.getActiveOverlayWorkspace));


                this._commandsForInterface.setCommand('changeWorkspaceName', lang.hitch(this, this.changeWorkspaceName));
                this._commandsForInterface.setCommand('changeActiveWorkspace', lang.hitch(this, this.changeActiveWorkspace));
                this._commandsForInterface.setCommand('activateContainerInWorkspace', lang.hitch(this, this.activateContainerInWorkspace));




                this._commandsForInterface.setCommand('requestNewWorkspace', lang.hitch(this, this.requestNewWorkspace));




                this.containerManager = new balekWorkspaceContainerManager({_sessionKey: this._sessionKey});



                this._workspaces = {};


                let workspaceManagerState = declare([Stateful], {
                    activeWorkspace: null
                });
                this._workspaceManagerState = new workspaceManagerState({

                });
                this._workspaceManagerStateWatchHandle = this._workspaceManagerState.watch(lang.hitch(this, this.onWorkspaceManagerInterfaceStateUpdate));


                let availableWorkspacesState = declare([Stateful], {
                });
                this._availableWorkspacesState = new availableWorkspacesState({

                });
                this._availableWorkspacesStateWatchHandle = this._availableWorkspacesState.watch(lang.hitch(this, this.onAvailableWorkspacesInterfaceStateUpdate));
                //todo make array of handles


               // this.getWorkspacesStoreSubscribeHandle = topic.subscribe("getWorkspacesStore", lang.hitch(this, this.getWorkspacesStore));
                this.addToCurrentWorkspaceSubscribeHandle = topic.subscribe("addToCurrentWorkspace", lang.hitch(this, this.addToCurrentWorkspace));
                //todo make workspaceManagerInterfaceCommands.js


                this.connectToInstance();
            },
            requestNewWorkspace: function(newWorkspaceName){
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                        workspaceMessage: {
                            sessionKey: this._sessionKey, messageData: {
                                newWorkspace: {
                                    workspaceName: newWorkspaceName
                                }
                            }
                        }
                    }, lang.hitch(this, function (returnMessage) {
                        if (returnMessage.error) {
                            Reject(returnMessage.error);
                        } else {
                            Resolve(returnMessage);
                        }
                    }));
                }));

            },
            getActiveWorkspace: function(){
                let activeWorkspaceKey = this._workspaceManagerState.get("activeWorkspace");
                let activeWorkspace = this._workspaces[activeWorkspaceKey];
                return activeWorkspace;
            },
            getActiveOverlayWorkspace: function(){
                let activeOverlayWorkspaceKey = this._workspaceManagerState.get("activeOverlayWorkspace");
                let activeOverlayWorkspace = this._workspaces[activeOverlayWorkspaceKey];
                return activeOverlayWorkspace;
            },
            getContainer: function(containerKey){
                return this.containerManager.getContainer(containerKey);
            },
            getWorkspaceContainers: function(workspaceKey){

              let workspace = this._workspaces[workspaceKey];
              let workspaceContainers = null;
              //console.log(workspace, workspaceKey );


                if(workspace !== undefined && workspace !== null)
              {
                  workspaceContainers = workspace.getContainers();
              }
                return workspaceContainers;

            },
            onAvailableWorkspacesInterfaceStateUpdate: function(name, oldState, newState){
             //   console.log(name, oldState, newState);
                let workspaceKey = String(name);


                if(this._workspaces[workspaceKey] === undefined &&
                    workspaceKey ===  newState.workspaceKey )
                {
                    console.log("no workspace interface - creating one ");
                    this.createWorkspaceInterface(workspaceKey,  newState.workspaceName);
                }
                else if(this._workspaces[String(name)] )
                {
                    console.log(" workspace Already created");
                }
            },
            onWorkspaceManagerInterfaceStateUpdate: function(name, oldState, newState){
               // console.log(name, oldState, newState);

                if(String(name) === "activeWorkspace")
                {
                        this.onActiveWorkspaceChange(name, oldState, newState);
                }
                if(String(name) === "activeOverlayWorkspace")
                {
                    if(this._workspaces[newState.toString()] === undefined){
                        console.log("workspaceUpdate", "Creating workspace overlay");
                        this.createWorkspaceInterface(newState.toString(),  "Active Overlay");
                        topic.publish("addToMainContentLayerAlwaysOnTop", this._workspaces[newState.toString()].domNode );
                        this._workspaces[newState.toString()].onActivate();
                    }
                }
            },
            onActiveWorkspaceChange: function (name, oldWorkspaceKey, newWorkspaceKey) {
               // console.log(name, oldWorkspaceKey, newWorkspaceKey);
                let workspaces =  this._workspaces;
                if (oldWorkspaceKey === null) {
                    topic.publish("addToMainContentLayer", workspaces[newWorkspaceKey].domNode );
                   // this.addToMainContentLayer(workspaces[newWorkspaceKey].domNode);
                } else {

                    domConstruct.place(workspaces[newWorkspaceKey].domNode, workspaces[oldWorkspaceKey].domNode, "replace");
                }
                workspaces[newWorkspaceKey].onActivated();
            },
            createWorkspaceInterface: function(workspaceKey)
            {
                if(this._workspaces[workspaceKey] === undefined){
                    this._workspaces[workspaceKey] =   new balekWorkspace({
                        containerManager: this.containerManager,
                        _sessionKey : this._sessionKey,
                        _workspaceKey: workspaceKey
                    });
                }
            },
            connectToInstance: function () {
                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    sessionMessage: {
                        sessionKey: this._sessionKey,
                        sessionRequest: {
                            workspaceManagerRequest:{interfaceConnectSyncedStateRequest: true}

                        }
                    }
                }, lang.hitch(this, this.onWorkspaceManagerInstanceStateChange));
                //todo change to InstanceMessageReceived which directs to state change
            },
            onWorkspaceManagerInstanceStateChange: function(stateChangeUpdate){
             //   console.log(stateChangeUpdate);
                if(stateChangeUpdate.error)
                {
                    console.log("Workspace State connect error",stateChangeUpdate );
                }

                if(stateChangeUpdate.availableWorkspacesState)
                {
                    try{
                        let availableWorkspacesState = JSON.parse(stateChangeUpdate.availableWorkspacesState);
                        for (const name in availableWorkspacesState)
                        {
                            this._availableWorkspacesState.set(name, availableWorkspacesState[name]);
                        }
                    }catch(error){
                        console.log(error);
                    }
                }
                if(stateChangeUpdate.workspaceManagerState)
                {
                    try{
                        let workspaceManagerState = JSON.parse(stateChangeUpdate.workspaceManagerState);
                        for (const name in workspaceManagerState)
                        {
                            this._workspaceManagerState.set(name, workspaceManagerState[name]);
                        }
                    }catch(error){
                        console.log(error);
                    }
                }
            },
            changeWorkspaceName: function (workspaceKey, workspaceName, requestCallback) {
                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    workspaceMessage: {
                        sessionKey: this._sessionKey, messageData: {
                            changeWorkspaceName: {
                                workspaceKey: workspaceKey,
                                workspaceName: workspaceName
                            }
                        }
                    }
                }, lang.hitch(this, function (returnMessage) {
                    if (returnMessage.error) {
                        alert(returnMessage.error);
                    } else {
                         requestCallback(returnMessage);
                    }
                }));
            },
            changeActiveWorkspace: function (workspaceKey, requestCallback) {
                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    workspaceMessage: {
                        sessionKey: this._sessionKey, messageData: {
                            changeActiveWorkspace: {workspaceKey: workspaceKey}
                        }
                    }
                }, lang.hitch(this, function (returnMessage) {
                    if (returnMessage.error) {
                        alert(returnMessage.error);
                    } else {
                       requestCallback(returnMessage);
                    }
                }));

            },
            activateContainerInWorkspace: function(workspace, containerKey){


               // console.log("setting focused container in workspace",workspace, containerKey );
                workspace.activateContainer(containerKey);
            },
            getAvailableWorkspacesState: function()
            {
                return this._availableWorkspacesState;
            },
            getWorkspaceManagerState: function()
            {
                return this._workspaceManagerState;
            },
            getWorkspaceState: function(workspaceKey)
            {
                if(this._workspaces[workspaceKey] && this._workspaces[workspaceKey].getWorkspaceState )
                {
                    return this._workspaces[workspaceKey].getWorkspaceState();
                }else
                {
                    return null;
                }

            },
            addContainerToWorkspace: function(containerKey, workspaceKey){
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    //todo check that our keys exist
                    topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                        workspaceMessage: {
                            sessionKey: this._sessionKey, messageData: {
                                addToWorkspace: {
                                    workspaceKey: workspaceKey,
                                    workspaceContainerKey: containerKey
                                }
                            }
                        }
                    }, lang.hitch(this, function (returnMessage) {
                        //   console.log("containerRequest", returnMessage);
                        if (returnMessage.error) {
                            Reject(returnMessage.error);
                        } else{
                            Resolve(returnMessage);
                        }
                    }));
                })) ;

            },
            addToWorkspaceContainer: function(instanceComponentInterface, containerWidgetPath = null)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    //todo check that our keys exist
                    topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                        workspaceMessage: {
                            sessionKey: this._sessionKey, messageData: {
                                addToWorkspaceContainer: {
                                    instanceKey: instanceComponentInterface._instanceKey,
                                    componentKey: instanceComponentInterface._componentKey,
                                    containerWidgetPath: containerWidgetPath
                                }
                            }
                        }
                    }, lang.hitch(this, function (returnMessage) {
                     //   console.log("containerRequest", returnMessage);
                        if (returnMessage.error) {
                            Reject(returnMessage.error);
                        } else if(returnMessage.workspaceContainerKey){
                            Resolve(returnMessage.workspaceContainerKey);
                        }
                    }));
                })) ;
            },
            addToCurrentWorkspace: function (instanceInterface) {

                let currentWorkspaceKey = this._workspaceManagerState.get("activeWorkspace");
                let currentWorkspace = this._availableWorkspacesState.get(currentWorkspaceKey);

                if (currentWorkspace !== null && currentWorkspace !== undefined) {

                    this.addToWorkspaceContainer(instanceInterface).then(lang.hitch(this, function(workspaceContainerKey){
                     //   console.log("gotWorkspaceContainerKey", workspaceContainerKey);

                        topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                            workspaceMessage: {
                                sessionKey: this._sessionKey, messageData: {
                                    addToWorkspace: {
                                        workspaceKey: currentWorkspaceKey,
                                        workspaceContainerKey: workspaceContainerKey
                                    }
                                }
                            }
                        }, lang.hitch(this, function (returnMessage) {

                           // console.log("containerRequests", returnMessage);

                            if (returnMessage.error) {
                                alert(returnMessage.error);
                            } else {
                            }
                        }));
                    })).catch(lang.hitch(this, function(error){
                    }));
                }
            },
            unload: function () {
                let workspaces = this._workspaces;

                for (const workspaceKey in workspaces) {
                    workspaces[workspaceKey].unload();
                }

                this._workspaceManagerStateWatchHandle.unwatch();
                this._availableWorkspacesStateWatchHandle.unwatch();



                this.addToCurrentWorkspaceSubscribeHandle.remove();
            }
        });
    });