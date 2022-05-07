define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",

        'balek-modules/components/syncedCommander/Interface',

        'balek-modules/admin/users/Interface/userManagement',

        'balek-client/session/workspace/workspaceManagerInterfaceCommands',

    ],
    function (declare, lang,  topic, domConstruct, domStyle, win, syncedCommanderInterface, userManagement, balekWorkspaceManagerInterfaceCommands) {

        return declare("moduleAdminUsersInterface", syncedCommanderInterface, {
            _instanceKey: null,
            _userManagementInterface: null,

            _userState: null,
            _userStateWatchHandle: null,

            workspaceManagerCommands: null,


            constructor: function (args) {

                declare.safeMixin(this, args);

                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();


            },

            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to inherited() so remoteCommander works
                this.inherited(arguments);

               // console.log("users",  name, oldState, newState);

                if(name.toString() === "userManagementInstanceKeys"){
                    this.loadUserManagementInterface(newState);
                }
            },
            loadUserManagementInterface: function(instanceKeys){
                this._userManagementInterface = new userManagement({
                    _instanceKey: instanceKeys.instanceKey,
                    _componentKey: instanceKeys.componentKey,
                    _userData: null
                });

// admin/users

                // console.log("users",  this._userManagementInterface);

                this._userManagementInterface.getContainerKeys().then(lang.hitch(this, function(containerKeys) {
                    //this waits until the containable has component state for container Keys
                    //               console.log(containerKeys, typeof containerKeys );
                    if (Array.isArray(containerKeys) && containerKeys.length === 0) {
                        //the containable has not been added to a container
                        //adding it to the workspace puts it in a
                       // console.log("users", containerKeys);

                        let workspaceContainerWidgetPath = "balek-client/session/workspace/container/widgets/movable/movableContainerWidget";
                        let activeWorkspaceKey = this.workspaceManagerCommands.getActiveWorkspace().getWorkspaceKey();

                        this.workspaceManagerCommands.addToWorkspaceContainer(this._userManagementInterface, workspaceContainerWidgetPath)
                            .then(lang.hitch(this, function (workspaceContainerKey) {
                                //console.log("users", "gotWorkspaceContainerKey", workspaceContainerKey);
                                this.workspaceManagerCommands.addContainerToWorkspace(workspaceContainerKey, activeWorkspaceKey)
                                    .then(lang.hitch(this, function (addContainerToWorkspaceResponse) {
                                        console.log("Container added to workspace", addContainerToWorkspaceResponse);
                                    }))
                                    .catch(lang.hitch(this, function (error) {
                                        console.log( "Error adding container to workspace", error);
                                    }));
                            })).catch(lang.hitch(this, function (error) {
                           // console.log("users", "workspaces container error", error);
                        }));

                    } else {
                        //component containable is already in a container
                        console.log("already in a container", containerKeys);
                    }
                })).catch(lang.hitch(this, function (error) {
                    console.log( "getting container keys error", error);
                }));
                topic.publish("getUserState", lang.hitch(this, function (userState) {
                    //topic.publish("addToCurrentWorkspace", this);
                    this._userState = userState;
                    this.userStateChange();
                    this._userStateWatchHandle = this._userState.watch("userData", lang.hitch(this, this.userStateChange));
                }));
            },

            getWorkspaceDomNode: function () {
                return this._userManagementInterface.domNode;
            },
            userStateChange: function (name, oldState, newState) {
                if (name === "userData") {
                    this.updateUserData();
                }
            },
            receiveMessage: function (moduleMessage) {

                console.log("Shouldn't be seeing this", moduleMessage);

            },
            updateUserData: function () {
                let userData = this._userState.get("userData");

                if (userData !== null) {
                    this._userManagementInterface.updateUserData(userData);
                }
            },
            toggleShowView: function () {
                let currentStateToggle = {"visible": "hidden", "hidden": "visible"};
                domStyle.set(this._userManagementInterface.domNode, {"visibility": currentStateToggle[domStyle.get(this._userManagementInterface.domNode, "visibility")]});
            },
            unload: function () {
                this._userStateWatchHandle.unwatch();
                this._userStateWatchHandle.remove();
            }
        });
    }
);



