define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/digivigil/Database',
    ],
    function (declare, lang, topic,  digivigilDatabaseController) {
        return declare("moduleDigivigilDigiscanEntriesDatabaseController", [digivigilDatabaseController], {
            _Collection: "DigiscanEntries",   //Mongo Collection Name

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDigivigilDigiscanEntriesDatabaseController starting...");
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
                                        collection.createIndex({_userKey: 1}, {background: true});
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
            getEntry: function(id){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    this.connectToDatabase().then(lang.hitch(this, function(devicesDatabase){
                        console.log("Got Connection");
                        try{
                            let collection = devicesDatabase.collection(this._Collection)
                            if(collection && collection.find){
                                const entryId = this.shared._DBConnection._objectIdConstructor(id)
                                collection.findOne({_id: entryId},
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
                    if(Capture && Capture.created && Capture.id  &&
                        typeof Capture.recognizedText !== "undefined" &&
                        typeof Capture.note !== "undefined")
                    {
                        let collection = this.shared._DBConnection._db.collection(this._Collection)
                        if(collection){
                            collection.insertOne({entry: Capture}, lang.hitch(this, function (error, response) {
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
                            Reject({error: "Could not get Capture Collection whilke trying to add Capture to collection"});
                        }
                    }else{
                        Reject({error: "Unexpected Digiscan Entry database addCapture()"});
                    }
                }));
            }
        });
    }
);


