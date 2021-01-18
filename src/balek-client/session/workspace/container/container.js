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
                    console.log(reply)
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
                        this._workspaceContainerWidget = "Creating Widget";

                        require(["dojo/ready", containerWidgetPath], lang.hitch(this, function(ready, containerWidget){
                            ready(lang.hitch(this, function(){


                               this._workspaceContainerWidget = new containerWidget({_sessionKey: this._sessionKey,
                                   _containerKey: this._containerKey,
                                   _containedInterfaceHandle:this._containedInterfaceHandle,
                                  _containerState: this._containerState,
                                   setContainerState: lang.hitch(this, this.setContainerState),
                                   workspaceManagerCommands: this.workspaceManagerCommands

                               });

                               let activeWorkspace = this.workspaceManagerCommands.getActiveWorkspace();

                               let activeWorkspaceContainers =  this.workspaceManagerCommands.getWorkspaceContainers(activeWorkspace.getWorkspaceKey());

                               if(activeWorkspaceContainers !== null && activeWorkspaceContainers[this._containerKey]){
                                   activeWorkspace.activateContainer(this._containerKey);
                               }
                             else
                               {
                                   console.log("no!",this._containerKey, activeWorkspaceContainers );

                               }
                               //todo check if container is in any workspace
                            }));
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
              //  console.log(containerState);
                if(containerState.instanceKey){
                    this._interfaceKeys.instanceKey = containerState.instanceKey;
                    this.onInterfaceKeyUpdate();
                }
                if(containerState.componentKey){
                    this._interfaceKeys.componentKey = containerState.componentKey;
                    this.onInterfaceKeyUpdate();
                }
                if(containerState.containerWidgetPath){
                   this._containerState.set("containerWidgetPath", containerState.containerWidgetPath);
                }
                if(containerState.movableContainerElementBox){
                    this._containerState.set("movableContainerElementBox", containerState.movableContainerElementBox);
                }

            },
            onWorkspaceContainerInterfaceStateUpdate: function(name, oldState, newState)
            {
               // console.log("Container State Updated! If we get Ready Status we ");

               // console.log(name, oldState, newState);
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
                //if instance and component Keyare up then get interface we can load our widget?


            },
            updateWidgetWorkspaceInfo: function(workspaceInfo){
                console.log("workspace Info", workspaceInfo);
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
                /*       makeWorkspaceContainer: function(){
                           console.log("Making Workspace Container");



                           require([ 'balek-client/session/workspace/ui/containers/movable/movableContainerWidget'],
                               lang.hitch(this, function (workspaceContainerWidget) {
                                   this._workspaceContainerWidget = new workspaceContainerWidget({
                                       _instanceKey: this._instanceKey,
                                       _componentKey: this._componentKey,
                                       _contentNodeToContain: this.domNode,
                                       _workspaceContainer: this,
                                       _onMoveStop:lang.hitch(this, this.onMoved),
                                       _onResizeStop:lang.hitch(this, this.onResized)});



                                   if(this._diaplodeWorkspaceContainerState){
                                       let movableState =  this._diaplodeWorkspaceContainerState.get("elementBox");
                                       this.updateWidgetWithElementBox(movableState);
                                   }

                            }));



            },*/
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
                this.updateInstanceElementBox();
            },
            onResized: function(MoveEvent){
                this.updateInstanceElementBox();
            },
            updateInstanceElementBox: function(){
                let elementBox = domGeometry.getContentBox(this._workspaceContainerWidget.domNode);
                console.log("resized sending Box", elementBox);
                this._componentStateSet("diaplodeWorkspaceContainer", "elementBox", elementBox);
            },

            getWorkspaceDomNode: function () {
                console.log("getting Dom Node");
                if(this._workspaceContainerWidget && this._workspaceContainerWidget.domNode)
                {
                    return this._workspaceContainerWidget.domNode;
                }
                else
                {
                    return null;
                }
            },
        });
    });