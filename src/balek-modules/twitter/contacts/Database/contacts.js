define(['dojo/_base/declare',
        'dojo/_base/lang',
        //Balek Twitter Database Controller
        'balek-modules/twitter/Database',
    ],
    function (declare, lang,  twitterDatabaseController) {
        return declare("moduleTwitterContactsDatabaseController", [twitterDatabaseController], {
            _instanceKey: null,
            _Collection: "TwitterContacts",

            _userKey: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleTwitterContactsDatabaseController starting...");
                this.createContactsCollection();

            },
            createContactsCollection: function()
                {
                    this.connectToDatabase().then(lang.hitch(this, function(contactDatabase){
                        console.log("Got Connection");
                        try{
                            contactDatabase.listCollections({name: this._Collection}).next(lang.hitch(this, function(error, collectionInfo){
                                if(collectionInfo){
                                    console.log("Got Collection Info", collectionInfo);

                                }else if(error){
                                    console.log("Error Checking Collection", error);

                                } else{
                                    console.log("No Collection or error");
                                    contactDatabase.createCollection(this._Collection, lang.hitch(this, function(error,collection){
                                        if(error)
                                        {
                                            console.log("Error Creating Collection", error);

                                        }else {
                                            console.log("Created Collection", collection);
                                            collection.createIndex({twitterID: 1, twitterUsername: 1}, {unique: true});
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
            getUserContacts: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if (this._userKey !== null) {
                        this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                            if(error){
                                Reject(error);
                            }
                            else if(collection){
                                collection.find({_userKey: this._userKey}, lang.hitch(this, function (error, response) {
                                    if(error){
                                        Reject(error);
                                    }
                                    else if(response){
                                        Resolve(response);
                                    }
                                }));
                            }
                        }));
                    }else {
                        Reject({error: "userKey Not set in menus Database Controller"});
                    }
                }));
            },
            newContact: function(newContact)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    if(newContact && newContact.id && newContact.username)
                    {
                        this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                            if(error){
                                Reject(error);
                            }
                            else if(collection){
                                collection.insertOne({_userKey: this._userKey,
                                                            twitterID: newContact.id,
                                                            twitterUsername: newContact.username,
                                                        contact: newContact},

                                    lang.hitch(this, function (error, response) {
                                    if(error){
                                        Reject(error);
                                    }
                                    else if(response){
                                        Resolve(response);
                                    }
                                }));
                            }
                        }));
                    }else {
                        Reject({error: "Not enough info in contact",
                        contact: newContact});

                    }
                }));
            }
        });
    }
);