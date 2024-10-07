let mysql = require("./mysql");
function getUserKey(userName) {
  return new Promise((resolve, reject) => {
    let connectionPromise = mysql.getMySQLConnection();

    connectionPromise.then((connection) => {
      connection.connect();

      connection.query(
        `SELECT *
                 FROM users
                  WHERE name = '${userName}'`,
        function (error, results, fields) {
          if (error) throw error;
          if (results.length === 0) {
            reject("No user found with the given UserName");
          }
          if (results[0] && results[0].userKey) {
            resolve(results[0].userKey);
          } else {
            reject("No userKey found for the given UserName");
          }
        }
      );

      connection.end();
    });
  });
}

module.exports = {
  getUserKey,
};
