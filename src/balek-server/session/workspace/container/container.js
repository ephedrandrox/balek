define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/Stateful',
    ],
    function (declare, lang,  Stateful) {
        return declare("balekServerWorkspaceManagerContainerManagerContainer", null, {
            _instanceKey: null,
            _componentKey: null,

            _containerWidgetPath: null,
            _containerState: null,
            _containerStateWatchHandle: null,


            _interfaceConnectionCallback: null,


            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("Initializing Balek Workspace Manager Container Manager Container for Server...");


                if(this._containerWidgetPath === null){
                    this._containerWidgetPath = "balek-client/session/workspace/container/widgets/movableResizableFrame/movableResizableFrame";
                }
                let containerState = declare([Stateful], {

                });

                this._containerState = new containerState({
                    instanceKey: this._instanceKey,
                    componentKey: this._componentKey,
                    containerWidgetPath: this._containerWidgetPath,
                    isVisible: true,
                    isDocked: false

                });

                this.containerStateWatchHandle = this._containerState.watch( lang.hitch(this, this.onContainerStateChange));
            },
            onContainerStateChange: function(name, oldState, newState){
                console.log(name, oldState, newState);
                if(this._interfaceConnectionCallback != null)
                {
                    let interfaceStateObject = {[String(name)]: newState};
                    //debugger;
                    this._interfaceConnectionCallback({stateUpdate:{containerState: JSON.stringify(interfaceStateObject)}});
                }
            },
            connectWorkspaceInterface(interfaceCallback){

                this._interfaceConnectionCallback = interfaceCallback;
                console.log("Mousedown", {stateUpdate:{containerState: JSON.stringify(this._containerState)}});


                interfaceCallback({stateUpdate:{containerState: JSON.stringify(this._containerState)}});

                this._containerState.set("InterfaceConnected", true);

            },
            connectWorkspaceContainerInterface(interfaceCallback){

                console.log("Mousedown", {stateUpdate:{containerState: JSON.stringify(this._containerState)}});

                this._interfaceConnectionCallback = interfaceCallback;


                interfaceCallback({stateUpdate:{containerState: JSON.stringify(this._containerState)}});

                this._containerState.set("InterfaceConnected", true);
            },
            receiveWorkspaceContainerInterfaceMessage: function(workspaceContainerInterfaceMessage, messageReplyCallback)
            {
                messageReplyCallback({"success": "calling back"});

                if(workspaceContainerInterfaceMessage.messageData && workspaceContainerInterfaceMessage.messageData.setState)
                {
                    this.setStateMessageReceived(workspaceContainerInterfaceMessage.messageData.setState)     ;
                }
            },
            setStateMessageReceived: function(setStateMessage)
            {
                if(setStateMessage.containerState)
                {
                    let containerState = setStateMessage.containerState;

                    for (const name in containerState) {
                        console.log("containerState", name, containerState[name]);

                        this._containerState.set(name, containerState[name]);
                    }
                }
            },
            unload: function()
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject) {

                    console.log(this);



                    this.containerStateWatchHandle.unwatch();
                    this._containerState.set("unloading", true);
                    if(this._interfaceConnectionCallback !== null){
                        this._interfaceConnectionCallback({stateUpdate:{containerState: JSON.stringify({
                                    unloading: true
                                })}})
                    }
                    this.containerStateWatchHandle.remove();
                    delete this._containerState;
                    this._containerState = null;


                    Resolve({success: "Container " + this._containerKey + " unloaded" });
                }));
            }
        });
    });