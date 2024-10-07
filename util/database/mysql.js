//expects Username to be the first argument
const fs = require("fs");

const os = require("os");

const mysql = require("mysql2");

const configFilePath = "./src/balek-server/etc/config.json";

let mysqlHost = "";
let mysqlUser = "";
let mysqlPassword = "";
let mysqlDatabase = "";

function getMySQLConnection() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(configFilePath)) {
      // File exists
      const configJSONData = JSON.parse(
        fs.readFileSync(configFilePath, "utf8")
      );

      if (
        configJSONData["Database Settings"] &&
        configJSONData["Database Settings"]["MySQL Database Connection"] &&
        configJSONData["Database Settings"]["MySQL Database Connection"].host &&
        configJSONData["Database Settings"]["MySQL Database Connection"].user &&
        configJSONData["Database Settings"]["MySQL Database Connection"]
          .password &&
        configJSONData["Database Settings"]["MySQL Database Connection"]
          .database
      ) {
        mysqlHost =
          configJSONData["Database Settings"]["MySQL Database Connection"].host;
        mysqlUser =
          configJSONData["Database Settings"]["MySQL Database Connection"].user;
        mysqlPassword =
          configJSONData["Database Settings"]["MySQL Database Connection"]
            .password;
        mysqlDatabase =
          configJSONData["Database Settings"]["MySQL Database Connection"]
            .database;
      }

      if (mysqlHost && mysqlUser && mysqlPassword && mysqlDatabase) {
        //connect and list tables in database
        const connection = mysql.createConnection({
          host: mysqlHost,
          user: mysqlUser,
          password: mysqlPassword,
          database: mysqlDatabase,
        });

        resolve(connection);
      } else {
        console.log("MySQL Configuration is not complete");
        console.log("Configuration Report:");
        console.log("MySQL Host:", mysqlHost);
        console.log("MySQL User:", mysqlUser);
        console.log("MySQL Password:", mysqlPassword);
        console.log("MySQL Database:", mysqlDatabase);

        reject("MySQL Configuration is not complete");
      }
    } else {
      console.log("Configuration file not found");
      reject("Configuration file not found");
    }
  });
}

module.exports = {
  getMySQLConnection,
};
