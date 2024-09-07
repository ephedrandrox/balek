const fs = require('fs');

const os = require('os');
const qrcode = require("qrcode-terminal");


const ownerDeviceFilePath = './src/balek-server/etc/ownerDevice.json';


if (fs.existsSync(ownerDeviceFilePath)) {
    //read it
    const ownerDeviceJSONData = JSON.parse(fs.readFileSync(ownerDeviceFilePath, 'utf8'));
    if (ownerDeviceJSONData.ownerPublicKey){

        console.log(`Removing Owning device ${ownerDeviceJSONData.ownerPublicKey}`);

        if(ownerDeviceJSONData.ownerPublicKey){
            console.log('Owner Device with Public Key:');
            console.log(ownerDeviceJSONData.ownerPublicKey)
        }else{
            console.log('Owner Device public key does not exist. - try resetting database and deleting ownerDevice.json');
        }
    }
    // File exists - remove it
    console.log('Removing Owner Device Record');
    fs.unlinkSync(ownerDeviceFilePath);
} else {
    console.log('ownerDevice.json file does not exist.');
}
