//Arguments should be in --key=value format
//read arguments UserName PublicKey KeychainIdentifier Signature Name OSName Hostname
let getUserKey = require("./getUserKey");
let mongoClient = require("./mongo");
//function that reads arguments and returns an object
function readArgs(args) {
  var obj = {};
  for (var i = 0; i < args.length; i++) {
    var arg = args[i].split("=");
    obj[arg[0]] = arg.slice(1).join("=");
  }
  return obj;
}

let argObject = readArgs(process.argv.slice(2));

//check that Name, OSName, Hostname, UserName PublicKey KeychainIdentifier Signature are present in argObject

if (
  !argObject.UserName ||
  !argObject.PublicKey ||
  !argObject.KeychainIdentifier ||
  !argObject.Signature ||
  !argObject.Name ||
  !argObject.OSName ||
  !argObject.Hostname
) {
  console.log(
    "expecting arguments UserName PublicKey KeychainIdentifier Signature Name OSName Hostname"
  );
  console.log(
    `example: 
    node util/database/addDevice.js \\
    UserName=Owner \\
    PublicKey="-----BEGIN PUBLIC KEY-----\\nMFkwEwYHKoZIzjqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA7Vd6T/tgZw2vWVQ3NpZX\\nE5yFgdDKF9K5Q09jFZDv0SBYQGmxfBCLHSczN+weAvOSkhU71EPUOQK5I8OYpt==\\n-----END PUBLIC KEY-----" \\
    KeychainIdentifier=com.digivigil.balekute.device.devicehost.local \\
    Signature=OISEOI2345W98785B2RHESSSWUQNJDKJS \\
    Name=iPhone \\
    OSName=iOS \\
    Hostname=devicehost.local`
  );
  console.log(argObject);
  process.exit(1);
}
console.log(`Getting Userkey for ${argObject.UserName}`);
let userKeyPromise = getUserKey.getUserKey(argObject.UserName);
let publicKey = argObject.PublicKey.replace(/\\n/g, "\n") // Replace \n with actual newlines
  .replace(/\\"/g, '"'); // Replace \" with actual double quotes

userKeyPromise
  .then((userKey) => {
    console.log("Found UserKey:", userKey);
    mongoClient
      .getMongoConnection()
      .then((client) => {
        const db = client.db("balek");
        const collection = db.collection("BalekuteDevices");
        let deviceContent = {
          _id: publicKey,
          _userKey: userKey,
          deviceContent: {
            owner: {
              userKey: userKey,
            },
            deviceInfo: {
              name: argObject.Name,
              osName: argObject.OSName,
              keychainIdentifier: argObject.KeychainIdentifier,
              publicSigningKey: publicKey,
              hostname: argObject.Hostname,
              signature: argObject.Signature,
            },
          },
        };
        console.log(`Adding ${argObject.Name} to the database`);
        collection.insertOne(deviceContent, function (err, res) {
          if (err) {
            //if duplicate key error, tell the user
            if (err.code === 11000) {
              console.log(
                `Device with the public key ${publicKey} already exists in the database`
              );
            } else {
              console.log(`Error adding device to the database, ${err}`);
            }

            client.close();
            process.exit(1);
          } else {
            console.log("Device Added Successfully");
            client.close();
            process.exit(0);
          }
        });
      })
      .catch((error) => {
        console.log("Error:", error);
        process.exit(1);
      });
  })
  .catch((error) => {
    console.log("Error:", error);
    process.exit(1);
  });
