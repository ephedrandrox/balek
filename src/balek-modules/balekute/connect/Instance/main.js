define(['dojo/_base/declare',
        'dojo/_base/lang',

        //Balek Instance Includes
        'balek-modules/components/syncedCommander/Instance',
    ],
    function (declare,
              lang,

              //Balek Instance Includes
              _SyncedCommanderInstance) {
        return declare("moduleBalekuteConnectMainInstance", [_SyncedCommanderInstance], {

            scanEntries: null,


            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleBalekuteConnectMainInstance");



                //set setRemoteCommander commands
                this._commands={

                };
                this.setInterfaceCommands();

                this._interfaceState.set("Component Name","Connect Main");
                //creates component Key that can be used to connect to state
                this.prepareSyncedState();

                this._interfaceState.set("Status", "Ready");


            },
            //##########################################################################################################
            //Instance Override Functions Section
            //##########################################################################################################
            _end: function(){
                //calls inherited _end functions like stateSynced Object
                this.inherited(arguments);
            }
        });
    });