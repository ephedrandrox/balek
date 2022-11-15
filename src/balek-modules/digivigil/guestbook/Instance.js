define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        //Guestbook Instance sub modules
        'balek-modules/digivigil/guestbook/Instance/main',
        //Balek Components
        'balek-modules/components/syncedCommander/Instance',
        'balek-modules/components/syncedMap/Instance',],
    function (declare, lang, topic,
              MainInstance,
              _SyncedCommanderInstance, SyncedMapInstance) {

        return declare("moduleDigivigilGuestbookInstance", _SyncedCommanderInstance, {
            _instanceKey: null,

            _module: null,
            _moduleController: null,
            availableEntries: null,             //SyncedMapInstance

            controllerEntries: null,            //Controller Entries State
            controllerEntriesWatchHandle: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDigivigilGuestbookInstance starting...");

                //set setRemoteCommander commands
                this._commands={
                    "addEntry" : lang.hitch(this, this.addEntry)
                };

                this.availableEntries = new SyncedMapInstance({_instanceKey: this._instanceKey});

                this._interfaceState.set("availableEntriesComponentKey", this.availableEntries._componentKey);
                this._interfaceState.set("Component Name","Digivigil Guestbook");
                this._interfaceState.set("Status", "Starting");
                //creates component Key that can be used to connect to state
                this.setInterfaceCommands();
                this.prepareSyncedState();

                //Create the main Instance
                this.mainInstance = new MainInstance({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey, _userKey: this._userKey,
                    _Controller: this});
                //Set Main Instance keys for interface
                this._interfaceState.set("mainInstanceKeys", {instanceKey: this.mainInstance._instanceKey,
                     sessionKey: this.mainInstance._sessionKey,
                     componentKey: this.mainInstance._componentKey});

                //Get Controller Entries State
                let Entries = this._moduleController.getEntries()
                //Add all Controller Entries to our Available Entries
                for (const key in Entries) {
                    let value = Entries[key]
                    if(typeof value !== 'function' && value._id && value._id.toString() == key){
                        console.log("adding Entries from controller entries State", key, value)
                        this.availableEntries.add(key, value );
                    }
                }
                //set and watch the Controller Entries State
                this.controllerEntries = Entries
                this.controllerEntriesWatchHandle = Entries.watch(lang.hitch(this, this.onControllerEntriesStateChange))
                this._interfaceState.set("Status", "Ready");

            },
            onControllerEntriesStateChange: function (name, oldState, newState) {
                //When a new entry becomes available, add it to our Available State
                this.availableEntries.add(name, newState );
            },
            addEntry: function(Entry, resultCallback){
                this._moduleController.addEntry(Entry).then(lang.hitch(this, function(Result){
                    resultCallback({SUCCESS: Result})
                })).catch(lang.hitch(this, function(Error){
                    resultCallback({Error: Error})
                }))
            },
            //##########################################################################################################
            //Base Instance Override Function
            //##########################################################################################################
            _end: function () {
                //calls inherited _end functions like stateSynced Object
                this.inherited(arguments);
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    console.log("destroying Guestbook Module Interface ");
                    this.controllerEntriesWatchHandle.unwatch()
                    Resolve({success: "Unloaded Instance"});
                }));
            }
        });
    }
);


