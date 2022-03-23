define(['dojo/_base/declare',
        'dojo/_base/lang',

        'balek-client/session/workspace/workspaceManagerInterfaceCommands',

        'balek-modules/components/syncedCommander/Interface'
    ],
    function (declare, lang, balekWorkspaceManagerInterfaceCommands, syncedCommanderInterface) {
        return declare("moduleDiaplodeConversationsInterface", syncedCommanderInterface, {
            _instanceKey: null,

            workspaceManagerCommands: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();

            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to inherited() so remoteCommander works
                this.inherited(arguments);

                if (name.toString() === "moduleName") {
                    alert(newState)
                    //This is where we are working from
                    //Make interface, resources, and test commands next
                }
            },
            unload: function () {
                this.inherited(arguments);
            }
        });
    }
);



