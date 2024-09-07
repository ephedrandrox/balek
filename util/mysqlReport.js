const fs = require('fs');

const os = require('os');


const mysql = require('mysql2');

const configFilePath = './src/balek-server/etc/config.json';


let mysqlHost = "";
let mysqlUser = "";
let mysqlPassword = "";
let mysqlDatabase = "";


if (fs.existsSync(configFilePath)) {
    // File exists
    const configJSONData = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

    if (configJSONData["Database Settings"] && configJSONData["Database Settings"]["MySQL Database Connection"]
    && configJSONData["Database Settings"]["MySQL Database Connection"].host && configJSONData["Database Settings"]["MySQL Database Connection"].user
    && configJSONData["Database Settings"]["MySQL Database Connection"].password && configJSONData["Database Settings"]["MySQL Database Connection"].database)
    {
        mysqlHost = configJSONData["Database Settings"]["MySQL Database Connection"].host
         mysqlUser = configJSONData["Database Settings"]["MySQL Database Connection"].user
         mysqlPassword = configJSONData["Database Settings"]["MySQL Database Connection"].password
        mysqlDatabase = configJSONData["Database Settings"]["MySQL Database Connection"].database
    }

    if (hostname && mysqlHost && mysqlUser && mysqlPassword && mysqlDatabase) {
        console.log('Configuration Report:');
        console.log('Hostname:', hostname);
        console.log('MySQL Host:', mysqlHost);
        console.log('MySQL User:', mysqlUser);
        console.log('MySQL Password:', mysqlPassword);
        console.log('MySQL Database:', mysqlDatabase);

        //connect and list tables in database
        const connection = mysql.createConnection({
            host: mysqlHost,
            user: mysqlUser,
            password: mysqlPassword,
            database: mysqlDatabase
        });

        connection.connect();

        connection.query('SHOW TABLES', function (error, results, fields) {
            if (error) throw error;
            console.log('Tables in Database:');
            console.log(results);
        });

        //show rows in users table converting permission_groups to text from Buffer

        connection.query('SELECT * FROM users', function (error, results, fields) {
            if (error) throw error;
            console.log('Rows in Users Table:');

            results.forEach((row) => {
                if (row.permission_groups) {
                    row.permission_groups = row.permission_groups.toString();
                }
            });

            console.log(results);
        });

        connection.end();
    }




} else {
    console.log(`config.json file does not exist at ${configFilePath}.` );
}
