define([ 	'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/Stateful',
        'dojo/topic',
        'dojo/node!crypto',
        'balek-server/session/workspace/container/container',
    ],
    function (declare,  lang, Stateful, topic, crypto, balekWorkspaceContainer  ) {

        return declare( "balekServerWorkspaceManagerContainerManager",null, {
            _containers: null,
            _interfaceCallback: null,

            _availableContainersState: null,
            _availableContainersStateWatchHandle: null,


            constructor: function (args) {


                declare.safeMixin(this, args);

                console.log("Initializing Balek Workspace Manager Container Manager server...");
                this._activeWorkspace = null;
                this._containers = {};


                let availableContainersState = declare([Stateful], {});
                this._availableContainersState = new availableContainersState({});
                this._availableContainersStateWatchHandle = this._availableContainersState.watch( lang.hitch(this, this.onAvailableContainersStateChange));


            },
            onAvailableContainersStateChange: function(name, oldState, newState){
                if(this._interfaceCallback !== null){
                    this._interfaceCallback({containerManagerState: JSON.stringify({[name.toString()]:  newState })});
                }
            },
            getUniqueContainerKey: function()
            {
                do{
                    var id = "WC"+ crypto.randomBytes(20).toString('hex');
                    if(typeof this._containers[id]== "undefined") return id;
                }while(true);

            },
            getContainer: function(containerKey)
            {
                //debugger;
                if(this._containers[String(containerKey)] === undefined)
                {
                  //  debugger;

                    this._containers[String(containerKey)] = {}


                }else if(this._containers[String(containerKey)]){
                  //  debugger;

                }
                return this._containers[String(containerKey)]
            },
            newContainer: function(instanceKey, componentKey, containerWidgetPath=null){
                let newContainerKey = this.getUniqueContainerKey();

                this._containers[newContainerKey] = new balekWorkspaceContainer({_instanceKey: instanceKey,
                                                        _componentKey: componentKey,
                                                        _containerKey: newContainerKey,
                                                        _containerWidgetPath: containerWidgetPath,
                                                        containerManager: this}  );

             //   debugger;

                let containerInfo ={
                    containerKey: newContainerKey,
                    containerName: "noName"
                    //todo add getName to container and use here
                    //todo could also share availability state in info
                };

                this._availableContainersState.set(newContainerKey, containerInfo );
                return newContainerKey;

            },
            unloadContainer: function(containerKey){

                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    if(this._containers[containerKey])
                    {
                        const containerToUnload = this._containers[containerKey];
                        console.log(containerToUnload.unload);
                        containerToUnload.unload().then(
                          lang.hitch(this,  function(Result){
                              this.workspaceManager.removeContainerFromAllWorkspaces(containerKey);
                              this._containers[containerKey] = null;
                              this._availableContainersState.set(containerKey, "gone");
                              Resolve(Result);
                            })
                        ).catch(function(errorResult){
                            Reject(errorResult);
                        });
                    }else {
                        Reject({error: "No container with key" + containerKey})
                    }
                }));
            },
            connectWorkspaceContainerManagerInterface: function(connectWorkspaceContainerInterfaceMessage, messageReplyCallback){
                this._interfaceCallback = messageReplyCallback;
                messageReplyCallback({availableContainersState: JSON.stringify(this._availableContainersState)});
            },
            connectWorkspaceContainerInterface: function(connectWorkspaceContainerInterfaceMessage, messageReplyCallback) {

                if(connectWorkspaceContainerInterfaceMessage.containerKey)
                {
                    if(this._containers[connectWorkspaceContainerInterfaceMessage.containerKey])
                    {
                    //    console.log(this._containers,this._containers[connectWorkspaceContainerInterfaceMessage.containerKey], connectWorkspaceContainerInterfaceMessage);
                        this._containers[connectWorkspaceContainerInterfaceMessage.containerKey].connectWorkspaceContainerInterface(messageReplyCallback);
                    }else
                    {
                        messageReplyCallback({error: "Server Session Workspace: not a valid container key when connecting Workspace Container State" + connectWorkspaceContainerInterfaceMessage.containerKey,
                            containerKey: connectWorkspaceContainerInterfaceMessage.containerKey});

                    }
                }else
                {
                    messageReplyCallback({error: "connectWorkspaceInterface Message did not contain a workspace Key"});
                }

            },
            receiveWorkspaceContainerInterfaceMessage: function(workspaceContainerInterfaceMessage, messageReplyCallback)
            {

                if(workspaceContainerInterfaceMessage.containerKey && this._containers[String(workspaceContainerInterfaceMessage.containerKey)] !== undefined)
                {
                    this._containers[String(workspaceContainerInterfaceMessage.containerKey)].receiveWorkspaceContainerInterfaceMessage(workspaceContainerInterfaceMessage, messageReplyCallback);
                }
            }

        });
    });