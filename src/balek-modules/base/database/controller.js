
/*


This Object can be mixed into both an interface and an instance to
sync the _interfaceState object between the two

*/

define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic'
    ],
    function (declare, lang, topic) {
        return declare("moduleBaseDatabaseController", null, {
            shared: {
                _DBConnection: {},
            },
            _Database: null,
            _Collection: null,
            constructor: function (args) {
                declare.safeMixin(this, args);

            },
            connectToDatabase: function(){
                //This function could be overwritten in superclass to use
                //something other then the balek configured database
                console.log("connection to database!");



            return new Promise(lang.hitch(this, function(Resolve, Reject){
                if(this.shared._DBConnection._db){
                    console.log("alreadyyyyyyyyy connected");
                }
                    else{
                    topic.publish("getMongoSettingsWithCallback", lang.hitch(this, function (mongoDBConfig) {

                        if (this._Database === null)
                        {
                            this._Database = mongoDBConfig.database;
                        }

                        topic.publish("getMongoDbConnection", mongoDBConfig.host,
                            mongoDBConfig.port,
                            mongoDBConfig.user,
                            mongoDBConfig.password,
                            this._Database,
                            lang.hitch(this, function (dbConnection) {
                                this.shared._DBConnection = dbConnection;
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
