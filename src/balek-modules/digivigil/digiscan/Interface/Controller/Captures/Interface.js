define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/Stateful',
        'balek-modules/components/syncedMap/Interface',


    ],
    function (declare, lang,
              Stateful, SyncedMapInterface) {
        return declare("digivigilDigiscanCapturesInterfaceController", null, {
            _interface: null,              //Module instance
            captures: null,

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

                    this.captures[captureID].set("created", "")
                    this.captures[captureID].set("barcode", "")
                    this.captures[captureID].set("recognizedText", "")
                    this.captures[captureID].set("note", "")

                    //get the syncedmap Keys from the instance
                    this._interface.getCaptureSyncedMap(captureID,  lang.hitch(this, function(syncedMapKeys){
                        //create a syncedMap Interface and store it by CaptureID
                        this.captureSyncedMaps[captureID] = new SyncedMapInterface({_instanceKey: syncedMapKeys.instanceKey.toString(),
                            _componentKey: syncedMapKeys.componentKey.toString()});
                        //set state watcher to update local capture state object
                        this.captureSyncedMapWatchHandles[captureID] = this.captureSyncedMaps[captureID].setStateWatcher(lang.hitch(this, function(name, oldValue, newValue)
                        {
                            this.captures[captureID].set(name, newValue)

                            let id  = this.captures[captureID].get("id");
                            let imageInfo  = this.captures[captureID].get("imageInfo");

                            if(id && imageInfo)
                            {


                                console.log("imageInfo👹👹", newValue)
                                this._interface.getCaptureImagePreview(id, lang.hitch(this,function(imageFetchResult){
                                    console.log("image👹👹", imageFetchResult)
                                    if(imageFetchResult && imageFetchResult.SUCCESS){
                                        let CaptureImage = imageFetchResult.SUCCESS
                                        if(CaptureImage.preview ){
                                            let dataBase64String = CaptureImage.preview

                                            //todo check this against the hash, public key and proof
                                            this.captures[captureID].set("image", dataBase64String)

                                        }
                                    }
                                }))
                            }
                        }))

                    }))

                }
                return  this.captures[captureID]
            }
        });
    }
);
