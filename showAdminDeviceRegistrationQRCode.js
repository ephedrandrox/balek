const fs = require('fs');
const qrcode = require('qrcode-terminal');

const os = require('os');

const providedHostname = process.argv[2];

const hostname = providedHostname || os.hostname();

const filePath = './src/balek-server/etc/ownerDevice.json';

if (fs.existsSync(filePath)) {
    // File exists
    const jsonData = JSON.parse(fs.readFileSync(filePath, 'utf8'));

    if (jsonData.ownerClaimKey){
        const url = "Digiscan://" + hostname +"/ownerClaim/"+ jsonData.ownerClaimKey;

        // Generate QR code for the key
        qrcode.generate(url, { small: true }, function (qrcode) {
            console.log('This Instance has not been claimed:');
            console.log('QR Code for the key:');
            console.log(qrcode);
        });
    }else {
        console.log('ownerDevice.json file does not exist.');
        if(jsonData.ownerPublicKey){
            console.log('Owner Device Public Key:');
            console.log(jsonData.ownerPublicKey)
        }else{
            console.log('Owner Device public key does not exist. - try resetting database and deleting ownerDevice.json');
        }
    }

} else {
    console.log('ownerDevice.json file does not exist.');
}
