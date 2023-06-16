define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/digivigil/tabular/Instance/main',
        'balek-modules/components/syncedMap/Instance',

        'balek-modules/components/syncedCommander/Instance'
    ],
    function (declare, lang, topic, ImporterInstance, SyncedMapInstance, _SyncedCommanderInstance) {

        return declare("moduleDigivigilWWWSaleTagScanInstance", _SyncedCommanderInstance, {
            _instanceKey: null,
            importerInstancesSyncedMap: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                console.log("moduleDigivigilTabularInstance starting...");

                this.importerInstancesSyncedMap = new SyncedMapInstance({_instanceKey: this._instanceKey});
                //todo remove synced map from tab importer but add to dataTables
                this._interfaceState.set("importerInstancesSyncedMapComponentKey", this.importerInstancesSyncedMap._componentKey);
             /*  this.mainInstance = new MainInstance({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey, _userKey: this._userKey});

                this._interfaceState.set("mainInstanceKeys", {instanceKey: this.mainInstance._instanceKey,
                    sessionKey: this.mainInstance._sessionKey,
                    userKey: this.mainInstance._userKey,
                    componentKey: this.mainInstance._componentKey});
*/

                //set setRemoteCommander commands
                this._commands={
                    "newImporter": lang.hitch(this, this.newImporter)
                };
                this.setInterfaceCommands();
                this._interfaceState.set("Component Name","Tab Importer");
                //creates component Key that can be used to connect to state
                this.prepareSyncedState();

                this._interfaceState.set("Status", "Ready");

            },
            newImporter: function( returnCallback){
                //console.log("newImporter", input);
                let newImporter = new ImporterInstance({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey, _userKey: this._userKey});
                this.importerInstancesSyncedMap.add(newImporter._componentKey,  {instanceKey: newImporter._instanceKey,
                    sessionKey: newImporter._sessionKey,
                    userKey: newImporter._userKey,
                    componentKey: newImporter._componentKey})
                returnCallback({message: "success"});

            },
            _end: function () {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    console.log("destroying tabular Module Interface ");
                    Resolve({success: "Unloaded Instance"});
                }));
            }
        });
    }
);


