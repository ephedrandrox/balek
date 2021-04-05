define([ 	'dojo/_base/declare',
        "dojo/_base/lang",
        'dojo/dom-construct',

        "dojo/dom-style",
        "dojo/aspect",


        "balek-modules/diaplode/navigator/Interface/menus/systemMenuWidget",

        'balek-client/session/workspace/workspaceManagerInterfaceCommands',

        //Balek Interface Includes
        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable'

    ],
    function (declare, lang,
              domConstruct,
              domStyle,
              aspect,
              systemMenuWidget,
              balekWorkspaceManagerInterfaceCommands,
              //Balek Interface Includes
              _syncedCommanderInterface,
              _balekWorkspaceContainerContainable ) {

        return declare( "diaplodeNavigatorInterfaceSystemMenu",[_syncedCommanderInterface,_balekWorkspaceContainerContainable], {
            _instanceKey: null,
            _syncedMap: null,
            _menuCompanion: null,
            _navigatorSystemMenusState: null,


            workspaceManagerCommands: null,

            _systemMenuWidget: null,

            constructor: function (args) {


                declare.safeMixin(this, args);
                console.log("systemMenu",this._instanceKey)

                console.log("Initializing Diaplode Navigator Interface System Menu...");
                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();



                console.log("navigator" , this._componentKey);

                if(this._navigatorSystemMenusState === null)
                {
                    console.log("Menu Could not be initialized");
                }else {
                   // console.log("creating System Menu", this._syncedMap , this._menuCompanion);
                   // this._syncedMap.setStateWatcher(lang.hitch(this, this.syncedMapItemStateChange));
                }

            },
            loadWidget: function(){


                let systemMenuName = this._interfaceState.get("name");
                let systemMap = this._navigatorSystemMenusState.get(systemMenuName);


                let finishLoading = lang.hitch(this, function(){

                    this._systemMenuWidget = new systemMenuWidget({_instanceKey: this._instanceKey, _systemMenu: systemMap, _navigatorWidget: this._navigatorWidget});

                    if(this._systemMenuWidget.domNode){
                        console.log("systemMenu", "no aspect after", this._systemMenuWidget.domNode );
                        this.putMenuInWorkspaceContainer();
                    }else {
                        console.log("systemMenu", "aspect after", this._systemMenuWidget.domNode );

                        aspect.after(this._systemMenuWidget, "postCreate", lang.hitch(this, function(){
                            console.log("systemMenu", "aspect after", this._systemMenuWidget.domNode );

                            this.putMenuInWorkspaceContainer();
                        }));
                    }
                });

                if(systemMap)
                {
                     finishLoading();
                }else
                {
                    let watchHandle = this._navigatorSystemMenusState.watch(lang.hitch(this, function(name, oldState, newState){
                        console.log("No systemMap uyet!",systemMenuName, systemMap, name, oldState, newState );
                        if(name.toString() === systemMenuName.toString()){
                            watchHandle.unwatch();
                            watchHandle.remove();
                            systemMap = this._navigatorSystemMenusState.get(systemMenuName);
                            finishLoading();
                        }
                    }));
                }


            },
            putMenuInWorkspaceContainer: function(){
                this.initializeContainable();
                this.getContainerKeys().then(lang.hitch(this, function(containerKeys) {
                    //this waits until the containable has component state for container Keys
                    //               console.log(containerKeys, typeof containerKeys );

                    if (Array.isArray(containerKeys) && containerKeys.length === 0) {
                        //the containable has not been added to a container
                        //adding it to the workspace puts it in a
                        // console.log("users", containerKeys);

                        let workspaceContainerWidgetPath = "balek-client/session/workspace/container/widgets/movable/movableContainerWidget";
                        let activeOverlayWorkspaceKey = this.workspaceManagerCommands.getActiveOverlayWorkspace().getWorkspaceKey();
                        console.log("workspaceUpdate", activeOverlayWorkspaceKey);



                        this.workspaceManagerCommands.addToWorkspaceContainer(this, workspaceContainerWidgetPath)
                            .then(lang.hitch(this, function (workspaceContainerKey) {
                                //console.log("users", "gotWorkspaceContainerKey", workspaceContainerKey);

                                this.connectContainer(workspaceContainerKey);

                                this.workspaceManagerCommands.addContainerToWorkspace(workspaceContainerKey, activeOverlayWorkspaceKey)
                                    .then(lang.hitch(this, function (addContainerToWorkspaceResponse) {
                                        console.log("workspaceUpdate","Container added to workspace", addContainerToWorkspaceResponse);
                                    }))
                                    .catch(lang.hitch(this, function (error) {
                                        console.log( "workspaceUpdate","Error adding container to workspace", error);
                                    }));
                            })).catch(lang.hitch(this, function (error) {
                             console.log("workspaceUpdate", "workspaces container error", error);
                        }));

                    } else {
                        //component containable is already in a container
                        this.connectContainer(containerKeys);
                        console.log("systemMenu","already in a container", containerKeys);
                    }
                })).catch(lang.hitch(this, function (error) {
                    console.log( "systemMenu","getting container keys error", error);
                }));


               // domConstruct.place(this._systemMenuWidget.domNode, this._navigatorWidget.domNode);
            },
            connectContainer: function(containerKey){
                //todo put this in containable
                this.connectContainerEvents(containerKey);
            },
            connectContainerEvents: function(containerKey){
                //todo put this in containable to be extended
                let containerManager  =  this.workspaceManagerCommands.getContainerManager();
                let workspaceContainer = containerManager.getContainer(containerKey);
                workspaceContainer.setCallbackOnMove(lang.hitch(this, this.onContainerMove));
            },
            onContainerMove: function(MoveEvent)
            {
                   if (this._systemMenuWidget){
                       this._systemMenuWidget._onMove();
                   }
            },
            onInterfaceStateChange: function (name, oldState, newState) {
                console.log("navigator onInterfaceStateChange" , name, newState);
                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommands and link them

                this.inherited(arguments);

                if (name.toString() === "name") {
                    console.log("navigator" , "got name, getting syncedmap");
                    this.loadWidget();
                }



            },
            syncedMapItemStateChange: function(itemKey, oldState, newState)
            {
                //console.log("item", itemKey, oldState, newState);
            },
            loadItem: function(itemKey){
             //   console.log("Load item", itemKey);
                if(this._menuCompanion && this._menuCompanion.load)
                {
                    this._menuCompanion.load(itemKey).then().catch();
                }
            },
            getDomNode: function()
            {
                return this._systemMenuWidget.domNode;
            }

        });
    });