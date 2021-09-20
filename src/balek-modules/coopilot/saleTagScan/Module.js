define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/Module',
        'balek-modules/coopilot/saleTagScan/Instance',
        //todo Make Module Separate Repository
        //todo add this modules to package.json for module not project
        "dojo/node!sanitize-html"],
    function (declare, lang, topic, baseModule, moduleInstance, nodeSanitizeHtml) {

        return declare("digivigilSaleTagScanModule", baseModule, {
            _displayName: "Digivigil SaleTagScan",
            _allowedSessions: [0, 1],

            _saleTagScanDBConnection: null,
            _instances: {},

            _iconPath: 'balek-modules/coopilot/saleTagScan/resources/images/book.svg',

            constructor: function (args) {

                declare.safeMixin(this, args);

                console.log("digivigilSaleTagScanModule  starting...");

                topic.publish("getMongoSettingsWithCallback", lang.hitch(this, function (mongoDBConfig) {
                    topic.publish("getMongoDbConnection", mongoDBConfig.host, mongoDBConfig.port, mongoDBConfig.user, mongoDBConfig.password, mongoDBConfig.database, lang.hitch(this, function (dbConnection) {
                        this._saleTagScanDBConnection = dbConnection;
                    }));
                }));

            },
            checkAndReturnValidSaleTagScanEntry(saleTagScanEntry) {
                let validSaleTagScanEntry = {};
                let now = new Date(Date.now());
                let currentDate = (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear();
                if (saleTagScanEntry.name && saleTagScanEntry.home && saleTagScanEntry.note) {
                    validSaleTagScanEntry.name = nodeSanitizeHtml(saleTagScanEntry.name);
                    validSaleTagScanEntry.home = nodeSanitizeHtml(saleTagScanEntry.home);
                    validSaleTagScanEntry.note = nodeSanitizeHtml(saleTagScanEntry.note);
                    validSaleTagScanEntry.date = currentDate;
                    return validSaleTagScanEntry;
                } else {
                    return false;
                }

            },
            addDigivigilWWWSaleTagScanEntry: function (saleTagScanEntry) {
                let validSaleTagScanEntry = this.checkAndReturnValidSaleTagScanEntry(saleTagScanEntry);
                if (validSaleTagScanEntry) {
                    this._saleTagScanDBConnection._db.collection('saleTagScan', lang.hitch(this, function (err, collection) {
                        collection.insertOne(validSaleTagScanEntry, lang.hitch(this, function (error, response) {
                            this.sendNewEntryToAllActiveInterfaces(response.ops[0]);
                        }));
                    }));
                } else {
                    console.log("Not a valid saleTagScan Entry");
                }
            },
            getDigivigilWWWSaleTagScanEntries: function (returnCallback) {
                this._saleTagScanDBConnection._db.collection('saleTagScan', lang.hitch(this, function (err, collection) {
                    collection.find({}, lang.hitch(this, function (error, response) {
                        response.toArray().then(function (docs) {
                            returnCallback(docs);
                        });
                    }));

                }));
            },
            newInstance: function (args) {
                args._module = this;
                this._instances[args._instanceKey] = new moduleInstance(args);
                return new moduleInstance(args);
            },
            sendNewEntryToAllActiveInterfaces(newEntry) {

                for (const instanceKey in this._instances) {
                    topic.publish("getSessionWSSConnection", this._instances[instanceKey]._sessionKey, lang.hitch(this, function (sessionWSSConnection) {
                        if (sessionWSSConnection !== null) {
                            topic.publish("sendBalekProtocolMessage", sessionWSSConnection, {
                                moduleMessage: {
                                    instanceKey: instanceKey,
                                    messageData: {saleTagScanData: newEntry}
                                }
                            });
                        }
                    }))
                }

            }
        });
    }
);


