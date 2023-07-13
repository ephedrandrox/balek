define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/Stateful',
        'balek-modules/components/syncedMap/Interface',


    ],
    function (declare, lang,
              Stateful, SyncedMapInterface) {
        return declare("digivigilDigiscanCaptureSetssInterfaceController", null, {
            _interface: null,              //Module instance

            //Class Storage Variables
            captureSets: null,
            captureSetSyncedMaps: null,
            captureSetSyncedMapWatchHandles: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                //mixin and declare state Object
                //Set up storage objects
                this.captureSets = {}
                this.captureSetSyncedMaps = {}
                this.captureSetSyncedMapWatchHandles = {}

                if (this._interface === null) {
                    console.log("Scaptura Captures Sets Interface Controller Cannot Start!...");
                } else {
                    console.log("Scaptura Captures Sets Interface Controller Started!...");
                }
            },
            getCaptureSetByID: function(captureSetID) {
                if(typeof captureSetID === "string"
                    && captureSetID !== ""
                    && !this.captureSets[captureSetID]){
                    let CaptureSetState = declare([Stateful], {});
                    this.captureSets[captureSetID] = new CaptureSetState({})


                    //get the syncedmap Keys from the instance
                    this._interface.getCaptureSetSyncedMap(captureSetID,  lang.hitch(this, function(syncedMapKeys){
                        //create a syncedMap Interface and store it by CaptureID
                        this.captureSetSyncedMaps[captureSetID] = new SyncedMapInterface({_instanceKey: syncedMapKeys.instanceKey.toString(),
                            _componentKey: syncedMapKeys.componentKey.toString()});
                        //set state watcher to update local capture state object
                        this.captureSetSyncedMapWatchHandles[captureSetID] = this.captureSetSyncedMaps[captureSetID].setStateWatcher(lang.hitch(this, function(name, oldValue, newValue)
                        {
                            this.captureSets[captureSetID].set(name, newValue)
                        }))

                    }))

                }
                return  this.captureSets[captureSetID]
            }
        });
    }
);
