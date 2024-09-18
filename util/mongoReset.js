const fs = require('fs');

const os = require('os');


const mongodb = require('mongodb');

const configFilePath = './src/balek-server/etc/config.json';

let mongoHost = "";
let mongoPort = "";
let mongoDatabase = "";
let mongoUser = "";
let mongoPassword = "";



if (fs.existsSync(configFilePath)) {
    // File exists
    const configJSONData = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

    if (configJSONData["Network Settings"] && configJSONData["Network Settings"].Hostname)
    {
        hostname = configJSONData["Network Settings"].Hostname
    }
    if (configJSONData["Database Settings"] && configJSONData["Database Settings"]["Mongo Database Connection"]
        && configJSONData["Database Settings"]["Mongo Database Connection"].host && configJSONData["Database Settings"]["Mongo Database Connection"].port
        && configJSONData["Database Settings"]["Mongo Database Connection"].user && configJSONData["Database Settings"]["Mongo Database Connection"].password
        && configJSONData["Database Settings"]["Mongo Database Connection"].database)
    {
        mongoHost = configJSONData["Database Settings"]["Mongo Database Connection"].host
        mongoPort = configJSONData["Database Settings"]["Mongo Database Connection"].port
        mongoUser = configJSONData["Database Settings"]["Mongo Database Connection"].user
        mongoPassword = configJSONData["Database Settings"]["Mongo Database Connection"].password
        mongoDatabase = configJSONData["Database Settings"]["Mongo Database Connection"].database
    }

    if (hostname && mongoHost && mongoPort && mongoUser && mongoPassword && mongoDatabase) {
        console.log('Configuration Report:');
        console.log('Hostname:', hostname);
        console.log('Mongo Host:', mongoHost);
        console.log('Mongo Port:', mongoPort);
        console.log('Mongo User:', mongoUser);
        console.log('Mongo Password:', mongoPassword);
        console.log('Mongo Database:', mongoDatabase);

        //connect and list collections in database
        const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}`;
        const client = new mongodb.MongoClient(mongoURL, { useNewUrlParser: true, useUnifiedTopology: true });

        client.connect(function (err) {
            if (err) {
                console.log("Error connecting to Mongo Database");
                console.log(err);
            } else {
                console.log("Connected successfully to Mongo Database");

                const db = client.db(mongoDatabase);

                // Create a promise for each delete operation
                const deleteImages = new Promise((resolve, reject) => {
                    db.collection('ScapturaCapturesImages').deleteMany({}, function (err, result) {
                        if (err) {
                            console.log("Error deleting ScapturaCapturesImages collection");
                            console.log(err);
                            reject(err);
                        } else {
                            console.log("ScapturaCapturesImages collection deleted");
                            resolve(result);
                        }
                    });
                });

                const deleteSets = new Promise((resolve, reject) => {
                    db.collection('ScapturaCaptureSets').deleteMany({}, function (err, result) {
                        if (err) {
                            console.log("Error deleting ScapturaCaptureSets collection");
                            console.log(err);
                            reject(err);
                        } else {
                            console.log("ScapturaCaptureSets collection deleted");
                            resolve(result);
                        }
                    });
                });

                const deleteCaptures = new Promise((resolve, reject) => {
                    db.collection('ScapturaCaptures').deleteMany({}, function (err, result) {
                        if (err) {
                            console.log("Error deleting ScapturaCaptures collection");
                            console.log(err);
                            reject(err);
                        } else {
                            console.log("ScapturaCaptures collection deleted");
                            resolve(result);
                        }
                    });
                });

                // Use Promise.all to wait for all delete operations to finish
                Promise.all([deleteImages, deleteSets, deleteCaptures])
                    .then(() => {
                        console.log("All collections have been deleted");
                    })
                    .catch((err) => {
                        console.log("Error during deletion process:", err);
                    })
                    .finally(() => {
                        // Close the client after all operations
                        client.close();
                        console.log("Database connection closed");
                    });
            }
        });

    }



} else {
    console.log(`config.json file does not exist at ${configFilePath}.` );
}
