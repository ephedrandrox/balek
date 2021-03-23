define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'dojo/dom',
        'dojo/dom-construct',
        'dojo/dom-style',
        'dojo/dom-class',
        'balek/session/workspace/workspace'],
    function (declare, lang, topic, Stateful, dom, domConstruct, domStyle, domClass, balekWorkspaceManagerWorkspace) {


        return declare("balekClientWorkspaceManagerWorkspace", balekWorkspaceManagerWorkspace, {

            domNode: null,
            _workspaceName: "",

            containerManager: null,

            _workspaceState: null,
            _workspaceStateWatchHandle: null,


            _activeContainerKey: null,

            _workspaceContainers: null,
            _workspaceContainersState: null,
            _workspaceContainersStateWatchHandle: null,

            constructor: function (args) {
                //todo audit/comment this file

                declare.safeMixin(this, args);

                this._workspaceContainers = {};

                let workspaceState = declare([Stateful], {
                    instances: null,
                    activeInterface: null

                });
                this._workspaceState = new workspaceState({
                    instances: {}
                });
                this._workspaceStateWatchHandle = this._workspaceState.watch(lang.hitch(this, this.onWorkspaceStateUpdate));


                let workspaceContainersState = declare([Stateful], {
                });
                this._workspaceContainersState = new workspaceContainersState({

                });
                this._workspaceContainersStateWatchHandle = this._workspaceContainersState.watch(lang.hitch(this, this.onWorkspaceContainersStateUpdate));


                this.domNode = domConstruct.create("div", {id: this._workspaceKey});

                domClass.add(this.domNode, "balekWorkspaceNode");
                domStyle.set(this.domNode, {"z-index": 2, "pointer-events:": "none"});

                this.connectToWorkspaceInstanceState();


            },
            getContainers: function(){
                return this._workspaceContainers;
            },
            getContainer: function(containerKey){
                return this._workspaceContainers[containerKey];
            },
            connectToWorkspaceInstanceState: function () {
                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    workspaceMessage: {
                        sessionKey: this._sessionKey,
                        messageData: {
                            connectWorkspaceInterface: {
                                workspaceKey: this._workspaceKey,
                            }
                        }
                    }
                }, lang.hitch(this, this.onWorkspaceInstanceStateChange));
            },

            onWorkspaceInstanceStateChange: function(stateChangeUpdate){
              //  console.log(stateChangeUpdate);
                if(stateChangeUpdate.error)
                {
                    console.log("Workspace State connect error", stateChangeUpdate );
                }

                if(stateChangeUpdate.workspaceState)
                {
                    try{
                        let workspaceState = JSON.parse(stateChangeUpdate.workspaceState);
                        for (const name in workspaceState)
                        {
                            this._workspaceState.set(name, workspaceState[name]);
                        }
                    }catch(error){
                        console.log(error);
                    }
                }

                if(stateChangeUpdate.containersState)
                {
                    try{
                        let containersState = JSON.parse(stateChangeUpdate.containersState);
                        console.log("workspaceUpdate", containersState, this );

                        for (const name in containersState)
                        {
                            //console.log("containerState", name, containersState[name]);
                            if(containersState[name] === "undefined")
                            {
                                this._workspaceContainersState.set(name, undefined);

                            }else {
                                this._workspaceContainersState.set(name, containersState[name]);
                            }
                        }
                    }catch(error){
                        console.log(error);
                    }
                }
            },
            getDomNode: function () {
                return this.domNode;
            },
            getWorkspaceState: function(){
                return this._workspaceState;
            },
            getWorkspaceKey: function(){
                return this._workspaceKey;
            },
                /* addToWorkspaceStore: function (instanceKey, componentKey) {
               /*
                     if(componentKey){
                         topic.publish("getInterfaceFromInstanceKey", instanceKey, lang.hitch(this, function (interfaceObject) {
                             let instancesObject = this._workspaceState.get("instances");
                             instancesObject[componentKey] = {interfaceObject: interfaceObject.getComponentInterface(componentKey)};
                             this._workspaceState.set("instances", instancesObject);
                         }));
                     }else {
                         topic.publish("getInterfaceFromInstanceKey", instanceKey, lang.hitch(this, function (interfaceObject) {
                             let instancesObject = this._workspaceState.get("instances");
                             instancesObject[instanceKey] = {interfaceObject: interfaceObject};
                             this._workspaceState.set("instances", instancesObject);

                         }));
                     }

            },*/
            onActivated: function()
            {
                let workspaceContainers = this._workspaceContainers;

                this._activeContainerKey = null;
                console.log("workspaceUpdate", workspaceContainers );

                for(const containerKey in workspaceContainers)
                {
                    console.log("workspaceUpdate", containerKey );

                    this.activateContainer(containerKey);
                }
            },
            activateContainer: function(containerKey)
            {
                let workspaceContainers = this._workspaceContainers;

                console.log("workspaceUpdate", containerKey, workspaceContainers, this );

                if(workspaceContainers[containerKey]){
                    let workspaceContainerDomNode =  workspaceContainers[containerKey].getWorkspaceDomNode();
                    if(workspaceContainerDomNode !== null) {
                        if (dom.isDescendant(workspaceContainerDomNode, this.domNode)) {
                            if (this._activeContainerKey !== containerKey) {
                                this.placeAndRefreshContainer(containerKey);
                            } else {
                                //Workspace Container already placed and active
                            }
                        } else {
                            this.placeAndRefreshContainer(containerKey);
                        }
                    }else {
                        console.log("Container Key Exists but no DOMNode", "Should Not See This!", workspaceContainers,containerKey );
                        alert("Container not removed from server workspace, fix this!");
                    }

                }else {
                    console.log("Invalid Container Key or already active!", workspaceContainers,containerKey );
                }

            },
            placeAndRefreshContainer: function(containerKey){
                let workspaceContainers = this._workspaceContainers;

                if(workspaceContainers[containerKey] && workspaceContainers[containerKey].getWorkspaceDomNode) {

                    let workspaceContainerDomNode =  workspaceContainers[containerKey].getWorkspaceDomNode();
                    console.log("workspaceUpdate", workspaceContainers[containerKey], workspaceContainerDomNode );

                    domConstruct.place(workspaceContainerDomNode, this.domNode);
                    this._activeContainerKey = containerKey;
                    workspaceContainers[containerKey].startup();
                }

            },
            removeContainer: function(containerKey){

                let workspaceContainers = this._workspaceContainers;
                let containerToRemove = workspaceContainers[containerKey];
                if(containerToRemove !== undefined)
                {
                    let workspaceContainerDomNode =  containerToRemove.getWorkspaceDomNode();

                    if(this._workspaceContainers[containerKey] != undefined && workspaceContainerDomNode){
                       workspaceContainerDomNode.remove();

                        this._workspaceContainers[containerKey] = undefined;
                        delete this._workspaceContainers[containerKey];
                    }
                }

            },
            onWorkspaceStateUpdate: function (name, oldState, newState) {
               // console.log(name, oldState, newState);
/*
                if(name === "instances"){
                   for (instanceKey in newState) {
                       console.log(instanceKey);
                       let domNode = newState[instanceKey].interfaceObject.getWorkspaceDomNode();
                        domConstruct.place(domNode, this.domNode);
                   }
                }
                if(name === "containers"){
                    for (instanceKey in newState) {
                        console.log(instanceKey);
                        let domNode = newState[instanceKey].interfaceObject.getWorkspaceDomNode();
                        domConstruct.place(domNode, this.domNode);
                    }
                }
                */

            },
            onWorkspaceContainersStateUpdate: function (name, oldState, newState) {
                console.log(name, oldState, newState);

                if(newState === undefined){
                  this.removeContainer(String(name));
                } else if(this._workspaceContainers[String(name)] === undefined )
                {
                    this._workspaceContainers[String(name)] = this.containerManager.getContainer(String(name));
                    console.log("workspaceUpdate", name, this._workspaceContainers );
                }

            },
            unload: function () {
                this._workspaceStateWatchHandle.unwatch();
                this._workspaceContainersStateWatchHandle.unwatch();

                //todo maybe we should delete this._workspaceContainers
                delete this._workspaceState;
            }
        });
    });