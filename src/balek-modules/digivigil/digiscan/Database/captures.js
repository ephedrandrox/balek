define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/digivigil/Database',
    ],
    function (declare, lang, topic,  digivigilDatabaseController) {
        return declare("moduleDigivigilScapturaCapturesDatabaseController", [digivigilDatabaseController], {
            _Collection: "ScapturaCaptures",   //Mongo Collection Name

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDigivigilScapturaCapturesDatabaseController starting...");
                this.checkAndCreateCollection();
            },
            checkAndCreateCollection: function()
            {
                console.log("Creating collection");
                this.connectToDatabase().then(lang.hitch(this, function(digivigilDatabase){
                    console.log("Got Connection");
                    try{
                        digivigilDatabase.listCollections({name: this._Collection}).next(lang.hitch(this, function(error, collectionInfo){
                            if(collectionInfo){
                                console.log("Got Collection Info "+ this._Collection);
                            }else if(error){
                                console.log("Error Checking Collection", error);
                            } else{
                                console.log("No Collection or error");
                                digivigilDatabase.createCollection(this._Collection, lang.hitch(this, function(error,collection){
                                    if(error)
                                    {
                                        console.log("Error Creating Collection", error);

                                    }else {
                                        console.log("Created Collection", collection);
                                        //todo create compound key with userKey
                                        collection.createIndex({"capture.id": 1}, {background: true, unique: true});
                                    }
                                }));
                            }
                        }));
                    }catch(error){
                        console.log("Error Creating Collection this was caught", error);
                    }
                })).catch(function(error){
                    console.log("Could not Connect To Database", error)
                });
            },
            getCaptures: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    this.connectToDatabase().then(lang.hitch(this, function(devicesDatabase){
                        console.log("Got Connection");
                        try{
                            let collection = devicesDatabase.collection(this._Collection)
                            if(collection && collection.find){
                                collection.find({}).toArray(
                                    lang.hitch(this, function (error, response) {
                                        if(error){
                                            Reject(error);
                                        }
                                        else if(response){
                                            Resolve(response);
                                        }else{
                                            Resolve([]); //return empty array
                                        }
                                    }));
                            }else{
                                Reject({error: "Could not get Devices Collection"});
                            }

                        }catch(error){
                            console.log("Error Getting Devices:", error);
                        }
                    }))

                }));
            },
            getCapture: function(id){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    this.connectToDatabase().then(lang.hitch(this, function(devicesDatabase){
                        console.log("Got Connection");
                        try{
                            let collection = devicesDatabase.collection(this._Collection)
                            if(collection && collection.find){
                                const captureId = this.shared._DBConnection._objectIdConstructor(id)
                                collection.findOne({_id: captureId},
                                    lang.hitch(this, function (error, response) {
                                        if(error){
                                            Reject(error);
                                        }
                                        else if(response){
                                            Resolve(response);
                                        }else{
                                            Resolve([]); //return empty array
                                        }
                                    }));
                            }else{
                                Reject({error: "Could not get Devices Collection"});
                            }

                        }catch(error){
                            console.log("Error Getting Devices:", error);
                        }
                    }))

                }));
            },
            addCapture: function(Capture)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    if(Capture && Capture.created && Capture.id  && Capture.signature
                        && Capture.signature && Capture.signature.Hash
                        && typeof Capture.recognizedText !== "undefined" &&
                        typeof Capture.note !== "undefined")
                    {
                        let collection = this.shared._DBConnection._db.collection(this._Collection)
                        if(collection){
                            collection.insertOne({capture: Capture}, lang.hitch(this, function (error, response) {
                                if(error){
                                    Reject(error);
                                }
                                else if(response){
                                    Resolve(response.insertedId);
                                }else{
                                    Reject({error: "Could not create Capture"});
                                }
                            }));
                        }else
                        {
                            Reject({error: "Could not get Capture Collection while trying to add Capture to collection"});
                        }
                    }else{
                        Reject({error: "Unexpected Capture database addCapture()"});
                    }
                }));
            },
            removeAllCaptures: function()
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                        let collection = this.shared._DBConnection._db.collection(this._Collection)
                        if(collection){
                            collection.deleteMany({}, lang.hitch(this, function (error, response) {
                                console.log(response, error);

                                if(error){
                                    Reject({error: "Could not remove all captures, might need to reload", deleteManyError: error});
                                }
                                else if(response){
                                    Resolve(response);
                                }else{
                                    Reject({error: "Could not remove all captures, might need to reload"});
                                }
                            }));
                        }else
                        {
                            Reject({error: "Could not get Capture Collection while trying to remove all captures"});
                        }

                }));
            }
        });
    }
);


