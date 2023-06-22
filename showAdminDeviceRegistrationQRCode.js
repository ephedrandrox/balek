const fs = require('fs');
const qrcode = require('qrcode-terminal');

const os = require('os');

const providedHostname = process.argv[2];

let hostname = providedHostname || os.hostname();

const ownerDeviceFilePath = './src/balek-server/etc/ownerDevice.json';
const configFilePath = './src/balek-server/etc/config.json';


if (fs.existsSync(ownerDeviceFilePath)) {
    // File exists
    const ownerDeviceJSONData = JSON.parse(fs.readFileSync(ownerDeviceFilePath, 'utf8'));
    const configJSONData = JSON.parse(fs.readFileSync(configFilePath, 'utf8'));

    if (configJSONData && configJSONData["Network Settings"] && configJSONData["Network Settings"].Hostname)
    {
        hostname = configJSONData["Network Settings"].Hostname
    }

    if (ownerDeviceJSONData.ownerClaimKey){
        const url = "Digiscan://" + hostname +"/ownerClaim/"+ ownerDeviceJSONData.ownerClaimKey;

        // Generate QR code for the key
        qrcode.generate(url, { small: true }, function (qrcode) {
            console.log('This Instance has not been claimed:');
            console.log('QR Code for the key:');
            console.log(qrcode);
        });
    }else {
        console.log('ownerClaimKey file does not exist.');
        if(ownerDeviceJSONData.ownerPublicKey){
            console.log('Owner Device Public Key:');
            console.log(ownerDeviceJSONData.ownerPublicKey)
        }else{
            console.log('Owner Device public key does not exist. - try resetting database and deleting ownerDevice.json');
        }
    }

} else {
    console.log('ownerDevice.json file does not exist.');
}
