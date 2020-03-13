define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic'],
    function (declare, lang, topic) {
        return declare("usersDbController", null, {

            constructor: function (args) {

                declare.safeMixin(this, args);

                console.log("Initializing Users DB Controller");

                topic.publish("getMySQLSettingsWithCallback", lang.hitch(this, function (mysqlSettings) {

                    if (mysqlSettings.host && mysqlSettings.user && mysqlSettings.password && mysqlSettings.database) {

                        this._mysqlSettings = mysqlSettings;

                        topic.publish("getMySQLDbConnection", mysqlSettings.host, "3306", mysqlSettings.user, mysqlSettings.password, mysqlSettings.database, lang.hitch(this, function (dbConnection) {
                            declare.safeMixin(this, dbConnection);
                        }));

                    } else {
                        console.log(mysqlSettings);
                    }

                }));

            },
            getUserFromDatabase: function (username) {

                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    let query = this._dbConnection.query('SELECT id, name, password, userKey, icon, permission_groups FROM ' + this._mysqlSettings.database + '.users WHERE name = ?;', username);
                    let userToReturn = [];
                    query.on('error', function (err) {
                        console.log(err);
                        Reject(err);
                    })
                        .on('result', lang.hitch(this, function (row) {
                            //todo get connection from pool to pause
                            // this._dbConnection.pause();
                            userToReturn.push(row);
                        }))
                        .on('end', function () {
                            // all rows have been received
                            //console.log("All rows received");
                            Resolve(userToReturn);
                        });
                }));

            },
            getUsersFromDatabase: function () {

                return new Promise(lang.hitch(this, function (Resolve, Reject) {

                    let query = this._dbConnection.query('SELECT id, name, userKey, icon FROM ' + this._mysqlSettings.database + '.users;');
                    let usersToReturn = [];
                    query.on('error', function (err) {
                        // Handle error, an 'end' event will be emitted after this as well
                        Reject(err);
                    })
                        .on('result', function (row) {
                            usersToReturn.push(row);
                        })
                        .on('end', function () {
                            Resolve(usersToReturn);
                        });
                }));

            },
            updateUserInDatabase: function (userData) {

                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (userData.id) {

                        if (userData.icon && !userData.password) {
                            query = this._dbConnection.query('UPDATE ' + this._mysqlSettings.database + '.users SET icon = ? WHERE id = ? ;', [userData.icon, userData.id]);
                        } else if (userData.icon && userData.password && !userData.name) {
                            query = this._dbConnection.query('UPDATE ' + this._mysqlSettings.database + '.users SET icon = ?, password=? WHERE id = ? ;', [userData.icon, userData.password, userData.id]);
                        } else if (userData.icon && userData.password && userData.name) {
                            query = this._dbConnection.query('UPDATE ' + this._mysqlSettings.database + '.users SET icon = ?, password=?, name=? WHERE id = ? ;', [userData.icon, userData.password, userData.name, userData.id]);
                        }

                    } else if (userData.name, userData.password, userData.icon, userData.userKey, userData.permissionGroups) {
                        //todo check username is available
                        console.log("no user identifer; Adding New user");
                        query = this._dbConnection.query('INSERT INTO ' + this._mysqlSettings.database + '.users (name, password, icon, userKey, permission_groups) VALUES (?, ?, ?, ?, ? );', [userData.name, userData.password, userData.icon, userData.userKey, userData.permissionGroups]);

                    } else {
                        console.log("not enough user info", userData);
                        Reject("Not Enough Info To Update User");
                    }

                    let resultToReturn = [];

                    query.on('error', function (err) {
                        Reject(err.message);
                    })
                        .on('result', function (row) {
                            resultToReturn.push(row);
                        })
                        .on('end', function () {
                            Resolve(resultToReturn);
                        });
                }));
            }

        });
    });