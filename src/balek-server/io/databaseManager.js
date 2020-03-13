define([ 	'dojo/_base/declare', 
			'dojo/_base/lang',
		'dojo/topic',
		'balek-server/io/database/mysqlDbConnection',
		'balek-server/io/database/mongoDbConnection'],
	function (declare, lang, topic,  mysqlDbConnection, mongoDbConnection) {
		return declare("databaseManager", null, {
			constructor: function(args){

				declare.safeMixin(this, args);

				console.log("Initializing DataBase Manager");

				topic.subscribe("getMySQLDbConnection", lang.hitch(this, this.getMySQLDbConnection));
				topic.subscribe("getMongoDbConnection", lang.hitch(this, this.getMongoDbConnection));

			},
			_start: function(databaseReadyPromiseResolve, databaseReadyPromiseReject)
			{
				databaseReadyPromiseResolve(true);
			},
			getMySQLDbConnection: function(host, port, user, password, database, returnConnection) {

				/* to call this function
				 topic.publish("getMySQLDbConnection", "localhost", "27017", "root", "rootPass", "balek", function(dbConnection){
                    console.log(dbConnection);
                });
				 */

				if(host && port && user && password && database && returnConnection) //could check these for correct types
				{


					let dbConnection = new mysqlDbConnection({ 	_host : host,
						_port : port,
						_user : user,
						_password : password,
						_database : database
					});
					returnConnection(dbConnection);
				}
				else {
					console.log("Not enough info to create a mysqlDB connection or no callback function: - DBManager");
				}

			},
			getMongoDbConnection: function(host, port, user, password, database, returnConnection){

				/* to call this function
				 topic.publish("getMongoDbConnection", "localhost", "27017", "root", "rootPass", "balek", function(dbConnection){
                    console.log(dbConnection);
                });
				 */

				if(host && port && user && password && database && returnConnection) //could check these for correct types
				{

						let dbConnection = new mongoDbConnection({ 	_host : host,
							_port : port,
							_user : user,
							_password : password,
							_database : database
						});

						returnConnection(dbConnection);
				}
				else {
					console.log("Not enough info to create a mongoDB connection or no callback function: - DBManager");
				}
			}

		});
});