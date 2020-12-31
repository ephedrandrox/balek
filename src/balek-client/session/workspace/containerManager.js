define([ 	'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-client/session/workspace/container/container',
        'balek-client/session/workspace/container/containables',

    ],
    function (declare, lang, topic,  balekWorkspaceContainer, balekWorkspaceContainables  ) {

        return declare( "balekClientWorkspaceManagerContainerManager",null, {
            _containers: null,
            _sessionKey: null,


            _containables: null,

            constructor: function (args) {


                declare.safeMixin(this, args);

                console.log("Initializing Balek Workspace Manager Container Manager Client...");

                this._containers = {};
                this._containables = new balekWorkspaceContainables();

            },
            getContainableInterface: function(containableInterfaceKeys)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject)
                    {
                        debugger;
                   //     console.log("getContainableInterfaceState", containableInterfaceKeys);

                        let containableInterfaceState = this._containables.getContainableInterfaceState(containableInterfaceKeys.componentKey);

                        let containableInterface = containableInterfaceState.get("interfaceObject");


                        if(containableInterface === undefined)
                        {
                            //watch state for interfaceObject
                            debugger;
                            let containableInterfaceStateWatchHandle = containableInterfaceState.watch(lang.hitch(this,
                                function(name, oldValue, newValue){
                                    debugger;

                                 //   console.log(name, oldValue, newValue)      ;
                                    containableInterfaceStateWatchHandle.unwatch();
                                    Resolve(newValue);
                                }));
                            debugger;

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


                return this._containers[containerKey];

                //todo this creates the container which finds its way to the
            }

        });
    });