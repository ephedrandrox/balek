define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/Stateful',
        'balek-modules/components/syncedMap/Interface',


    ],
    function (declare, lang,
              Stateful, SyncedMapInterface) {
        return declare("digivigilDigiscanCapturesInterfaceController", null, {
            _interface: null,              //Module instance
            captures: null,              //Dojo State Object

            captureSyncedMaps: null,

            captureSyncedMapWatchHandles: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                //mixin and declare state Object

                this.captures = {}

                this.captureSyncedMaps = {}
                this.captureSyncedMapWatchHandles = {}
                if (this._interface === null) {
                    console.log("Scaptura Captures Interface Controller Cannot Start!...");
                } else {
                    console.log("Scaptura Captures Interface Controller Started!...");
                }
            },
            getCaptureByID: function(captureID) {
                if(!this.captures[captureID]){
                    let CapturesState = declare([Stateful], {});
                    this.captures[captureID] = new CapturesState({})

                    this.captures[captureID].set("created", "bogocer")
                    this.captures[captureID].set("barcode", "bogo123")
                    this.captures[captureID].set("recognizedText", "bogorec")
                    this.captures[captureID].set("note", "bogonote")

                    //get the syncedmap Keys from the instance
                    this._interface.getCaptureSyncedMap(captureID,  lang.hitch(this, function(syncedMapKeys){
                        //create a syncedMap Interface and store it by CaptureID
                        this.captureSyncedMaps[captureID] = new SyncedMapInterface({_instanceKey: syncedMapKeys.instanceKey.toString(),
                            _componentKey: syncedMapKeys.componentKey.toString()});
                        //set state watcher to update local capture state object
                        this.captureSyncedMapWatchHandles[captureID] = this.captureSyncedMaps[captureID].setStateWatcher(lang.hitch(this, function(name, oldValue, newValue)
                        {
                            this.captures[captureID].set(name, newValue)
                        }))

                    }))

                }
                return  this.captures[captureID]
            }
        });
    }
);
