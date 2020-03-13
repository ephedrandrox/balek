define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/Module',
        'balek-modules/digivigil-www/guestbook/Instance',
        //todo Make Module Separate Repository
        //todo add this modules to package.json for module not project
        "dojo/node!sanitize-html"],
    function (declare, lang, topic, baseModule, moduleInstance, nodeSanitizeHtml) {

        return declare("digivigilGuestbookModule", baseModule, {
            _displayName: "Digivigil Guestbook",
            _allowedSessions: [0, 1],

            _guestbookDBConnection: null,
            _instances: {},

            _iconPath: 'balek-modules/digivigil-www/guestbook/resources/images/book.svg',

            constructor: function (args) {

                declare.safeMixin(this, args);

                console.log("digivigilGuestbookModule  starting...");

                topic.publish("getMongoSettingsWithCallback", lang.hitch(this, function (mongoDBConfig) {
                    topic.publish("getMongoDbConnection", mongoDBConfig.host, mongoDBConfig.port, mongoDBConfig.user, mongoDBConfig.password, mongoDBConfig.collection, lang.hitch(this, function (dbConnection) {
                        this._guestbookDBConnection = dbConnection;
                        //todo check that it contains collection
                    }));
                }));

            },
            checkAndReturnValidGuestbookEntry(guestbookEntry) {
                let validGuestbookEntry = {};
                let now = new Date(Date.now());
                let currentDate = (now.getMonth() + 1) + "/" + now.getDate() + "/" + now.getFullYear();
                if (guestbookEntry.name && guestbookEntry.home && guestbookEntry.note) {
                    validGuestbookEntry.name = nodeSanitizeHtml(guestbookEntry.name);
                    validGuestbookEntry.home = nodeSanitizeHtml(guestbookEntry.home);
                    validGuestbookEntry.note = nodeSanitizeHtml(guestbookEntry.note);
                    validGuestbookEntry.date = currentDate;
                    return validGuestbookEntry;
                } else {
                    return false;
                }

            },
            addDigivigilWWWGuestbookEntry: function (guestbookEntry) {
                let validGuestbookEntry = this.checkAndReturnValidGuestbookEntry(guestbookEntry);
                if (validGuestbookEntry) {
                    this._guestbookDBConnection._db.collection('guestbook', lang.hitch(this, function (err, collection) {
                        collection.insertOne(validGuestbookEntry, lang.hitch(this, function (error, response) {
                            this.sendNewEntryToAllActiveInterfaces(response.ops[0]);
                        }));
                    }));
                } else {
                    console.log("Not a valid guestbook Entry");
                }
            },
            getDigivigilWWWGuestbookEntries: function (returnCallback) {
                this._guestbookDBConnection._db.collection('guestbook', lang.hitch(this, function (err, collection) {
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
                                    messageData: {guestbookData: newEntry}
                                }
                            });
                        }
                    }))
                }

            }
        });
    }
);


