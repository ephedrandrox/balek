define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/components/syncedCommander/Instance',
    ],
    function (declare,
              lang,
              _SyncedCommanderInstance) {
        return declare("moduleUserInfoMainInstance", [_SyncedCommanderInstance], {

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleUserInfoMainInstance");
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