define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/digivigil/Database',
    ],
    function (declare, lang, topic,  digivigilDatabaseController) {
        return declare("moduleDigivigilScapturaCapturesDatabaseController", [digivigilDatabaseController], {
            _Collection: "ScapturaCapturesImages",   //Mongo Collection Name

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
                                        console.log("⭐️Created Collection", this._Collection);
                                        //todo create compound key with userKey
                                        collection.createIndex({"CaptureImage.id": 1}, {background: true, unique: true});
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
            // getCaptures: function(){
            //     return new Promise(lang.hitch(this, function(Resolve, Reject) {
            //         this.connectToDatabase().then(lang.hitch(this, function(devicesDatabase){
            //             console.log("Got Connection");
            //             try{
            //                 let collection = devicesDatabase.collection(this._Collection)
            //                 if(collection && collection.find){
            //                     collection.find({}).toArray(
            //                         lang.hitch(this, function (error, response) {
            //                             if(error){
            //                                 Reject(error);
            //                             }
            //                             else if(response){
            //                                 Resolve(response);
            //                             }else{
            //                                 Resolve([]); //return empty array
            //                             }
            //                         }));
            //                 }else{
            //                     Reject({error: "Could not get Devices Collection"});
            //                 }
            //
            //             }catch(error){
            //                 console.log("Error Getting Devices:", error);
            //             }
            //         }))
            //
            //     }));
            // },
            getCaptureImage: function(id) {
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    this.connectToDatabase().then(lang.hitch(this, function(CaptureImagesDatabase){
                        console.log("Got Connection");
                        try{
                            let collection = CaptureImagesDatabase.collection(this._Collection)
                            if(collection && collection.find){
                                //const captureId = this.shared._DBConnection._objectIdConstructor(id)
                                console.log("Looking for id", id);

                                collection.findOne({"CaptureImage.id": id},
                                    lang.hitch(this, function (error, response) {
                                        if(error){
                                            Reject(error);
                                        }
                                        else if(response && response.CaptureImage){
                                            Resolve(response.CaptureImage);
                                        }else{
                                            Resolve([]); //return empty array
                                        }
                                    }));
                            }else{
                                Reject({error: "Could not get Devices Collection"});
                            }

                        }catch(error){
                            console.log("Error Getting Image:", error);
                        }
                    }))

                }));
            },
            getCaptureImageInfo: function(id) {
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                                this.connectToDatabase().then(lang.hitch(this, function(CaptureImagesDatabase){
                                   // console.log("Got Connection");
                                    try{
                                        let collection = CaptureImagesDatabase.collection(this._Collection)
                                        if(collection && collection.find){
                                            //const captureId = this.shared._DBConnection._objectIdConstructor(id)
                                          //  console.log("Looking for id", id);

                                            collection.findOne({"CaptureImage.id": id},
                                                { "CaptureImage.image": 0 }, //todo fix this so it works
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
                                        console.log("Error Getting Image:", error);
                                    }
                                }))

                            }));
            },
            getCaptureImagePreview: function(id) {
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    this.connectToDatabase().then(lang.hitch(this, function(CaptureImagesDatabase){
                        console.log("Got Connection");
                        try{
                            let collection = CaptureImagesDatabase.collection(this._Collection)
                            if(collection && collection.find){
                                //const captureId = this.shared._DBConnection._objectIdConstructor(id)
                                console.log("Looking for id", id);

                                collection.findOne({"CaptureImage.id": id},
                                    { "CaptureImage.image": 0 }, //todo fix this so it works
                                    lang.hitch(this, function (error, response) {
                                        if(error){
                                            Reject(error);
                                        }
                                        else if(response && response.CaptureImage && response.CaptureImage.preview){

                                        if (response.CaptureImage.image)
                                        {
                                            response.CaptureImage.image = null //remove after fixing query
                                        }

                                        Resolve( response.CaptureImage);

                                        }else{
                                            Resolve(); //return nothing
                                        }
                                    }));
                            }else{
                                Reject({error: "Could not get Capture Images Collection"});
                            }

                        }catch(error){
                            console.log("Error Getting Image:", error);
                        }
                    }))

                }));
            },
            updateCaptureImagePreview: function(previewImage, CaptureID)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if (CaptureID && previewImage) {
                        let collection = this.shared._DBConnection._db.collection(this._Collection);
                        if (collection) {

                            collection.updateOne({"CaptureImage.id": CaptureID}, { $set: { "CaptureImage.preview": previewImage } }, lang.hitch(this, function(error, response) {
                                if (error) {
                                    Reject(error);
                                } else if (response) {
                                    Resolve(response);
                                } else {
                                    Reject({ error: "Could not update Capture Image Preview" });
                                }
                            }));


                        } else {
                            Reject({ error: "Could not get Capture Images Collection while trying to update CaptureSet" });
                        }
                    } else {
                        Reject({ error: "Unexpected updateCaptureImagePreview" });
                    }
                }));
            },
            // getCapture: function(id){
            //     return new Promise(lang.hitch(this, function(Resolve, Reject) {
            //         this.connectToDatabase().then(lang.hitch(this, function(devicesDatabase){
            //             console.log("Got Connection");
            //             try{
            //                 let collection = devicesDatabase.collection(this._Collection)
            //                 if(collection && collection.find){
            //                     const captureId = this.shared._DBConnection._objectIdConstructor(id)
            //                     collection.findOne({_id: captureId},
            //                         lang.hitch(this, function (error, response) {
            //                             if(error){
            //                                 Reject(error);
            //                             }
            //                             else if(response){
            //                                 Resolve(response);
            //                             }else{
            //                                 Resolve([]); //return empty array
            //                             }
            //                         }));
            //                 }else{
            //                     Reject({error: "Could not get Devices Collection"});
            //                 }
            //
            //             }catch(error){
            //                 console.log("Error Getting Devices:", error);
            //             }
            //         }))
            //
            //     }));
            // },
            addCaptureImage: function(CaptureImage)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    if(CaptureImage && CaptureImage.id && CaptureImage.signature  && CaptureImage.image
                        && CaptureImage.signature && CaptureImage.signature.Hash)
                    {
                        let collection = this.shared._DBConnection._db.collection(this._Collection)
                        if(collection){
                            collection.insertOne({CaptureImage: CaptureImage}, lang.hitch(this, function (error, response) {
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
            updateCaptureImage: function(captureID, imageBase64String){

            },
            removeAllImagesWithUserKey: function(userKey)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                    let collection = this.shared._DBConnection._db.collection(this._Collection)
                    if(collection){

                        let query = { "CaptureImage.signature.ownerUserKey": userKey }

                        collection.deleteMany(query, lang.hitch(this, function (error, response) {
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
            },
            // removeAllCaptures: function()
            // {
            //     return new Promise(lang.hitch(this, function(Resolve, Reject){
            //
            //             let collection = this.shared._DBConnection._db.collection(this._Collection)
            //             if(collection){
            //                 collection.deleteMany({}, lang.hitch(this, function (error, response) {
            //                     console.log(response, error);
            //
            //                     if(error){
            //                         Reject({error: "Could not remove all captures, might need to reload", deleteManyError: error});
            //                     }
            //                     else if(response){
            //                         Resolve(response);
            //                     }else{
            //                         Reject({error: "Could not remove all captures, might need to reload"});
            //                     }
            //                 }));
            //             }else
            //             {
            //                 Reject({error: "Could not get Capture Collection while trying to remove all captures"});
            //             }
            //
            //     }));
            // }
        });
    }
);


