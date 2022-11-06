define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/diaplode/Database',
    ],
    function (declare, lang, topic,  diaplodeDatabaseController) {
        return declare("moduleBalekuteDevicesDatabaseController", [diaplodeDatabaseController], {
            _instanceKey: null,
            _Collection: "BalekuteDevices",

            _userKey: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleBalekuteDevicesDatabaseController starting...");
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
            getDevices: function(){
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
            getUserDevices: function(){
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
                            Reject({error: "Could not get Devices Collection"});
                        }

                    }else {
                        Reject({error: "userKey Not set in Devices Database Controller"});
                    }
                }));
            },
            getUserDevice: function(deviceId){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if (this._userKey !== null) {
                        let collection = this.shared._DBConnection._db.collection(this._Collection)
                        if(collection){
                            deviceId = this.shared._DBConnection._objectIdConstructor(deviceId)
                            collection.findOne({_userKey: this._userKey,
                                    _id: deviceId},
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
                            Reject({error: "Could not get Devices Collection"});
                        }

                    }else {
                        Reject({error: "userKey Not set in Devices Database Controller"});
                    }
                }));
            },
            newUserDevice: function(deviceContent)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    if(deviceContent && deviceContent.owner && deviceContent.owner.userKey
                        && deviceContent.deviceInfo && deviceContent.deviceInfo.publicSigningKey)
                    {
                        let collection = this.shared._DBConnection._db.collection(this._Collection)
                        if(collection){
                            collection.insertOne({_id: deviceContent.deviceInfo.publicSigningKey ,
                                _userKey: deviceContent.owner.userKey, deviceContent: deviceContent}, lang.hitch(this, function (error, response) {
                                if(error){
                                    Reject(error);
                                }
                                else if(response){
                                    Resolve(response.insertedId);
                                }else{
                                    Reject({error: "Could not create Device"});
                                }
                            }));
                        }else
                        {
                            Reject({error: "Could not get Device Collection"});
                        }
                    }else{
                        Reject({error: "Unexpected deviceInfo"});
                    }
                }));
            }
        });
    }
);


