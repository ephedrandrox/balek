define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/digivigil/Database',
        "dojo/node!mongodb"
    ],
    function (declare, lang, topic,  digivigilDatabaseController, mongodbNodeObject) {
        return declare("moduleDigivigilDigiscanCaptureSetsDatabaseController", [digivigilDatabaseController], {
            _Collection: "ScapturaCaptureSets",   //Mongo Collection Name

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDigivigilDigiscanCaptureSetsDatabaseController starting...");
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
                                        console.log("⭐️Created Collection", this._Collection);
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
            getCaptureSets: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    this.connectToDatabase().then(lang.hitch(this, function(captureSetsDatabase){
                        console.log("Got Connection");
                        try{
                            let collection = captureSetsDatabase.collection(this._Collection)
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
                                Reject({error: "Could not get Capture Sets Collection"});
                            }

                        }catch(error){
                            console.log("Error Getting Capture Sets Database:", error);
                        }
                    }))

                }));
            },
            getCaptureSet: function(id){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    this.connectToDatabase().then(lang.hitch(this, function(captureSetsDatabase){
                        console.log("Got Connection");
                        try{
                            let collection = captureSetsDatabase.collection(this._Collection)
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
            updateCaptureSet: function(id, CaptureSet)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if (id && CaptureSet && CaptureSet.name) {
                        let collection = this.shared._DBConnection._db.collection(this._Collection);
                        if (collection) {

                            let objectId;

                            try {
                                objectId = mongodbNodeObject.ObjectId(id);
                            } catch (error) {
                                Reject({ error: "Invalid id format" });
                                return;
                            }
                            collection.updateOne({ _id: objectId }, { $set: { CaptureSet: CaptureSet } }, lang.hitch(this, function(error, response) {
                                if (error) {
                                    Reject(error);
                                } else if (response) {
                                    Resolve(response);
                                } else {
                                    Reject({ error: "Could not update CaptureSet" });
                                }
                            }));


                        } else {
                            Reject({ error: "Could not get CaptureSet Collection while trying to update CaptureSet" });
                        }
                    } else {
                        Reject({ error: "Unexpected Digiscan CaptureSet database updateCaptureSet()" });
                    }
                }));
            },
            addCaptureSet: function(CaptureSet, userKey)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                    console.log("addCaptureSet Database:", CaptureSet, userKey)

                    if(CaptureSet && CaptureSet.name)
                    {
                        let collection = this.shared._DBConnection._db.collection(this._Collection)
                        if(collection){
                            collection.insertOne({userKey: userKey,CaptureSet: CaptureSet}, lang.hitch(this, function (error, response) {
                                if(error){
                                    Reject(error);
                                }
                                else if(response){
                                    Resolve(response.insertedId);
                                }else{
                                    Reject({error: "Could not create CaptureSet"});
                                }
                            }));
                        }else
                        {
                            Reject({error: "Could not get CaptureSet Collection while trying to add CaptureSet to collection"});
                        }
                    }else{
                        Reject({error: "Unexpected Digiscan CaptureSet database addCaptureSet()"});
                    }
                }));
            },
            removeCaptureSet: function(id){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    let collection = this.shared._DBConnection._db.collection(this._Collection);

                    if (collection) {
                        console.log("deleting CaptureSet id: " + id);
                        let objectId;

                        try {
                            objectId = mongodbNodeObject.ObjectId(id);
                        } catch (error) {
                            Reject({ error: "Invalid id format" });
                            return;
                        }

                        // Replace the following line to delete a specific item by its id
                        collection.deleteOne({ _id: objectId }, lang.hitch(this, function(error, response) {
                            console.log(response, error);

                            if (error) {
                                Reject({ error: "Could not remove the capture set, might need to reload", deleteOneError: error });
                            } else if (response.deletedCount > 0) {
                                Resolve(response);
                            } else {
                                Reject({ error: "Could not find the capture set with the specified id" });
                            }
                        }));
                    } else {
                        Reject({ error: "Could not get Capture Sets Collection while trying to remove the capture set" });
                    }
                }));

            },
            removeAllCaptureSets: function()
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                        let collection = this.shared._DBConnection._db.collection(this._Collection)
                        if(collection){
                            collection.deleteMany({}, lang.hitch(this, function (error, response) {
                                console.log(response, error);

                                if(error){
                                    Reject({error: "Could not remove all captures sets, might need to reload", deleteManyError: error});
                                }
                                else if(response){
                                    Resolve(response);
                                }else{
                                    Reject({error: "Could not remove all captures sets, might need to reload"});
                                }
                            }));
                        }else
                        {
                            Reject({error: "Could not get Capture Sets Collection while trying to remove all captures"});
                        }

                }));
            }
        });
    }
);


