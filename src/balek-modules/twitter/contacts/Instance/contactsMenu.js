define(['dojo/_base/declare',
        'dojo/_base/lang',
        //Balek Instance Includes
        'balek-modules/components/syncedCommander/Instance',
    ],
    function (declare,
              lang,
              //Balek Instance Includes
              _syncedCommanderInstance) {
        return declare("moduleTwitterContactsInstanceContactsMenu", [_syncedCommanderInstance], {
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleTwitterContactsInstanceContactsMenu");

                //set setRemoteCommander commands
                this._commands={
                    "dockMenuInterface" : lang.hitch(this, this.dockMenuInterface),
                    "undockMenuInterface" : lang.hitch(this, this.undockMenuInterface)
                };
                this.setInterfaceCommands();

                this._interfaceState.set("Component Name","contactMenu");
                //creates component Key that can be used to connect to state
                this.prepareSyncedState();
                this._interfaceState.set("Status", "Ready");
            },
            dockMenuInterface: function()
            {
                this._interfaceState.set("menuDocked", "true");
            },
            undockMenuInterface: function()
            {
                this._interfaceState.set("menuDocked", "false");
            },
            _end: function(){
                //calls inherited _end functions like stateSynced Object
                this.inherited(arguments);
            }
        });
    });