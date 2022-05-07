define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/diaplode/Database',

    ],
    function (declare, lang, topic,  diaplodeDatabaseController) {
        return declare("moduleDiaplodeCommanderSettingsDatabaseController", [diaplodeDatabaseController], {
            _instanceKey: null,
            _Collection: "CommanderSettings",

            _userKey: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDiaplodeCommanderSettingsDatabaseController starting...");
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
                                        collection.createIndex({_userKey: 1}, {unique: true});
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
            getUserSettings: function(){
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
                        Reject({error: "userKey Not set in menus Database Controller"});
                    }
                }));
            },
            setUserSettings: function(userSettings)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    this.getUserSettings().then(lang.hitch(this, function (userSettingsResults) {
                        userSettingsResults.toArray().then(lang.hitch(this, function(userSettingsResultsArray){
                            if(userSettingsResultsArray.length>0 && userSettingsResultsArray[0])
                            {
                                //settings already in database, get collection and update
                                //todo save collection in controller instead of retrieving each time
                                let settingID = {_id: userSettingsResultsArray[0]._id};
                                this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                                    if(error){
                                        Reject(error);
                                    }
                                    else if(collection){
                                        collection.updateOne(settingID, {$set: {userSettings: userSettings}}, lang.hitch(this, function (error, response) {
                                            if(error){
                                                Reject(error);
                                            }
                                            else if(response){
                                                Resolve(response);
                                            }
                                        }));
                                    }
                                }));

                            }else
                            {
                                //No Settings yet, so lets create them
                                this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                                    if(error){
                                        Reject(error);
                                    }
                                    else if(collection){
                                        collection.insertOne({_userKey: this._userKey, userSettings: userSettings}, lang.hitch(this, function (error, response) {
                                            if(error){
                                                Reject(error);
                                            }
                                            else if(response){
                                                Resolve(response);
                                            }
                                        }));
                                    }
                                }));
                            }
                        }));
                    })).catch(lang.hitch(this, function (error) {
                        Reject(error);
                    }));

                }));
            }
        });
    }
);


