define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/components/syncedCommander/Instance',
    ],
    function (declare,
              lang,
              _SyncedCommanderInstance) {
        return declare("moduleUserGuideMainInstance", [_SyncedCommanderInstance], {
            constructor: function (args) {
                declare.safeMixin(this, args);
                this._interfaceState.set("Component Name","User Guide Containable");
                console.log("starting moduleUserGuideMainInstance");
                this.prepareSyncedState();
                this._interfaceState.set("Status", "Ready")
            },
            //##########################################################################################################
            //Base Instance Override Function
            //##########################################################################################################
            _end: function(){
                //calls inherited _end functions like stateSynced Object
                this.inherited(arguments);
            }
        });
    });