//Navigator Interface Containers Menu Class

define([
        //Dojo Includes
        'dojo/_base/declare',
        "dojo/_base/lang",
        'dojo/dom-class',
        "dojo/dom-style",
        'dojo/dom-construct',
        //Balek Command Includes
        'balek-client/session/workspace/workspaceManagerInterfaceCommands',

    ],
    function (
        //Dojo Includes
        declare,
        lang,
        domClass,
        domStyle,
        domConstruct,
        balekWorkspaceManagerInterfaceCommands) {

        return declare("diaplodeNavigatorInterfaceContainersMenu", null, {
            _actions: null,

            workspaceManagerCommands: null,

            _availableContainersState: null,
            _availableContainersStateWatchHandle: null,

            _containerManagerState: null,
            _containerManagerStateWatchHandle: null,


            _workspaceManagerState: null,

            _containers: null,

            _targetNode: null,

            _navigatorMainWidget: null,

            constructor: function (args) {


                declare.safeMixin(this, args);

                this._containers = {};
                console.log("Initializing Diaplode Navigator Interface Containers Menu...");


                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();

                if (this.workspaceManagerCommands
                    && this.workspaceManagerCommands.getAvailableContainersState && typeof this.workspaceManagerCommands.getAvailableContainersState === "function"
                    && this.workspaceManagerCommands.getContainerManagerState && typeof this.workspaceManagerCommands.getContainerManagerState === "function"
                    && this.workspaceManagerCommands.getWorkspaceManagerState && typeof this.workspaceManagerCommands.getWorkspaceManagerState === "function"

                ) {
                    this._availableContainersState = this.workspaceManagerCommands.getAvailableContainersState();
                    this._containerManagerState = this.workspaceManagerCommands.getContainerManagerState();
                    this._workspaceManagerState = this.workspaceManagerCommands.getWorkspaceManagerState();
                }


            },
            onAvailableContainersStateChange: function (name, oldState, newState) {
                let containerKey = name.toString();
                if (this._containers[containerKey] === undefined) {
                    this._containers[containerKey] = newState;
                } else {
                    this._containers[containerKey] = newState;
                }

                this.refreshWidget();
            },
            onContainerManagerStateChange: function (name, oldState, newState) {
                this.refreshWidget();
            },
            onWorkspaceManagerStateChange: function (name, oldState, newState) {
                this.refreshWidget();
            },
            loadAndWatchContainers: function () {
                if (this._availableContainersState !== null && this._containerManagerState !== null) {
                    console.log("containers");

                    let availableContainersInState = Object.keys(this._availableContainersState);
                    this._availableContainersStateWatchHandle = this._availableContainersState.watch(lang.hitch(this, this.onAvailableContainersStateChange));

                    this._containerManagerStateWatchHandle = this._containerManagerState.watch(lang.hitch(this, this.onContainerManagerStateChange));
                    this._workspaceManagerStateWatchHandle = this._workspaceManagerState.watch(lang.hitch(this, this.onWorkspaceManagerStateChange));

                    for (const name in availableContainersInState) {
                        console.log("containers", name, availableContainersInState[name]);
                        this._containers[availableContainersInState[name].toString()] = this._availableContainersState.get(availableContainersInState[name].toString());
                    }
                    this.refreshWidget();
                }

            },
            toggleShowView: function(){
                let currentStateToggle = {"inline-block": "none", "none": "inline-block"};
                domStyle.set(this.domNode, {"display": currentStateToggle[domStyle.get(this.domNode, "display")]});
            },
            refreshWidget: function () {
                console.log("You should overwrite this function after extending your widget with this class");
            },
            unload: function () {
                this._availableContainersStateWatchHandle.unwatch();
                this._availableContainersStateWatchHandle.remove();
                this._containerManagerStateWatchHandle.unwatch();
                this._containerManagerStateWatchHandle.remove();
            }

        });
    });