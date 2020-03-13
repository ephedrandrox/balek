define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/node!mongodb"],
    function (declare, lang, topic, mongodbNodeObject) {

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

                            //  this.getDbStats();
                            //  this.getClientStats();
                            //  this.getCollectionsList();

                        }
                    });

                } else {
                    console.log("Not enough info provided to start connection");
                }

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