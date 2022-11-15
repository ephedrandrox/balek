define([ 	'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'balek-client/session/workspace/container/container',
        'balek-client/session/workspace/container/containables',

    ],
    function (declare, lang, topic, Stateful, balekWorkspaceContainer, balekWorkspaceContainables  ) {

        return declare( "balekClientWorkspaceManagerContainerManager",null, {
            _containers: null,
            _sessionKey: null,


            _containables: null,

            _availableContainersState: null,
            _containerManagerState: null,

            constructor: function (args) {


                declare.safeMixin(this, args);

                console.log("Initializing Balek Workspace Manager Container Manager Client...");


                let containerManagerState = declare([Stateful], {

                });
                this._containerManagerState = new containerManagerState({

                });

                this._containerManagerState.set("status", "ready");
                let availableContainersState = declare([Stateful], {

                });
                this._availableContainersState = new availableContainersState({

                });



                this._containers = {};
                this._containables = new balekWorkspaceContainables();


                this.connectToInstance();
            },
            connectToInstance: function () {

                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    workspaceMessage: {
                        sessionKey: this._sessionKey,
                        messageData: {
                            connectWorkspaceContainerManagerInterface: {
                                sessionKey: this._sessionKey
                            }
                        }
                    }
                }, lang.hitch(this, this.onContainerManagerInstanceStateChange));

            },
            onContainerManagerInstanceStateChange: function(stateChangeUpdate){

                if(stateChangeUpdate.error)
                {
                    console.log("Workspace State connect error",stateChangeUpdate );
                }

                if(stateChangeUpdate.availableContainersState)
                {
                    try{
                       // console.log("AAA", name, stateChangeUpdate.availableContainersState);

                        let availableContainersState = JSON.parse(stateChangeUpdate.availableContainersState);

                      //  console.log("AAA", name, availableContainersState);

                        for (const name in availableContainersState)
                        {
                            this._availableContainersState.set(name, availableContainersState[name]);
                            console.log("AAA", name, availableContainersState[name]);

                        }
                    }catch(error){
                        console.log(error);
                    }
                }
                if(stateChangeUpdate.containerManagerState)
                {
                    try{
                        let containerManagerState = JSON.parse(stateChangeUpdate.containerManagerState);
                        for (const name in containerManagerState)
                        {
                            this._containerManagerState.set(name, containerManagerState[name]);
                        }
                    }catch(error){
                        console.log(error);
                    }
                }
            },
            getContainerManagerState: function()
            {
                return this._containerManagerState;
            },
            getAvailableContainersState: function()
            {
                return this._availableContainersState;

            },
            getContainableInterface: function(containableInterfaceKeys)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject)
                    {
                    //    debugger;
                   //     console.log("getContainableInterfaceState", containableInterfaceKeys);

                        let containableInterfaceState = this._containables.getContainableInterfaceState(containableInterfaceKeys.componentKey);

                        let containableInterface = containableInterfaceState.get("interfaceObject");


                        if(containableInterface === undefined)
                        {
                            //watch state for interfaceObject
                        //    debugger;
                            let containableInterfaceStateWatchHandle = containableInterfaceState.watch(lang.hitch(this,
                                function(name, oldValue, newValue){
                             //       debugger;

                                 //   console.log(name, oldValue, newValue)      ;
                                    containableInterfaceStateWatchHandle.unwatch();
                                    Resolve(newValue);
                                }));
                          //  debugger;

                        }else
                        {
                           // console.log(containableInterface)      ;

                            Resolve(containableInterface)

                        }




                    }));
            },
            getContainer: function(containerKey)
            {
                if(this._containers[String(containerKey)] === undefined)
                {
                 //   console.log("making container!");

                    this._containers[String(containerKey)] = this.newContainer(containerKey);
                   // console.log("mad container!");

                }else {
                   // console.log("already there!");

                }
                return this._containers[String(containerKey)]
            },
            newContainer: function(containerKey){

                //this._workspaceContainers[String(name)] = new balekWorkspaceContainerInterface({containerManager: this.containerManager,_sessionKey: this._sessionKey
                // , _workspaceKey: this._workspaceKey, _containerKey: String(name)});


                this._containers[containerKey] = new balekWorkspaceContainer({ containerManager: this,
                    _sessionKey: this._sessionKey,
                    _containerKey: containerKey,
                   }  );


                this._availableContainersState.set(containerKey,this._containers[containerKey] );

                return this._containers[containerKey];

                //todo this creates the container which finds its way to the
            }

        });
    });