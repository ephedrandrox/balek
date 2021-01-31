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

            _containables: null,

            _assignedContainer: null,


            _workspaceContainableState: null,
            _workspaceContainableStateWatchHandle: null,

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
            getContainerKeys: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                    this.getComponentState("workspaceContainable").then(lang.hitch(this, function(workspaceContainableState){
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
            toggleShowView: function()
            {
                if(this._assignedContainer !== null){
                    this._assignedContainer.toggleShowView();
                }
            },
            hide: function()
            {
                if(this._assignedContainer !== null){
                    this._assignedContainer.hide();
                }
            },
            show: function(){
                if(this._assignedContainer !== null){
                    this._assignedContainer.show();
                }
            },
            getDomNode: function()
            {
                return this.domNode;
            }

        });
    });