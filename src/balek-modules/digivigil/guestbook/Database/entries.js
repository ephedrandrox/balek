define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/digivigil/Database',
    ],
    function (declare, lang, topic,  digivigilDatabaseController) {
        return declare("moduleDigivigilGuestbookEntriesDatabaseController", [digivigilDatabaseController], {
            _Collection: "GuestbookEntries",   //Mongo Collection Name

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDigivigilGuestbookEntriesDatabaseController starting...");
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
            getEntries: function(){
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
            addEntry: function(Entry)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    if(Entry)
                    {
                        let collection = this.shared._DBConnection._db.collection(this._Collection)
                        if(collection){
                            collection.insertOne({entry: Entry}, lang.hitch(this, function (error, response) {
                                if(error){
                                    Reject(error);
                                }
                                else if(response){
                                    Resolve(response.insertedId);
                                }else{
                                    Reject({error: "Could not create Entry"});
                                }
                            }));
                        }else
                        {
                            Reject({error: "Could not get Entry Collection"});
                        }
                    }else{
                        Reject({error: "Unexpected Guestbook Entry database addEntry()"});
                    }
                }));
            }
        });
    }
);


