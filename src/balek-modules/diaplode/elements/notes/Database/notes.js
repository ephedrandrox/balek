define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/diaplode/Database',

    ],
    function (declare, lang, topic,  diaplodeDatabaseController) {
        return declare("moduleDiaplodeElementsNotesDatabaseController", [diaplodeDatabaseController], {
            _instanceKey: null,
            _Collection: "ElementsNotes",

            _userKey: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDiaplodeElementsNotesDatabaseController starting...");
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
            getUserNotes: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if (this._userKey !== null) {
                        let collection = this.shared._DBConnection._db.collection(this._Collection)
                            if(collection){
                                collection.find({_userKey: this._userKey}, {}).toArray(
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
                                Reject({error: "Could not get Notes Collection"});
                            }

                    }else {
                        Reject({error: "userKey Not set in Elements Notes Database Controller"});
                    }
                }));
            },
            getUserNote: function(noteId){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if (this._userKey !== null) {
                     let collection = this.shared._DBConnection._db.collection(this._Collection)
                        if(collection){
                            noteId = this.shared._DBConnection._objectIdConstructor(noteId)
                            collection.findOne({_userKey: this._userKey,
                                                _id: noteId},
                                    lang.hitch(this, function (error, response) {
                                        if(error){
                                            Reject(error);
                                        }
                                        else if(Array.isArray(response)){
                                            Resolve(response[0]);
                                        }else{
                                            Resolve(response);
                                        }
                                    }));
                        }else{
                            Reject({error: "Could not get Notes Collection"});
                        }

                    }else {
                        Reject({error: "userKey Not set in Elements Notes Database Controller"});
                    }
                }));
            },
            newUserNote: function(noteContent)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    let collection = this.shared._DBConnection._db.collection(this._Collection)
                        if(collection){
                            collection.insertOne({_userKey: this._userKey, noteContent: noteContent}, lang.hitch(this, function (error, response) {
                                if(error){
                                    Reject(error);
                                }
                                else if(response){
                                    Resolve(response.insertedId);
                                }else{
                                    Reject({error: "Could not create Note"});
                                }
                            }));
                        }else
                        {
                            Reject({error: "Could not get Notes Collection"});
                        }
                }));
            },
            updateUserNote: function(noteId, noteContent)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                //todo check that the note ID fits the user ID before updateing

                    let collection = this.shared._DBConnection._db.collection(this._Collection)
                    if(collection){
                        //debugger;
                        noteId = this.shared._DBConnection._objectIdConstructor(noteId)

                        collection.updateOne({_id: noteId}, {$set: {noteContent: noteContent}}, lang.hitch(this, function (error, response) {
                            if(error){
                                Reject(error);
                            }
                            else if(response){
                                Resolve(response);
                            }
                        }));
                    }else {
                        Reject({error: "Could not get Notes collection"});
                    }



                }));
            }
        });
    }
);


