
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
    ],
    function (declare, lang, topic) {
        return declare("moduleBaseDatabaseController", null, {
            shared: {
                _DBConnection: {},
            },
            _Database: null,
            _Collection: null,

            _connectingResolves: null,
            _connectingRejects: null,


            constructor: function (args) {
                declare.safeMixin(this, args);
                this._connectingResolves = []
                this._connectingRejects = []
            },
            connectToDatabase: function(){
                //This function could be overwritten in superclass to use
                //something other then the balek configured database
                console.log("🟥🟧🟨🟩🟦🟪connection to database!");



            return new Promise(lang.hitch(this, function(Resolve, Reject){
                if(this.shared._DBConnection._db){
                    console.log("🟥🟧🟨🟩🟦🟪already connected");
                    Resolve(this.shared._DBConnection._db);
                } else if (this._connectingResolves.length !== 0 ){
                    console.log("🟥🟧🟨🟩🟦🟪already connecting")
                    this._connectingResolves.push(Resolve)
                    this._connectingRejects.push(Reject)
                }
                else{
                    this._connectingResolves.push(Resolve)
                    this._connectingRejects.push(Reject)

                    console.log("🟥🟧🟨🟩🟦🟪Atempting connecting")
                    topic.publish("getMongoSettingsWithCallback", lang.hitch(this, function (mongoDBConfig) {
                    console.log("connectToDatabase Promise", mongoDBConfig, this._Database)

                        if (this._Database === null)
                        {
                            this._Database = mongoDBConfig.database;
                        }
                        console.log("################################################################################################", mongoDBConfig, this._Database)

                        topic.publish("getMongoDbConnection", mongoDBConfig.host,
                            mongoDBConfig.port,
                            mongoDBConfig.user,
                            mongoDBConfig.password,
                            this._Database,
                            lang.hitch(this, function (dbConnection) {
                                this.shared._DBConnection = dbConnection;
                                //console.log("dbConnection to database!", dbConnection);

                                this.shared._DBConnection.getDatabaseConnection().then(lang.hitch(this, function(Result){
                                 //   console.log("dbConnection to database Result!", dbConnection, Result, dbConnection._db);

                                    if(Result === dbConnection._db ){
                                        this._connectingResolves.forEach(lang.hitch(this, function(connectionResolve){
                                            connectionResolve(dbConnection._db)
                                        }))
                                    }else{
                                        this._connectingRejects.forEach(lang.hitch(this, function(connectionReject){
                                            connectionReject({Error: "Could not get database connection"})
                                        }))

                                    }



                                })).catch(lang.hitch(this, function(Error){
                                        console.log("dbConnection to database Error!", dbConnection, Error, this.shared._DBConnection._db);

                                    })
                                )


                        }));

                    }));
                }
            }));
            },
            checkConnection: function(){
               //todo return promise that resolves once connection is established or fail if cannot connect
                //use connecToDatabase
            },
            getCollection: function(collectionName){
                //todo make function that returns promise to return collection or error
            },
            checkCollection: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {

                    if(this._Collection != null)
                    {
                        this.shared._DBConnection._db.collection(this._Collection, lang.hitch(this, function (err, collection) {
                           if(collection){
                               collection.find({}, lang.hitch(this, function (error, response) {
                                   if(error){
                                       Reject(error);
                                   }else{
                                       response.toArray().then(function (docs) {
                                           Resolve(docs);
                                       });
                                   }
                               }));
                           }else {
                               Reject(err);
                           }

                        }));
                    }else {
                        Reject("There is no collection set in the  Database Controller");
                    }
                }));
            },
            getCollectionDocumentsFromDatabase: function() {

            return new Promise(lang.hitch(this, function(Resolve, Reject){

                this._DBConnection._db.collection(this._DBCollection, lang.hitch(this, function (err, collection) {
                        collection.find({}, lang.hitch(this, function (error, response) {
                          if(error){
                              Reject(error);
                          }else{
                              response.toArray().then(function (docs) {
                                  Resolve(docs);
                              });
                          }


                        }));
                    }));
                }));
            }
        });
    });
