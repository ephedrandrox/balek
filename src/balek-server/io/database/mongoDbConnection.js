define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/aspect',
        'dojo/topic',
        "dojo/node!mongodb",],
    function (declare, lang, aspect, topic, mongodbNodeObject) {

        return declare("mongoDbConnection", null, {

            _mongoClient: null,
            _url: null,
            _db: null,
            _adminDB: null,

            _port: null,
            _host: null,
            _user: null,
            _password: null,
            _database: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("Initializing Mongo DB Connection");

                if (this._host && this._port && this._user && this._password && this._database) {

                    this._mongoClient = mongodbNodeObject.MongoClient;
                    this._objectIdConstructor = mongodbNodeObject.ObjectId;
                    this._url = 'mongodb://' + this._user + ":" + this._password + "@" + this._host + ":" + this._port;

                    this._mongoClient.connect(this._url, {
                        useNewUrlParser: true,
                        useUnifiedTopology: true
                    }, (err, client) => {
                        if (err) {
                            console.error(err)
                            //return;
                        } else {
                            this._db = client.db(this._database);
                            this._adminDb = client.db('admin');
                                this.onDatabaseConnected()

                        }
                    });

                } else {
                    console.log("Not enough info provided to start connection");
                }

            },
            onDatabaseConnected: function(){
                //Gets called from database connect callback
                //Any Promises from getDatabaseConnection get called after using aspect
                console.log("Database Connected");
            },
            getDatabaseConnection: function(){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    if(this._db){
                        Resolve(this._db)
                    }else {
                        //if database is not connected, resolve after it is
                        aspect.after(this, "onDatabaseConnected", lang.hitch(this, function() {
                            Resolve(this._db)
                        }))
                    }
                }))
            },
            getDbStats: function () {
                this._db.command({'dbStats': 1}, function (err, results) {
                    console.log(results);
                });
                this._adminDb.command({'top': 1}, function (err, results) {
                    console.log(results);
                });
            },
            getClientStats: function () {
                this._db.command({'whatsmyuri': 1}, function (err, results) {
                    console.log(results);
                });
            },
            getCollectionsList: function () {
                this._db.command({'listCollections': 1}, function (err, results) {
                    console.log(results);
                });
            }
        });
    });