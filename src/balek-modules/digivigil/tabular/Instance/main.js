define(['dojo/_base/declare',
        'dojo/_base/lang',

        'balek-modules/components/syncedStream/Instance',

        //Balek Instance Includes
        'balek-modules/components/syncedCommander/Instance',
    ],
    function (declare,
              lang,

              SyncedStreamInstance,
              //Balek Instance Includes
              _SyncedCommanderInstance) {
        return declare("moduleDigivigilTabularInstance", [_SyncedCommanderInstance], {

            importers: null,


            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleDigivigilScansInstance");


                this.importers = new SyncedStreamInstance({_instanceKey: this._instanceKey});
                this._interfaceState.set("importersComponentKey", this.importers._componentKey);

                this._commands={
                    "echo": lang.hitch(this, this.echo)
                };

                this.setInterfaceCommands();

                this._interfaceState.set("Component Name","Tab Importer");
                //creates component Key that can be used to connect to state
                this.prepareSyncedState();

                this._interfaceState.set("Status", "Ready");





            },
            echo: function( input){
                  console.log("echo", input);
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