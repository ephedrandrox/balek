define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/node!mysql2"],
    function (declare, lang, topic, mysqlNodeObject) {

        return declare("mysqlDbConnection", null, {

            _dbConnection: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                console.log("Initializing MySQL Db Connection");

                if (this._host && this._port && this._user && this._password && this._database) {
                    this._dbConnection = mysqlNodeObject.createPool({
                        host: this._host,
                        user: this._user,
                        password: this._password,
                        database: this._database,
                        waitForConnections: true,
                        connectionLimit: 10,
                        queueLimit: 0
                    });

                } else {
                    console.log("Not enough info provided to start connection");
                }

            }
        });
    });