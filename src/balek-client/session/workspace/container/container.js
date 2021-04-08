define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',


        'dojo/dom-class',
        'dojo/dom-construct',
        'dojo/dom-geometry',
        "dojo/_base/window",

        'dojo/on',
        "dojo/dom-attr",
        "dojo/dom-style",
        "dojo/keys",
        "dijit/focus",
        "dojo/ready",
        'dojo/_base/fx',
        'balek-client/session/workspace/workspaceManagerInterfaceCommands'



    ],
    function (declare,
              lang,
              topic,
              Stateful,

              domClass,
              domConstruct,
              domGeometry,
              win,

              on,
              domAttr,
              domStyle,
              dojoKeys,
              dijitFocus,
              dojoReady,
              fx,
              balekWorkspaceManagerInterfaceCommands) {

        return declare("balekWorkspaceContainer", null, {

            containerManager: null,
            _containerKey: null,
            _containerState: null,

            _interfaceKeys: null,

            _containedInterfaceHandle: null,
            _workspaceContainerWidget: null,

            _containableCallbackOnMove: null,

            _cachedDisplayStyle: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

               // console.log("container starting");
                this._interfaceKeys = { instanceKey: null,
                                        componentKey: null};

                let containerState = declare([Stateful], {

                });
                this._containerState = new containerState({

                });
                this._containerStateWatchHandle = this._containerState.watch(lang.hitch(this, this.onWorkspaceContainerInterfaceStateUpdate));

                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();


                this.connectToContainerInstance();


            },
            startup: function()
            {
                this._workspaceContainerWidget.startup();
                if(this._containedInterfaceHandle !== null){
                    this._containedInterfaceHandle.startupContainable();
                }

            },
            connectToContainerInstance: function(){

                if(this._containerKey && this._sessionKey){
                 //   console.log("Container Key!", this._containerKey);
                    topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                        workspaceMessage: {
                            sessionKey: this._sessionKey,
                            messageData: {
                                connectWorkspaceContainerInterface: {
                                  //  workspaceKey: this._workspaceKey,
                                    containerKey: this._containerKey
                                }
                            }
                        }
                    }, lang.hitch(this, this.onWorkspaceContainerInstanceMessage));

                }else {
                    console.log("No Container, Workspace Key, or Session Key!");
                }

            },
            setContainerState: function(name, state){
                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    workspaceMessage: {
                        sessionKey: this._sessionKey,
                        messageData: {
                            workspaceContainerInterfaceMessage: {
                                workspaceKey: this._workspaceKey,
                                containerKey: this._containerKey,
                                messageData: {setState: {containerState: {[name] : state}}}
                            }
                        }
                    }
                },function(reply){
                   // console.log(reply)
                });
            },
            refreshContainerWidget: function(){
                if(this._workspaceContainerWidget === null)
                {
                    //create widget

                    let containerWidgetPath = this._containerState.get("containerWidgetPath");
                    if(containerWidgetPath !== undefined && this._containedInterfaceHandle !== null && this._containedInterfaceHandle.isContainable)
                    {
                        this._containedInterfaceHandle.addContainerKey(this._containerKey);

                        this._containedInterfaceHandle.getWorkspaceContainableState().then(lang.hitch(this, function(workspaceContainableState){
                            this._workspaceContainerWidget = "Creating Widget";

                            require(["dojo/ready", containerWidgetPath], lang.hitch(this, function(ready, containerWidget){
                                ready(lang.hitch(this, function(){


                                    this._workspaceContainerWidget = new containerWidget({_sessionKey: this._sessionKey,
                                        _containerKey: this._containerKey,
                                        _containerOnMoved: lang.hitch(this, this.onMoved),
                                        _containedInterfaceHandle:this._containedInterfaceHandle,
                                        _containerState: this._containerState,
                                        _workspaceContainableState: workspaceContainableState,
                                        setContainerState: lang.hitch(this, this.setContainerState),
                                        workspaceManagerCommands: this.workspaceManagerCommands,
                                        containerCommands: {setDocked: lang.hitch(this,this.setDocked),
                                            unloadContainer: lang.hitch(this,this.unloadContainer)}

                                    });



                                    let isDocked = this._containerState.get("isDocked");

                                    if(isDocked === true)
                                    {
                                        this.dockContainer();
                                    }

                                    let isVisible = this._containerState.get("isVisible");
                                    console.log("Mousedown",this, isVisible, isDocked, this._containerState);

                                    if(isVisible === true )
                                    {
                                        this.show();
                                    }
                                    if(isVisible === false )
                                    {
                                        this.hide();
                                    }


                                    let activeWorkspace = this.workspaceManagerCommands.getActiveWorkspace();
                                    let activeOverlayWorkspace = this.workspaceManagerCommands.getActiveOverlayWorkspace();

                                    let activeWorkspaceContainers =  this.workspaceManagerCommands.getWorkspaceContainers(activeWorkspace.getWorkspaceKey());
                                    let activeOverlayWorkspaceContainers =  this.workspaceManagerCommands.getWorkspaceContainers(activeOverlayWorkspace.getWorkspaceKey());

                                    console.log("workspaceUpdate", activeWorkspace, activeWorkspaceContainers);

                                    if(activeWorkspaceContainers !== null && activeWorkspaceContainers[this._containerKey]){
                                        activeWorkspace.activateContainer(this._containerKey);
                                        console.log("workspaceUpdate", activeWorkspace, activeWorkspaceContainers);

                                    }else if( activeOverlayWorkspaceContainers !== null && activeOverlayWorkspaceContainers[this._containerKey]){
                                        activeOverlayWorkspace.activateContainer(this._containerKey);
                                        console.log("workspaceUpdate", activeWorkspace, activeWorkspaceContainers);

                                    }
                                    else
                                    {
                                        console.log("workspaceUpdate", "no");

                                        console.log("no!",this._containerKey, activeWorkspaceContainers );
                                    }


                                    //todo check if container is in any workspace
                                }));
                            }));
                        })).catch(lang.hitch(this, function(errorResult){
                            console.log("Error getting containable state", errorResult,this._containedInterfaceHandle );

                        }));


                    }else
                    {
                        console.log("Cannot make widget without path and interface", containerWidgetPath,this._containedInterfaceHandle );
                    }
                }
            },
            onWorkspaceContainerInstanceMessage: function(instanceMessage){
                //console.log("receivedMessage", instanceMessage);
                if(instanceMessage && instanceMessage.stateUpdate)
                {
                    if(instanceMessage.stateUpdate.containerState)
                    {
                        this.onContainerStateUpdateReceived(JSON.parse(instanceMessage.stateUpdate.containerState));
                    }
                }
            },
            onInterfaceKeyUpdate: function(){
                if(this._interfaceKeys.instanceKey !== null && this._interfaceKeys.componentKey !== null ){
                    if(this._containedInterfaceHandle !== null){
                        //check containedInterface.componentKey and instanceKey and act accordingly
                    }else
                    {
                       // console.log("getting Contained Interface", this._interfaceKeys);
                        this._containedInterfaceHandle = "Getting Handle";
                        //topic.publish("getContainable", this._interfaceKeys);
                       // console.log(this.containerManager);
                        this.containerManager.getContainableInterface(this._interfaceKeys).then(lang.hitch(this, function(containedInterfaceHandle){
                       //     console.log("succcccc", containedInterfaceHandle);

                            if(this.setContainedInterfaceHandle(containedInterfaceHandle))
                            {
                                //debugger;
                                this.refreshContainerWidget();
                            };
                        })).catch(function(getInterfaceError){
                            console.log(getInterfaceError);
                        });
                    }
                }
            },
            setContainedInterfaceHandle: function(containedInterfaceHandle)
            {
                if(containedInterfaceHandle.isContainable && containedInterfaceHandle.isContainable())
                {
                    this._containedInterfaceHandle = containedInterfaceHandle;
                    return true;
                }else {
                    console.log("containedInterfaceHandle is not containable");
                    return false;
                }

            },
            onContainerStateUpdateReceived: function(containerState){
                console.log("Mousedown", containerState);
                let keysUpdated = false;
                if(containerState.instanceKey){
                    this._interfaceKeys.instanceKey = containerState.instanceKey;
                    keysUpdated = true;
                }
                if(containerState.componentKey){
                    this._interfaceKeys.componentKey = containerState.componentKey;
                    keysUpdated = true;
                }
                if(containerState.containerWidgetPath){
                    console.log("Mousedown", "in seting");

                    this._containerState.set("containerWidgetPath", containerState.containerWidgetPath);
                }
                if(containerState.movableContainerElementBox){
                    console.log("Mousedown", "in seting");

                    this._containerState.set("movableContainerElementBox", containerState.movableContainerElementBox);
                }

                if(containerState.isVisible !== undefined){

                    this._containerState.set("isVisible", containerState.isVisible);


                }

                if(containerState.isDocked !== undefined){

                    this._containerState.set("isDocked", containerState.isDocked);
                }

                if(containerState.unloading !== undefined){
                    this._containerState.set("unloading", containerState.unloading);
                }


                if(keysUpdated){
                    this.onInterfaceKeyUpdate();
                }
            },
            onWorkspaceContainerInterfaceStateUpdate: function(name, oldState, newState)
            {
               // console.log("Container State Updated! If we get Ready Status we ");

                console.log("Mousedown", name, oldState, newState);
                if(name === 'elementBox' && oldState === undefined){
                    this.updateWidgetWithElementBox(newState);
                    // this.moveTo(Math.round(newState.t), Math.round(newState.l));
                    // this.resizeTo(Math.round(newState.w), Math.round(newState.h));
                }
                if(name === 'containerInfo' && oldState === undefined){
                    this.updateWidgetWorkspaceInfo(newState);
                    // this.moveTo(Math.round(newState.t), Math.round(newState.l));
                    // this.resizeTo(Math.round(newState.w), Math.round(newState.h));
                }
                if(name === 'containerWidgetPath' ){
                    //debugger;
                   this.refreshContainerWidget();
                }
                if(name === 'isDocked' ){
                    console.log("Mousedown", name, oldState, newState);

                    if(newState === true)
                    {
                        this.dockContainer();
                    }else
                    {
                        this.undockContainer();
                    }
                }
                if(name === 'isVisible' ){
                    if(newState === true)
                    {
                        this.show();
                    }else
                    {
                        this.hide();
                    }
                }
                if(name === 'unloading' ){
                   this.unload();

                }

                //if instance and component Keyare up then get interface we can load our widget?


            },
            updateWidgetWorkspaceInfo: function(workspaceInfo){
               // console.log("workspace Info", workspaceInfo);
            },
            updateWidgetWithElementBox: function(elementBox)
            {
                if(elementBox && elementBox.t !== undefined && elementBox.l !== undefined  ){
                    this.moveTo(Math.round(elementBox.t), Math.round(elementBox.l));
                }
                if(elementBox && elementBox.w !== undefined && elementBox.h !== undefined  ){
                    this.resizeTo(Math.round(elementBox.w), Math.round(elementBox.h));
                }
            },
            moveTo: function(t,l){
                //todo check that we are moving somewhere on screen
                if(this._workspaceContainerWidget.domNode){
                    domStyle.set(this._workspaceContainerWidget.domNode, "top", t+"px");
                    domStyle.set(this._workspaceContainerWidget.domNode, "left", l+"px");
                }
            },
            resizeTo: function(w,h){
                if(this._workspaceContainerWidget.domNode){
                    domStyle.set(this._workspaceContainerWidget.domNode, "width", w+"px");
                    domStyle.set(this._workspaceContainerWidget.domNode, "height", h+"px");
                }
            },
            onMoved: function(MoveEvent){
                if(this._containableCallbackOnMove !== null)
                {
                    this._containableCallbackOnMove(MoveEvent);
                }
            },
            setCallbackOnMove: function(callbackFunction)
            {
                this._containableCallbackOnMove = callbackFunction;
            },
            onResized: function(MoveEvent){
                this.updateInstanceElementBox();
            },
            updateInstanceElementBox: function(){
                let elementBox = domGeometry.getContentBox(this._workspaceContainerWidget.domNode);
             //   console.log("resized sending Box", elementBox);
                this._componentStateSet("diaplodeWorkspaceContainer", "elementBox", elementBox);
            },
            toggleShowView: function()
            {
                let domNode =this.getWorkspaceDomNode();
                if(domNode){
                    let currentStateToggle = {"block": "none", "none": "block"};
                    domStyle.set(domNode, {"display": currentStateToggle[domStyle.get(domNode, "display")]});
                }
            },
            setDocked: function(isDocked = true){
                let domNode =this.getWorkspaceDomNode();

                if( isDocked === true)
                {
                    if(domNode){
                        domStyle.set(domNode, {"opacity":  ".5"});
                    }

                    let currentState = this._containerState.get("isDocked");
                    if(currentState !== true){
                        this.setContainerState("isDocked", true);
                    }
                }
                else if( isDocked === false){
                    if(domNode){
                        domStyle.set(domNode, {"opacity":  ".5"});
                    }

                    let currentState = this._containerState.get("isDocked");
                    if(currentState !== false){
                        this.setContainerState("isDocked", false);
                    }
                }

            },
            getState: function(){
              return this._containerState;
            },
            checkCachedStyle: function()
            {
                let domNode =this.getWorkspaceDomNode();

                let displayStyle= domStyle.get(domNode, "display");
                console.log(this._cachedDisplayStyle, displayStyle);


                if(displayStyle !== "none" && displayStyle !== this._cachedDisplayStyle){
                    this._cachedDisplayStyle = displayStyle;
                }
            },
            dockContainer: function(){
                let domNode =this.getWorkspaceDomNode();
                if(domNode) {
                    this.checkCachedStyle();

                    if (domNode) {
                        domStyle.set(domNode, {"display": "none"});
                    }
                }
            },
            undockContainer: function(){
                let domNode =this.getWorkspaceDomNode();
                if(domNode) {

                    this.checkCachedStyle();
                    console.log(this._cachedDisplayStyle);
                    if (domNode) {
                        domStyle.set(domNode, {"opacity":  "1"});

                        domStyle.set(domNode, {"display": this._cachedDisplayStyle});
                    }
                }else {

                }
            },
            unloadContainer: function(){

                if(this.workspaceManagerCommands !== null
                    && this.workspaceManagerCommands.unloadContainer && typeof this.workspaceManagerCommands.unloadContainer === "function" ){

                    let domNode =this.getWorkspaceDomNode();

                    if(domNode){
                        domStyle.set(domNode, {"opacity":  ".5"});
                    }

                    this.workspaceManagerCommands.unloadContainer(this._containerKey).then(lang.hitch(this, function(Result){
                       //unloaded

                    })).catch(function(errorResult){
                        alert("sent command but could not unload container!");
                        console.log(errorResult);
                    });

                }else {
                    alert("could not unload container!");
                }
                //here we should remove container and unload contained
            },

            hide: function(){
                let domNode =this.getWorkspaceDomNode();
                if(domNode) {
                    this.checkCachedStyle();

                    if (domNode) {
                        domStyle.set(domNode, {"display": "none"});
                    }


                    let currentState = this._containerState.get("isVisible");
                    if (currentState !== false) {
                        this.setContainerState("isVisible", false);
                    }
                }
            },
            show:function(){
                let currentDockedState = this._containerState.get("isDocked");

                let domNode =this.getWorkspaceDomNode();

                if(domNode && currentDockedState === false){
                    this.checkCachedStyle();

                    if(domNode){
                        domStyle.set(domNode, {"display":  this._cachedDisplayStyle});
                    }
                    let currentState = this._containerState.get("isVisible");
                    if(currentState !== true){
                        this.setContainerState("isVisible", true);
                    }
                }

            },


            getWorkspaceDomNode: function () {
               // console.log("getting Dom Node");
                if(this._workspaceContainerWidget && this._workspaceContainerWidget.domNode)
                {
                    return this._workspaceContainerWidget.domNode;
                }
                else
                {
                    return null;
                }
            },
            isDocked: function(){
                let isDocked = this._containerState.get("isDocked");
                return isDocked;
            },
            isInActiveWorkspace: function(){
                let activeWorkspace = this.workspaceManagerCommands.getWorkspaceManagerState().get("activeWorkspace");

                if(this.workspaceManagerCommands.isContainerInWorkspace(this._containerKey, activeWorkspace)){
                    return true;
                }
                else{
                    return false;
                }
            },
            getContainable: function(){
               return this._containedInterfaceHandle;
            },

            isInOverlayWorkspace: function(){
                let overlayWorkspace = this.workspaceManagerCommands.getActiveOverlayWorkspace();

                if(overlayWorkspace.getContainer(this._containerKey)){
                    return true;
                }
                else{
                    return false;
                }
            },
            unload: function()
            {
                // workspace Manager on server should see container is removed and let client know
                //instead of receiving state here, it should be sent through the session manager
                this._workspaceContainerWidget.unload();
            }
        });
    });