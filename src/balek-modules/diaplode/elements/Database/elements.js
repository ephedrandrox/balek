define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/diaplode/Database',

    ],
    function (declare, lang,  diaplodeDatabaseController) {
        return declare("moduleDiaplodeElementsDatabaseController", [diaplodeDatabaseController], {
            _instanceKey: null,
            _Collection: "Elements",

            _userKey: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDiaplodeElementsDatabaseController starting...");
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
            getUserElements: function(){
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
                        Reject({error: "userKey Not set in Elements Database Controller"});
                    }
                }));
            },
            getUserElement: function(elementID){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if (this._userKey !== null) {
                        this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                            if(error){
                                Reject(error);
                            }
                            else if(collection){
                                elementID = collection.s.pkFactory.ObjectID(elementID);
                                collection.find({_userKey: this._userKey,
                                                _id: elementID},
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
                        Reject({error: "userKey Not set in Elements Database Controller"});
                    }
                }));
            },
            newUserElement: function(elementContent)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                        if(error){
                            Reject(error);
                        }
                        else if(collection){
                            collection.insertOne({_userKey: this._userKey, elementContent: elementContent}, lang.hitch(this, function (error, response) {
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
            updateUserElement: function(elementId, elementContent)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    let elementId = element._id;
                    let elementContent = element.data;
                    let elementType = element.type;
                //todo check that the element ID fits the user ID in database before updateing

                this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                    if(error){
                        Reject(error);
                    }
                    else if(collection){
                        //debugger;
                        elementId = collection.s.pkFactory.ObjectID(elementId);

                        collection.updateOne({_id: elementId}, {$set: {elementContent: elementContent}}, lang.hitch(this, function (error, response) {
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


