define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'balek/session/workspace/workspace',
    ],
    function (declare, lang, topic, Stateful, balekWorkspaceManagerWorkspace) {
        return declare("balekServerWorkspaceManagerWorkspace", balekWorkspaceManagerWorkspace, {
            instances: null,
            containers: null,
            _workspaceName: "Untitled Workspace",
            _workspaceKey: null,

            _workspaceState: null,
            _workspaceStateWatchHandle: null,

            _containers: null,
            _containersState: null,
            _containersStateWatchHandle: null,


            _interfaceConnectionCallback: null,
            constructor: function (args) {
                //todo audit/comment this file

                declare.safeMixin(this, args);
                console.log("Initializing Balek Workspace Manager Workspace for Server...");
                this.instances = {};
                this.containers = {};
                this._containers = {};


                let workspaceState = declare([Stateful], {
                    name: "",
                    key: ""
                });

                this._workspaceState = new workspaceState({
                    name:  this._workspaceName,
                    key:  this._workspaceKey
                });

                this._workspaceStateWatchHandle = this._workspaceState.watch( lang.hitch(this, this.onWorkspaceStateChange));
                //todo unwatch this when unloaded

                let containersState = declare([Stateful], {

                });

                this._containersState = new containersState({

                });

                this._containersStateWatchHandle = this._containersState.watch( lang.hitch(this, this.onContainersStateChange));

                //todo unwatch this when unloaded


            },
            connectWorkspaceInterface(interfaceCallback){

                this._interfaceConnectionCallback = interfaceCallback;


                interfaceCallback({workspaceState: JSON.stringify(this._workspaceState)});
                interfaceCallback({containersState: JSON.stringify(this._containersState)});


                this._workspaceState.set("InterfaceConnected", true);

            },
            onWorkspaceStateChange: function(name, oldState, newState){

                if(String(name) === "name")
                {
                    this._workspaceName = newState;
                }
                if(this._interfaceConnectionCallback != null)
                {
                    let interfaceStateObject = {[String(name)]: newState};
                    this._interfaceConnectionCallback({workspaceState: JSON.stringify(interfaceStateObject)});
                }
            },
            onContainersStateChange: function(name, oldState, newState){
                if(this._interfaceConnectionCallback != null)
                {
                    let interfaceStateObject = {[String(name)]: newState};
                    this._interfaceConnectionCallback({containersState: JSON.stringify(interfaceStateObject)});
                }
            },
            addToWorkspaceRequestReceived: function (addToWorkspaceRequest, messageReplyCallback) {

            //    console.log("addToWorkspace", addToWorkspaceRequest);

               if(addToWorkspaceRequest.workspaceContainerKey)
               {

                   let workspaceContainerToAdd = this.containerManager.getContainer(addToWorkspaceRequest.workspaceContainerKey);


                 //  console.log(workspaceContainerToAdd);
                this._containers[addToWorkspaceRequest.workspaceContainerKey] = workspaceContainerToAdd;
               // console.log(addToWorkspaceRequest.workspaceContainerKey, workspaceContainerToAdd,this._containers[addToWorkspaceRequest.workspaceContainerKey] )
                   this._containersState.set(addToWorkspaceRequest.workspaceContainerKey, true);
                   messageReplyCallback({
                       success: "addedToWorkspace",
                       workspaceKey: addToWorkspaceRequest.workspaceKey,
                       instanceKey: addToWorkspaceRequest.workspaceContainerKey
                   });
               }
               else if (addToWorkspaceRequest.instanceKey) {

                   if(addToWorkspaceRequest.componentKey){

                       let newWorkspaceContainerKey = this.containerManager.newContainer(this._workspaceKey , addToWorkspaceRequest.instanceKey,
                           addToWorkspaceRequest.componentKey);
                        this._containersState.set(newWorkspaceContainerKey, {instanceKey: addToWorkspaceRequest.instanceKey,
                            componentKey:addToWorkspaceRequest.componentKey});

                   }else {
                       this.instances[addToWorkspaceRequest.instanceKey] = {instanceKey: addToWorkspaceRequest.instanceKey};

                   }

                    messageReplyCallback({
                        success: "addedToWorkspace",
                        workspaceKey: addToWorkspaceRequest.workspaceKey,
                        instanceKey: addToWorkspaceRequest.instanceKey,
                        componentKey: addToWorkspaceRequest.componentKey
                    });
                } else {
                    messageReplyCallback({
                        error: "No instanceKey Key",
                        workspaceKey: addToWorkspaceRequest.workspaceKey,
                        interfaceKey: addToWorkspaceRequest.instanceKey
                    });
                }
            },
            changeWorkspaceNameReceived: function (workspaceName, messageReplyCallback) {
                if (workspaceName) {
                    this._workspaceState.set("name", workspaceName)
                  //  this._workspaceName = workspaceName;
                    messageReplyCallback({
                        success: "changeWorkspaceName",
                        workspaceKey: this._workspaceKey,
                        workspaceName: workspaceName
                    });
                } else {
                    messageReplyCallback({
                        error: "No Workspace Name",
                        workspaceKey: this._workspaceKey,
                        workspaceName: workspaceName
                    });
                }
            }
        });
    });