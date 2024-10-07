const fs = require("fs");

const os = require("os");

const mongodb = require("mongodb");

const configFilePath = "./src/balek-server/etc/config.json";

let mongoHost = "";
let mongoPort = "";
let mongoDatabase = "";
let mongoUser = "";
let mongoPassword = "";

function getMongoConnection() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(configFilePath)) {
      // File exists
      const configJSONData = JSON.parse(
        fs.readFileSync(configFilePath, "utf8")
      );

      if (
        configJSONData["Network Settings"] &&
        configJSONData["Network Settings"].Hostname
      ) {
        hostname = configJSONData["Network Settings"].Hostname;
      }
      if (
        configJSONData["Database Settings"] &&
        configJSONData["Database Settings"]["Mongo Database Connection"] &&
        configJSONData["Database Settings"]["Mongo Database Connection"].host &&
        configJSONData["Database Settings"]["Mongo Database Connection"].port &&
        configJSONData["Database Settings"]["Mongo Database Connection"].user &&
        configJSONData["Database Settings"]["Mongo Database Connection"]
          .password &&
        configJSONData["Database Settings"]["Mongo Database Connection"]
          .database
      ) {
        mongoHost =
          configJSONData["Database Settings"]["Mongo Database Connection"].host;
        mongoPort =
          configJSONData["Database Settings"]["Mongo Database Connection"].port;
        mongoUser =
          configJSONData["Database Settings"]["Mongo Database Connection"].user;
        mongoPassword =
          configJSONData["Database Settings"]["Mongo Database Connection"]
            .password;
        mongoDatabase =
          configJSONData["Database Settings"]["Mongo Database Connection"]
            .database;
      }

      if (
        hostname &&
        mongoHost &&
        mongoPort &&
        mongoUser &&
        mongoPassword &&
        mongoDatabase
      ) {
        //connect and list collections in database
        const mongoURL = `mongodb://${mongoUser}:${mongoPassword}@${mongoHost}:${mongoPort}`;
        const client = new mongodb.MongoClient(mongoURL, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });

        resolve(client);
      } else {
        reject("Mongo Configuration is not complete");
        console.log("Configuration Report:");
        console.log("Hostname:", hostname);
        console.log("Mongo Host:", mongoHost);
        console.log("Mongo Port:", mongoPort);
        console.log("Mongo User:", mongoUser);
        console.log("Mongo Password:", mongoPassword);
        console.log("Mongo Database:", mongoDatabase);
      }
    } else {
      reject("Configuration file not found");
    }
  });
}

module.exports = { getMongoConnection };
