define([ 	'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/node!crypto',

        'dojo/Stateful',

        'balek/session/workspaceManager',
        'balek-server/session/workspace/workspace',
        'balek-server/session/workspace/containerManager'],
    function (declare, lang, topic, crypto, Stateful, balekWorkspaceManager, balekWorkspace, balekWorkspaceContainerManager ) {

        return declare( "balekServerWorkspaceManager",balekWorkspaceManager, {

            containerManager: null,

            _workspaces: null,
            _workspacesStateWatchHandles: null,

            _activeWorkspace: null,



            _workspaceManagerState: null,
            _availableWorkspacesState: null,
            _availableWorkspacesStateWatchHandle: null,
            _interfaceConnectionCallback: null,

            constructor: function(args){

                //todo audit/comment this file
                declare.safeMixin(this, args);
                this._workspacesStateWatchHandles = {};
                //todo make sure we stop this on session unload

                this.containerManager = new balekWorkspaceContainerManager({_sessionKey: this._sessionKey});

                console.log("Initializing Balek Workspace Manager server...");
                this._activeWorkspace = null;
                this._workspaces = {};


                /*
                Create the States and connect to watch Functions
                 */
                /*
                 workspaceManagerState: State for this Manager that is sent to the Connected Interface
                */
                let workspaceManagerState = declare([Stateful], {});
                //todo make sure we stop this on session unload
                this._workspaceManagerState = new workspaceManagerState({});
                this._workspaceManagerStateWatchHandle = this._workspaceManagerState.watch( lang.hitch(this, this.onWorkspaceManagerStateChange));
                /*
                   availableWorkspacesState: State list of workspaces that is sent to the Connected Interface
                */
                let availableWorkspacesState = declare([Stateful], {});
                this._availableWorkspacesState = new availableWorkspacesState({});
                this._availableWorkspacesStateWatchHandle = this._availableWorkspacesState.watch( lang.hitch(this, this.onAvailableWorkspacesStateChange));
                //todo make sure we stop this on session unload

                //Creates initial workspace and sets it to active
                this._workspaceManagerState.set("activeWorkspace", this.getNewWorkspace().workspaceKey);
                this._workspaceManagerState.set("activeOverlayWorkspace", this.getNewOverlayWorkspace().workspaceKey);

            },
            sessionRequest: function(workspaceManagerRequest, messageCallback){
                    if(workspaceManagerRequest.interfaceConnectSyncedStateRequest){
                        this.connectInterface(messageCallback);
                    }
            },
            onWorkspaceManagerStateChange:  function(name, oldState, newState){
                if(this._interfaceConnectionCallback != null)
                {
                    let interfaceStateObject = {[String(name)]: newState};
                    debugger;
                    this._interfaceConnectionCallback({workspaceManagerState: JSON.stringify(interfaceStateObject)});
                }
            },
            onAvailableWorkspacesStateChange: function(name, oldState, newState){
                if(this._interfaceConnectionCallback != null)
                {
                    let interfaceStateObject = {[String(name)]: newState};
                    debugger;
                    this._interfaceConnectionCallback({availableWorkspacesState: JSON.stringify(interfaceStateObject)});
                }
            },
            connectInterface(interfaceCallback){
                //This is called when the Interface requests to be connected
                //called from sessionRequest Method
                this._interfaceConnectionCallback = interfaceCallback;
                interfaceCallback({availableWorkspacesState: JSON.stringify(this._availableWorkspacesState)});
                interfaceCallback({workspaceManagerState: JSON.stringify(this._workspaceManagerState)});
            },
            onWorkspaceStateChange: function(workspaceKey, name, oldState,newState){
                //console.log(name, oldState,newState);
                if(name.toString() === "name" )
                {
                    let workspaceInfo ={
                        workspaceKey: workspaceKey,
                        workspaceName: newState
                    };

                    this._availableWorkspacesState.set(workspaceKey,workspaceInfo );
                }
            },
            getNewWorkspace: function(newWorkspaceName = "Workspace"){
                let newWorkspaceKey = this.getUniqueWorkspaceKey();
                this._workspaces[newWorkspaceKey] =new balekWorkspace({_workspaceKey:newWorkspaceKey, _workspaceName: newWorkspaceName, containerManager: this.containerManager });

                this._workspacesStateWatchHandles[newWorkspaceKey] = this._workspaces[newWorkspaceKey].getWorkspaceState().watch(lang.hitch(this, this.onWorkspaceStateChange, newWorkspaceKey));

                let workspacesToReturn ={
                    workspaceKey: newWorkspaceKey,
                    workspaceName: this._workspaces[newWorkspaceKey]._workspaceName
                };

                this._availableWorkspacesState.set(newWorkspaceKey,workspacesToReturn );
                //todo watch for changes on new workspace state and update
                return workspacesToReturn;
            },
            getNewOverlayWorkspace: function(newWorkspaceName = "Workspace"){
                let newWorkspaceKey = this.getUniqueWorkspaceKey();
                this._workspaces[newWorkspaceKey] =new balekWorkspace({_workspaceKey:newWorkspaceKey, _workspaceName: newWorkspaceName, containerManager: this.containerManager });

                this._workspacesStateWatchHandles[newWorkspaceKey] = this._workspaces[newWorkspaceKey].getWorkspaceState().watch(lang.hitch(this, this.onWorkspaceStateChange, newWorkspaceKey));

                let workspacesToReturn ={
                    workspaceKey: newWorkspaceKey,
                    workspaceName: this._workspaces[newWorkspaceKey]._workspaceName
                };


                //todo watch for changes on new workspace state and update
                return workspacesToReturn;
            },
            getUniqueWorkspaceKey: function()
            {
                do{
                    var id = crypto.randomBytes(20).toString('hex');
                    if(typeof this._workspaces[id]== "undefined") return id;
                }while(true);

            },
            getWorkspaces: function(){
                let workspacesToReturn ={};
                for (const workspaceKey in this._workspaces)
                {
                    workspacesToReturn[workspaceKey]= {
                        _workspaceKey: workspaceKey,
                        _workspaceName: this._workspaces[workspaceKey]._workspaceName,
                        instances: this._workspaces[workspaceKey].instances
                    }

                }

                return workspacesToReturn;
            },
            getActiveWorkspace: function()
            {
                return this._activeWorkspace;
            },
            unloadModuleInstance: function(unloadModuleInstanceKey)
            {
                for (const workspaceKey in this._workspaces)
                {
                  delete this._workspaces[workspaceKey].instances[unloadModuleInstanceKey];
                }
            },
            receiveWorkspaceMessage: function(workspaceMessage, messageReplyCallback){

                if(workspaceMessage.messageData)
                {
                    if(workspaceMessage.messageData.addToWorkspace){
                        this.addToWorkspaceRequestReceived(workspaceMessage.messageData.addToWorkspace, messageReplyCallback);

                    }else if(workspaceMessage.messageData.addToWorkspaceContainer){
                        this.addToWorkspaceContainerRequestReceived(workspaceMessage.messageData.addToWorkspaceContainer, messageReplyCallback);
                    }else if(workspaceMessage.messageData.unloadWorkspaceContainer){
                        this.unloadWorkspaceContainerRequestReceived(workspaceMessage.messageData.unloadWorkspaceContainer, messageReplyCallback);
                    }else if(workspaceMessage.messageData.changeActiveWorkspace){
                        console.log("changing active Workspace" ,workspaceMessage);

                        this.changeActiveWorkspace(workspaceMessage.messageData.changeActiveWorkspace, messageReplyCallback);

                    }else if(workspaceMessage.messageData.changeWorkspaceName){
                        console.log("changing Workspace Name" ,workspaceMessage);

                        this.changeWorkspaceName(workspaceMessage.messageData.changeWorkspaceName, messageReplyCallback);

                    }else if(workspaceMessage.messageData.newWorkspace){
                        console.log("Creating New Workspace" ,workspaceMessage);

                        this.newWorkspaceRequest(workspaceMessage.messageData.newWorkspace, messageReplyCallback);

                    }else if(workspaceMessage.messageData.connectWorkspaceInterface){
                        //      console.log("connecting Workspace Interface" ,workspaceMessage);
                        this.connectWorkspaceInterface(workspaceMessage.messageData.connectWorkspaceInterface, messageReplyCallback);
                    }else if(workspaceMessage.messageData.connectWorkspaceContainerInterface){
                      //  console.log("connecting Workspace Container Interface" ,workspaceMessage);
                        this.containerManager.connectWorkspaceContainerInterface(workspaceMessage.messageData.connectWorkspaceContainerInterface, messageReplyCallback);
                    }else if(workspaceMessage.messageData.workspaceContainerInterfaceMessage){
                      //  console.log("Relaying Workspace Container Interface Message" ,workspaceMessage);
                        this.containerManager.receiveWorkspaceContainerInterfaceMessage(workspaceMessage.messageData.workspaceContainerInterfaceMessage, messageReplyCallback);
                    }else
                    {
                        messageReplyCallback({error: "Did not recognize command"});
                    }
                }

            },
            connectWorkspaceInterface: function(connectWorkspaceInterfaceMessage, messageReplyCallback){
                if(connectWorkspaceInterfaceMessage.workspaceKey)
                {
                    if(this._workspaces[connectWorkspaceInterfaceMessage.workspaceKey])
                    {
                        this._workspaces[connectWorkspaceInterfaceMessage.workspaceKey].connectWorkspaceInterface(messageReplyCallback);
                    }else
                    {
                        messageReplyCallback({error: "Server Session Workspace Manager: not a valid workspace key when connecting Workspace State" + connectWorkspaceInterfaceMessage.workspaceKey,
                            workspaceKey: connectWorkspaceInterfaceMessage.workspaceKey});

                    }
                }else
                {
                    messageReplyCallback({error: "connectWorkspaceInterface Message did not contain a workspace Key"});
                }
            },
            newWorkspaceRequest:function(newWorkspaceRequest, messageReplyCallback){
                console.log(this.getNewWorkspace(newWorkspaceRequest.workspaceName));
                messageReplyCallback({success: "Created New Workspace"});
            },
            changeWorkspaceName: function(changeWorkspaceName, messageReplyCallback){
                if(changeWorkspaceName.workspaceKey && this._workspaces[changeWorkspaceName.workspaceKey] && changeWorkspaceName.workspaceName ){

                    this._workspaces[changeWorkspaceName.workspaceKey].changeWorkspaceNameReceived(changeWorkspaceName.workspaceName, messageReplyCallback);
                }else
                {

                    messageReplyCallback({error: "Server Session Workspace Manager: not a valid workspace key when changing Workspace Name" + changeWorkspaceName.workspaceKey,
                        workspaceKey: changeWorkspaceName.workspaceKey, workspaceName:  changeWorkspaceName.workspaceName});
                }

            },
            changeActiveWorkspace: function(changeActiveWorkspaceRequest, messageReplyCallback){
                if(changeActiveWorkspaceRequest.workspaceKey && this._workspaces[changeActiveWorkspaceRequest.workspaceKey]){

                  this._activeWorkspace = changeActiveWorkspaceRequest.workspaceKey;
                    this._workspaceManagerState.set("activeWorkspace", changeActiveWorkspaceRequest.workspaceKey);
                    messageReplyCallback({success: "changeActiveWorkspace", workspaceKey: changeActiveWorkspaceRequest.workspaceKey });
                  }else
                {

                    messageReplyCallback({error: "Server Session Workspace Manager: not a valid workspace key when changing active Workspace" + changeActiveWorkspaceRequest.workspaceKey,
                        workspaceKey: changeActiveWorkspaceRequest.workspaceKey});
                }


            },
            unloadWorkspaceContainerRequestReceived: function(unloadWorkspaceContainerRequest,messageReplyCallback ){


                if(unloadWorkspaceContainerRequest.containerKey){
                    const containerKeyToUnload = unloadWorkspaceContainerRequest.containerKey;
                    this.containerManager.unloadContainer(containerKeyToUnload).then(function(Result){
                        messageReplyCallback(Result);
                    }).catch(function(errorResult){
                        messageReplyCallback( errorResult);
                    });
                }else {
                    messageReplyCallback({
                        error: "Server Session Workspace Manager: no container key sent to unload",
                        workspaceKey: unloadWorkspaceContainerRequest.containerKey
                    });
                }
            },
            addToWorkspaceRequestReceived: function(addToWorkspaceRequest, messageReplyCallback){
              //  console.log("addToWorkspaceRequestReceived manager-", addToWorkspaceRequest);
                if(addToWorkspaceRequest.workspaceKey && this._workspaces[addToWorkspaceRequest.workspaceKey]){
                    this._workspaces[addToWorkspaceRequest.workspaceKey].addToWorkspaceRequestReceived(addToWorkspaceRequest,messageReplyCallback );
                }else
                {
                    messageReplyCallback({error: "Server Session Workspace Manager: not a valid workspace key when adding to Workspace",
                        workspaceKey: addToWorkspaceRequest.workspaceKey});
                }

            },
            addToWorkspaceContainerRequestReceived: function(addToWorkspaceContainerRequest, messageReplyCallback){

                if(addToWorkspaceContainerRequest.instanceKey && addToWorkspaceContainerRequest.componentKey){
                    let containerKey = this.containerManager.newContainer(addToWorkspaceContainerRequest.instanceKey,addToWorkspaceContainerRequest.componentKey,addToWorkspaceContainerRequest.containerWidgetPath );
                    if(containerKey){
                        messageReplyCallback({workspaceContainerKey: containerKey});
                    }
                    //this._workspaces[addToWorkspaceContainerRequest.workspaceKey].addToWorkspaceRequestReceived(addToWorkspaceContainerRequest,messageReplyCallback );
                }else
                {
                    messageReplyCallback({error: "Server Session Workspace Manager: Must provide instanceKey and componentKey when adding to Workspace Container"});
                }

            }



        });
    });