define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/diaplode/Database',

    ],
    function (declare, lang, topic,  diaplodeDatabaseController) {
        return declare("moduleDiaplodeElementsTasksDatabaseController", [diaplodeDatabaseController], {
            _instanceKey: null,
            _Collection: "ElementsTasks",

            _userKey: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDiaplodeElementsTasksDatabaseController starting...");
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
            getUserTasks: function(){
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
                        Reject({error: "userKey Not set in Elements Tasks Database Controller"});
                    }
                }));
            },
            getUserTask: function(taskID){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if (this._userKey !== null) {
                        this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                            if(error){
                                Reject(error);
                            }
                            else if(collection){
                                //todo is there a better way to this function?
                                //maybe make object of functions in base class
                                taskID = collection.s.pkFactory.ObjectID(taskID);

                                collection.find({_userKey: this._userKey,
                                                _id:  taskID },
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
                        Reject({error: "userKey Not set in Elements Tasks Database Controller"});
                    }
                }));
            },
            newUserTask: function(taskContent)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                        if(error){
                            Reject(error);
                        }
                        else if(collection){
                            collection.insertOne({_userKey: this._userKey, taskContent: taskContent, taskStatus:"☑️"}, lang.hitch(this, function (error, response) {
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
            updateUserTask: function(taskId, taskContent)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                //todo check that the task ID fits the user ID before updateing

                this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                    if(error){
                        Reject(error);
                    }
                    else if(collection){
                        taskId = collection.s.pkFactory.ObjectID(taskId);

                        collection.updateOne({_id: taskId}, {$set: {taskContent: taskContent}}, lang.hitch(this, function (error, response) {
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
            },
            updateUserTaskStatus: function(taskId, taskStatus)
            {
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                    //todo check that the task ID fits the user ID before updateing

                    this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (error, collection) {
                        if(error){
                            Reject(error);
                        }
                        else if(collection){
                            taskId = collection.s.pkFactory.ObjectID(taskId);

                            collection.updateOne({_id: taskId}, {$set: {taskStatus: taskStatus}}, lang.hitch(this, function (error, response) {
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


