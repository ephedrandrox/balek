define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'dojo/dom-construct',
        'dojo/dom-style',
        'dojo/dom-class',
        'balek/session/workspace/workspace'],
    function (declare, lang, topic, Stateful, domConstruct, domStyle, domClass, balekWorkspaceManagerWorkspace) {


        return declare("balekClientWorkspaceManagerWorkspace", balekWorkspaceManagerWorkspace, {

            domNode: null,
            _workspaceName: "",

            containerManager: null,

            _workspaceState: null,
            _workspaceStateWatchHandle: null,


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
                domStyle.set(this.domNode, {"z-index": 2});

                this.connectToWorkspaceInstanceState();


            },
            getContainers: function(){
                return this._workspaceContainers;
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
               // console.log(stateChangeUpdate);
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
                        for (const name in containersState)
                        {
                            //console.log("containerState", name, containersState[name]);
                            this._workspaceContainersState.set(name, containersState[name]);
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
                for(const containerKey in workspaceContainers)
                {
                    this.activateContainer(containerKey);
                }
            },
            activateContainer: function(containerKey)
            {
                let workspaceContainers = this._workspaceContainers;

                if(workspaceContainers[containerKey]){
                    let workspaceContainerDomNode =  workspaceContainers[containerKey].getWorkspaceDomNode();
                    domConstruct.place(workspaceContainerDomNode, this.domNode);
                }else {
                    console.log("Invalid Container Key!", workspaceContainers,containerKey )
                }

            },
            onWorkspaceStateUpdate: function (name, oldState, newState) {
                console.log(name, oldState, newState);
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

                if(this._workspaceContainers[String(name)] === undefined)
                {
                    this._workspaceContainers[String(name)] = this.containerManager.getContainer(String(name));

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