define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/diaplode/Database',

    ],
    function (declare, lang, topic,  diaplodeDatabaseController) {
        return declare("moduleDiaplodeElementsFilesDatabaseController", [diaplodeDatabaseController], {
            _instanceKey: null,
            _Collection: "ElementsFiles",

            _userKey: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDiaplodeElementsFilesDatabaseController starting...");
                this.createCollection();

            },
            createCollection: function()
            {
                console.log("Creating collection");
                this.connectToDatabase().then(lang.hitch(this, function(settingsDatabase){
                    console.log("Got Connection");

                    try{
                        settingsDatabase.listCollections({name: this._Collection}).next(lang.hitch(this, function(error, collectionInfo){
                            if(collectionInfo){
                                console.log("Got Collection Info "+ this._Collection);
                            }else if(error){
                                console.log("Error Checking Collection", error);
                            } else{
                                console.log("No Collection or error");
                                settingsDatabase.createCollection(this._Collection, lang.hitch(this, function(error,collection){
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
            getUserFiles: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if (this._userKey !== null) {
                        this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                            if(error){
                                Reject(error);
                            }
                            else if(collection){
                                collection.find({_userKey: this._userKey},
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
                            }
                        }));
                    }else {
                        Reject({error: "userKey Not set in Elements Files Database Controller"});
                    }
                }));
            },
            getUserFile: function(fileID){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if (this._userKey !== null) {
                        this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                            if(error){
                                Reject(error);
                            }
                            else if(collection){
                                fileID = collection.s.pkFactory.ObjectID(fileID);
                                collection.find({_userKey: this._userKey,
                                                _id: fileID},
                                    lang.hitch(this, function (error, response) {
                                        if(error){
                                            Reject(error);
                                        }
                                        else if(response){
                                            response.toArray(function(err, documents)
                                            {
                                                Resolve(documents[0]);
                                            });
                                        }else{
                                            Resolve([]); //return empty array
                                        }
                                    }));
                            }
                        }));
                    }else {
                        Reject({error: "userKey Not set in Elements Files Database Controller"});
                    }
                }));
            },
            newUserFile: function(fileContent)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                        if(error){
                            Reject(error);
                        }
                        else if(collection){
                            collection.insertOne({_userKey: this._userKey, fileContent: fileContent}, lang.hitch(this, function (error, response) {
                                if(error){
                                    Reject(error);
                                }
                                else if(response){
                                    Resolve(response.insertedId);
                                }
                            }));
                        }
                    }));
                }));
            },
            updateUserFile: function(fileId, fileContent)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                //todo check that the file ID fits the user ID before updateing

                this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                    if(error){
                        Reject(error);
                    }
                    else if(collection){
                        //debugger;
                        fileId = collection.s.pkFactory.ObjectID(fileId);

                        collection.updateOne({_id: fileId}, {$set: {fileContent: fileContent}}, lang.hitch(this, function (error, response) {
                            if(error){
                                Reject(error);
                            }
                            else if(response){
                                Resolve(response);
                            }
                        }));
                    }
                }));


                }));
            }
        });
    }
);

