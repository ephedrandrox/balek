define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'dojo/dom-construct',
        'dojo/dom-style',
        'dojo/dom-class',
        'balek/session/workspace/workspace',

    ],
    function (declare, lang, topic, Stateful, domConstruct, domStyle, domClass, balekWorkspaceManagerWorkspace) {


        return declare("balekClientWorkspaceManagerWorkspace", balekWorkspaceManagerWorkspace, {

            domNode: null,
            _workspaceName: "",

            constructor: function (args) {
                declare.safeMixin(this, args);

                let workspaceState = declare([Stateful], {
                    instances: null,
                    activeInterface: null

                });
                this._workspaceState = new workspaceState({
                    instances: {}
                });

                this.domNode = domConstruct.create("div", {id: this._workspaceKey});

                domClass.add(this.domNode, "balekWorkspaceNode");
                domStyle.set(this.domNode, {"z-index": 2});
                this._workspaceStateWatchHandle = this._workspaceState.watch(lang.hitch(this, this.onWorkspaceInterfacesStateUpdate));

            },
            getDomNode: function () {
                return this.domNode;
            },
            addToWorkspaceStore: function (instanceKey) {
                topic.publish("getInterfaceFromInstanceKey", instanceKey, lang.hitch(this, function (interfaceObject) {

                    let instancesObject = this._workspaceState.get("instances");
                    instancesObject[instanceKey] = {interfaceObject: interfaceObject};
                    this._workspaceState.set("instances", instancesObject);

                }));
            },
            onWorkspaceInterfacesStateUpdate: function (name, oldState, newState) {
                for (instanceKey in newState) {
                    let domNode = newState[instanceKey].interfaceObject.getWorkspaceDomNode();
                    domConstruct.place(domNode, this.domNode);
                }
            },
            unload: function () {
                this._workspaceStateWatchHandle.unwatch();
                delete this._workspaceState;
            }
        });
    });