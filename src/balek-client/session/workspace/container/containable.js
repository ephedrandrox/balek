define([ 	'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-client/session/workspace/container/containables',
        'balek-client/session/workspace/workspaceManagerInterfaceCommands'


    ],
    function (declare, lang, topic,  balekWorkspaceContainables, balekWorkspaceManagerInterfaceCommands  ) {

        return declare( "balekClientWorkspaceManagerContainerManagerContainables",null, {

            _sessionKey: null,
            _instanceKey: null,
            _componentKey: null,


            _containerName: null,
            _containables: null,

            _assignedContainer: null,


            _workspaceContainableState: null,

            workspaceManagerCommands: null,
            constructor: function (args) {

                declare.safeMixin(this, args);
                this._containables = new balekWorkspaceContainables();
                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();
                console.log("Initializing Balek Workspace Manager Container Manager Containable Client...");

                this._componentDefaultStateSet("workspaceContainable", "containerKeys", []);



            },
            onWorkspaceContainableStateChange:function(name, oldState, newState){

            },
            isContainable: function(){
              return true;
            },
            addContainerKey(containerKey)
            {
               // console.log("containerKey:", containerKey);
                this._componentStateSet("workspaceContainable", "containerKeys", containerKey);
                this._assignedContainer = this.workspaceManagerCommands.getContainer(containerKey);

            },
            initializeContainable: function(){

                if(this._instanceKey && this._componentKey)
                {
                    this._containables.initializeContainable(this);
                }else
                {
                    console.log("not enough keys in object to become containable", this._instanceKey, this._componentKey);
                }
            },
            setContainerName: function(containerName){
                this._componentStateSet("workspaceContainable", "containerName", containerName);

                if(this._workspaceContainableState){
                    this._workspaceContainableState.set("containerName", containerName);
                }
            },
            getContainerName: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                    this.getComponentState("workspaceContainable").then(lang.hitch(this, function(workspaceContainableState){
                        this._workspaceContainableState = workspaceContainableState;
                        let containerName = workspaceContainableState.get("containerName");
                        //  debugger;

                            Resolve(containerName);



                    })).catch(lang.hitch(this, function(errorResult){
                        Reject({error: "Could not get componentState", result: errorResult});
                    }));


                }));
            },
            getContainerKeys: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                    this.getComponentState("workspaceContainable").then(lang.hitch(this, function(workspaceContainableState){
                       if(this._workspaceContainableState === null){

                           this._workspaceContainableState = workspaceContainableState;
                        }

                         let containerKeys = workspaceContainableState.get("containerKeys");
                       //  debugger;

                         if(containerKeys === undefined)
                         {
                             let workspaceContainableStateWatchHandle = workspaceContainableState.watch("containerKeys",
                                 lang.hitch(this, function(name, oldState, newState){
                                   //  console.log(name, oldState, newState);
                                     Resolve(newState);
                                     workspaceContainableStateWatchHandle.unwatch();
                                     workspaceContainableStateWatchHandle.remove();
                                 }));
                         }else {
                         //    console.log(workspaceContainableState,containerKeys);
                             Resolve(containerKeys);
                         }


                    })).catch(lang.hitch(this, function(errorResult){
                        Reject({error: "Could not get componentState", result: errorResult});
                    }));


                }));
            },
            putInWorkspaceOverlayContainer: function(){
                console.log("ZZXX", this);

                this.initializeContainable();
                console.log("ZZXX", this);

                this.getContainerKeys().then(lang.hitch(this, function(containerKeys) {
                    //this waits until the containable has component state for container Keys
                    //               console.log(containerKeys, typeof containerKeys );
                    console.log("ZZXX", containerKeys);

                    if (Array.isArray(containerKeys) && containerKeys.length === 0) {
                        //the containable has not been added to a container
                        //adding it to the workspace puts it in a
                        // console.log("users", containerKeys);

                        let workspaceContainerWidgetPath = "balek-client/session/workspace/container/widgets/movable/movableContainerWidget";
                        let activeOverlayWorkspaceKey = this.workspaceManagerCommands.getActiveOverlayWorkspace().getWorkspaceKey();
                        console.log("ZZXX", activeOverlayWorkspaceKey);



                        this.workspaceManagerCommands.addToWorkspaceContainer(this, workspaceContainerWidgetPath)
                            .then(lang.hitch(this, function (workspaceContainerKey) {

                                 this.connectContainer(workspaceContainerKey);


                                this.workspaceManagerCommands.addContainerToWorkspace(workspaceContainerKey, activeOverlayWorkspaceKey)
                                    .then(lang.hitch(this, function (addContainerToWorkspaceResponse) {
                                    }))
                                    .catch(lang.hitch(this, function (error) {
                                        console.log( "ZZXX","Error adding container to workspace", error);
                                    }));
                            })).catch(lang.hitch(this, function (error) {
                            console.log("ZZXX", "workspaces container error", error);
                        }));

                    } else {
                        //component containable is already in a container
                        this.connectContainer(containerKeys);
                    }
                })).catch(lang.hitch(this, function (error) {
                    console.log( "systemMenu","getting container keys error", error);
                }));

            },
            connectContainer: function(containerKey){
                this.connectContainerEvents(containerKey);
            },
            connectContainerEvents: function(containerKey){
                //todo put this in containable to be extended

                let containerManager  =  this.workspaceManagerCommands.getContainerManager();
                //todo add promise to get container if it isn't made yet
                let workspaceContainer = containerManager.getContainer(containerKey);
                if(this.onContainerMove && workspaceContainer){
                    workspaceContainer.setCallbackOnMove(lang.hitch(this, this.onContainerMove));
                }

            },
            toggleShowView: function()
            {
                if(this._assignedContainer !== null){
                    this._assignedContainer.toggleShowView();
                }
            },
            hide: function()
            {
                if(this._assignedContainer !== null && this._assignedContainer.hide){
                    this._assignedContainer.hide();
                }
            },
            show: function(){
                if(this._assignedContainer !== null && this._assignedContainer.show){
                    this._assignedContainer.show();
                }
            },
            startupContainable: function(){
                console.log("Startup Containable: startupContainable() should be ovwritten in Containble Extensions", this);
            },
            getDomNode: function()
            {
                return this.domNode;
            },
            getWorkspaceContainableState: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if (this._workspaceContainableState !== null) {
                        Resolve(this._workspaceContainableState);
                    } else {
                        this.getContainerKeys().then(lang.hitch(this, function (Result) {
                           Resolve(this._workspaceContainableState);
                        })).catch(lang.hitch(this, function (errorResult) {
                            Reject(errorResult);
                        }));
                    }
                }));
            },
            getContainer: function() {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    this.getContainerKeys().then(lang.hitch(this, function (containerKeys) {
                        if (Array.isArray(containerKeys) && containerKeys.length === 0) {
                            //There is no Container!
                            //todo, if argument is true, create a container!
                            //for now if lets only use this when we expect a container
                            Reject("There is no container, Make one in containable.js getContainer()")
                        }
                        else
                        {
                            let containerManager  =  this.workspaceManagerCommands.getContainerManager();
                            let workspaceContainer = containerManager.getContainer(containerKeys);
                            Resolve(workspaceContainer);
                        }
                    })).catch(lang.hitch(this, function (error) {
                        Reject({"getting container keys error": error});
                    }));
                }));
            }
        });
    });