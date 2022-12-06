define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",

        'balek-modules/components/syncedCommander/Interface',

        "balek-client/users/usersController/interfaceCommands",


        'balek-modules/admin/users/Interface/userManagement',

        'balek-client/session/workspace/workspaceManagerInterfaceCommands',

    ],
    function (declare, lang,  topic, domConstruct, domStyle, win,
              syncedCommanderInterface,
              UsersControllerInterfaceCommands,
              userManagement, balekWorkspaceManagerInterfaceCommands) {

        return declare("moduleAdminUsersInterface", syncedCommanderInterface, {
            _instanceKey: null,
            _userManagementInterface: null,

            _userState: null,
            _userStateWatchHandle: null,

            workspaceManagerCommands: null,

            usersControllerCommands: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();


                let usersControllerInterfaceCommands = new UsersControllerInterfaceCommands();
                this.usersControllerCommands = usersControllerInterfaceCommands.getCommands();




            },

            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to inherited() so remoteCommander works
                this.inherited(arguments);

               // console.log("users",  name, oldState, newState);

                if(name.toString() === "userManagementInstanceKeys"){
                    this.loadUserManagementInterface(newState);
                }
            },
            putInWorkspace: function(containableInterface){
            //todo add to workspace commands
                containableInterface.getContainerKeys().then(lang.hitch(this, function(containerKeys) {
                    //this waits until the containable has component state for container Keys
                    //               console.log(containerKeys, typeof containerKeys );
                    if (Array.isArray(containerKeys) && containerKeys.length === 0) {
                        //the containable has not been added to a container
                        //adding it to the workspace puts it in a
                        let workspaceContainerWidgetPath = "balek-client/session/workspace/container/widgets/movable/movableContainerWidget";
                        let activeWorkspaceKey = this.workspaceManagerCommands.getActiveWorkspace().getWorkspaceKey();
                        this.workspaceManagerCommands.addToWorkspaceContainer(containableInterface, workspaceContainerWidgetPath)
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
            },
            loadUserManagementInterface: function(instanceKeys){
                this._userManagementInterface = new userManagement({
                    _interface: this,
                    _instanceKey: instanceKeys.instanceKey,
                    _componentKey: instanceKeys.componentKey,
                    usersControllerCommands: this.usersControllerCommands,
                    _userData: null
                });

                this.putInWorkspace(this._userManagementInterface)
            },
            unload: function () {

            }
        });
    }
);



