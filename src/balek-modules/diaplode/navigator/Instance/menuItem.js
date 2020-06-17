define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Instance',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',
    ],
    function (declare, lang,  baseInstance, stateSynced, remoteCommander) {
        return declare("moduleDiaplodeNavigatorRadialMenuItemInstance", [baseInstance,stateSynced, remoteCommander], {

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleDiaplodeNavigatorRadialMenuInstance");

                this._commands={
                    "changeName" : lang.hitch(this, this.changeName),
                    "changeActiveStatus" : lang.hitch(this, this.changeActiveStatus)
                };

                this.prepareSyncedState();
                this.setInterfaceCommands();
                this._interfaceState.set("name",this._menuItemName);
            },
            changeName: function(name, remoteCommandCallback)
            {
                this._interfaceState.set("name", name);
                remoteCommandCallback({success: "Name Set"});
            },
            changeActiveStatus: function(status, remoteCommandCallback){
                this._interfaceState.set("activeStatus", status);
                remoteCommandCallback({success: "Active Status Set"});
            },
            _end: function(){
                this.inherited(arguments);
            }
        });
    });