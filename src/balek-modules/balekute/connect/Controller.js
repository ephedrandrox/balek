
define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/topic',

        'dojo/Stateful',
        'balek-modules/balekute/connect/Controller/Invitation',
        'balek-modules/balekute/connect/Controller/Device',
        'balek-modules/balekute/connect/Controller/Target',

        'balek-modules/balekute/connect/Database/devices',

        'balek-modules/balekute/connect/Controller/instanceCommands',

        'balek-server/users/usersController/instanceCommands',
        'balek-server/session/sessionsController/instanceCommands',


        'dojo/node!qrcode-terminal',
        "dojo/node!fs",
        'dojo/node!crypto',
        'dojo/node!os'


    ],
    function (declare, lang, topic, Stateful, Invitation, Device, Target, devicesDatabase,
              InstanceCommands,
              UsersControllerInstanceCommands,SessionsControllerInstanceCommands,
              qrcode, fsNodeObject, crypto, os
 ) {
        return declare("balekuteConnectController", null, {
            _module: null,

            _instanceCommands: null,

            _invitations: null,
            _invitationStates: null,

            _devices: null,
            _devicesBySigningKey: null,
            _devicesDatabase: null,

            _targets: null,
            _targetsBySessionKey: null,

            _ownerClaimKey: null,
            _ownerPublicKey: null,
            _ownerClaimFileLocation: "./src/balek-server/etc/ownerDevice.json",

            statusAsState: null,
            usersControllerCommands: null,
            sessionsControllerCommands: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._instanceCommands = new InstanceCommands();
                this._instanceCommands.setCommand("getDeviceByPublicSigningKey", lang.hitch(this,this.getDeviceByPublicSigningKey));
                this._instanceCommands.setCommand("verifySignedString", lang.hitch(this,this.verifySignedString));

                this._instanceCommands.setCommand("getStringHash", lang.hitch(this,this.getStringHash));


                this._instanceCommands.initialize();


                let sessionsControllerInstanceCommands = new SessionsControllerInstanceCommands();
                this.sessionsControllerCommands = sessionsControllerInstanceCommands.getCommands();

                let usersControllerInstanceCommands = new UsersControllerInstanceCommands();
                this.usersControllerCommands = usersControllerInstanceCommands.getCommands();

                this._invitations = {};
                this._invitationStates = {}

                this._devices = {} //probably delete this
                this._devicesBySigningKey = {}

                this._targets = {}
                this._targetsBySessionKey = {}

                let StatusState = declare([Stateful], {});

                this.statusAsState = new StatusState({});

                if(this._module === null){
                    console.log("balekuteConnectController  Cannot Start!...");
                }

                this._devicesDatabase = new devicesDatabase({_instanceKey: this._instanceKey});

                this.loadDevices()

                this.loadOrCreateOwnerDeviceInvitation().then(lang.hitch(this, function(Result) {
                    if(Result.ownerClaimKey){
                    //If there is an owner Claim key then waiting to be claimed
                        console.log("📱 No Owner Device")
                        this.statusAsState.set("hasOwnerDevice", false)
                    }else if(Result.ownerPublicKey){
                        console.log(`📱 Owner Device Public Key: \n 🔑${Result.ownerPublicKey}🔑`)

                        this.statusAsState.set("hasOwnerDevice", true)
                    } else {
                        console.log("📱 No Owner Device")
                        this.statusAsState.set("hasOwnerDevice", false)
                    }
                }))

            },
            readJSONFromFile: function(fileLocation) {
            return new Promise((resolve, reject) => {
                fsNodeObject.readFile(fileLocation, 'utf8', (err, data) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    try {
                        const json = JSON.parse(data);
                        resolve(json);
                    } catch (error) {
                        reject(error);
                    }
                });
            });
        },
            //Interface Commands:

            resetOwnerClaimKey: function(){
                //Reset the owner claim key
                //Overwrite the ownerClaimKey file with a new key
                //Set to class member and return the new key

                const ownerClaimFile = this._ownerClaimFileLocation
                const newData = { ownerClaimKey: String(crypto.randomUUID()) };
                fsNodeObject.writeFileSync(ownerClaimFile, JSON.stringify(newData));

                this._ownerClaimKey = newData.ownerClaimKey

                return this._ownerClaimKey
            },
            loadOrCreateOwnerDeviceInvitation: function(){
                //Attempt to read the ownerClaimKey file
                //If it exists, check if the ownerClaimKey exists
                //If it does, reset the ownerClaimKey and return it
                //If it does not, check if the ownerPublicKey exists
                //If it does, set the ownerPublicKey and return it
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                   {
                       this.readJSONFromFile(this._ownerClaimFileLocation).then(lang.hitch(this, function (parsedJSON){
                           // If there is an owner claim key then waiting to be claimed
                           if (parsedJSON.ownerClaimKey){
                               Resolve({ownerClaimKey: this.resetOwnerClaimKey()})
                           }// If there is an owner public key then it has been claimed
                           else if (parsedJSON.ownerPublicKey){
                               this._ownerPublicKey = parsedJSON.ownerPublicKey
                               Resolve({ownerPublicKey: parsedJSON.ownerPublicKey})
                           }
                       })).catch(lang.hitch(this, function (error){
                           // console.log('Error Occurred:', error);
                           // This will occur if the file does not exist
                           Resolve({ownerClaimKey: this.resetOwnerClaimKey()})
                       }))

                   }
                }));
            },
            updateOwnerClaimFile: function(publicKey){
                return new Promise(lang.hitch(this, function (Resolve, Reject) {

                        const ownerClaimFile = this._ownerClaimFileLocation
                        const newData = { ownerPublicKey: String(publicKey) };
                        fsNodeObject.writeFileSync(ownerClaimFile, JSON.stringify(newData));

                        this.readJSONFromFile(ownerClaimFile).then(lang.hitch(this, function (parsedJSON){
                            if (parsedJSON.ownerPublicKey){
                                this._ownerPublicKey = parsedJSON.ownerPublicKey
                                this._ownerClaimKey = null
                                Resolve({ownerPublicKey: parsedJSON.ownerPublicKey})
                            }else{
                                Reject({error: "File did not save properly: updateOwnerClaimFile"})
                            }
                        })).catch(lang.hitch(this, function (error){
                            Reject({error: error, description: "File did not save properly: updateOwnerClaimFile"})
                        }))
                }));
            },

            createTarget: function(sessionKey){
                let newTarget = Target({_connectController: this, _module: this._module,
                sessionKey: sessionKey})


                let newTargetKey = newTarget.getKey()
                if(newTargetKey !== null) {

                    this._targets[newTargetKey.toString()] = newTarget
                    this._targetsBySessionKey[sessionKey.toString()] = newTarget
                }

                return newTarget
            },
            createInvitation: function (input) {
                let newInvitation = null;
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (input === null) {
                        //Make sure that the Interface sent a conversationContent Object
                            Reject({error: "input === null"});
                    } else {
                        //Make sure that the invitationContent Object is structured correctly
                        if(input && input.owner && input.owner.userKey)
                        {
                            //New Invitation Created!
                            console.log("new Invitation being created", input, input.owner, input.owner.userKey)
                            if(input.invitationKey){
                                console.log("Key Provided ", input.invitationKey)

                                newInvitation = Invitation({key: input.invitationKey,
                                    owner: input.owner,
                                    host: input.host,
                                    _connectController: this,
                                    _module: this._module});
                            }else
                            {
                                console.log("No Key Provided ")

                                newInvitation = Invitation({owner: input.owner,
                                    host: input.host,
                                    _connectController: this,
                                    _module: this._module});
                            }
                            console.log("New Key Created ", newInvitation.getKey())

                            let newInvitationKey = newInvitation.getKey()
                            if(newInvitationKey !== null)
                            {
                                console.log("adding to list ", newInvitation.getKey())

                                //Add it to the invitations array
                                this._invitations[newInvitationKey.toString()]  = newInvitation;
                                //add to all users lists:
                                console.log("resolving", newInvitation.getKey())

                                Resolve({result: "success", newKey: newInvitationKey});
                                console.log("resolved", newInvitation.getKey())

                            }else {
                                //no key, no go
                                Reject({error: "new invitation could not produce key."});
                            }
                        }else
                        {
                            Reject({error: "input has no owner or userKey.", input});
                        }
                    }
                }));
            },
            userAcceptDeviceInfo: function(input)
            {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    let owner = input.owner
                    let invitationKey = input.invitationKey
                    if (typeof owner === 'undefined' || typeof invitationKey === 'undefined' ) {
                        Reject({error: "owner or invitationKey === undefined"});
                    } else {
                        //if the invitation exists
                        if(this._invitations[invitationKey]){
                            let invitation = this._invitations[invitationKey]
                            //get the invitation and call the
                            if ( typeof invitation.userAcceptsDevice === 'function') {
                                let invitationStatus = invitation.userAcceptsDevice(owner, invitationKey);
                                if( invitationStatus == "accepted" )
                                {
                                    console.log("invitation Key Used and device accepted", invitationKey)
                                    Resolve({invitationKey: invitationKey, status: invitationStatus});
                                }else{
                                    Reject({error: "Not Accepted", status : invitationStatus});
                                }
                            }else{
                                Reject({error: "Invitation can not use key!"});
                            }
                        }else{
                            Reject({error: "Invitation is not available"});
                        }
                    }
                }));
            },
            authenticateSessionForDeviceUser: function (timeSignProof, deviceInfo, sessionKey){
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (deviceInfo && deviceInfo.publicSigningKey && timeSignProof)
                    {
                        let device = this.getDeviceByPublicSigningKey(deviceInfo.publicSigningKey)
                        if (device && typeof device.getOwnerUserKey === 'function'){
                            let userKey = device.getOwnerUserKey()

                            if (userKey !== null) {
                                //check that the signature matches the timestamp and device info
                                //and get the user key from our stored device info for that public key
                                this.sessionsControllerCommands.setSessionCredentials(sessionKey, userKey)
                                Resolve({success: {timeSignProof: timeSignProof,
                                        deviceInfo: deviceInfo,
                                        userKey: userKey}})
                            } else {
                                Reject({error: "Connect Controller: No User assigned to Device",
                                    arguments: {timeSignProof: timeSignProof,
                                        deviceInfo: deviceInfo,
                                    }});
                            }
                        }else {
                            Reject({error: "Connect Controller: No Known Device",
                                arguments: {timeSignProof: timeSignProof,
                                    deviceInfo: deviceInfo}});
                        }
                    }else{
                        Reject({error: "Connect Controller: authenticateSessionForDeviceUser bad arguments",
                            arguments: {timeSignProof: timeSignProof,
                                deviceInfo: deviceInfo}});
                    }
                    }));
            },
            useOwnerClaimKey: function (ownerClaimKey, deviceInfo) {
                //THis is called when a user wants to claim the server
                //This is expected to be done once and the owner user
                //will be created the first time an ownerClaimKey is used.
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (ownerClaimKey === null) {
                        Reject({error: "invitationKey === null"});
                    } else {
                        let hasOwnerDevice = this.statusAsState.get("hasOwnerDevice")
                        if(!hasOwnerDevice ) {
                            if (ownerClaimKey === this._ownerClaimKey && deviceInfo.publicSigningKey ) {
                             //If there is no owner Device and the claim key matches and device has a public signing key
                                this.usersControllerCommands.getOwnerUser().then(lang.hitch(this, function (ownerUser){
                                    //we got our user, if one is already made, we get the id, if one doesn't exist
                                    //it is made and we receive the id

                                    // If the Device Info has a Public Signing Key
                                    // Then Set device to owner
                                    if (deviceInfo.publicSigningKey && ownerUser.userKey){
                                        //should check this before getting owner user
                                        this.createDevice({owner: {userKey: ownerUser.userKey},
                                            deviceInfo: deviceInfo }).then(lang.hitch(this, function(Result) {
                                                this.updateOwnerClaimFile(deviceInfo.publicSigningKey)
                                            this.statusAsState.set("hasOwnerDevice", true)
                                            Resolve(Result)
                                        })).catch(lang.hitch(this, function(error) {
                                            Reject({error: error})
                                        }))
                                    }else {
                                        Reject({error: "Device Info or ownerUser not as expected"})
                                    }
                                })).catch(lang.hitch(this, function (error){
                                    Reject({error: error})
                                }))
                            } else {
                                Reject({error: "Admin Set Key is not available"});
                            }
                        }else {
                            Reject({error: "Admin Device Already Set"});
                        }
                    }
                }));
            },
            useInvitationKey: function (invitationKey, deviceInfo) {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (invitationKey === null) {
                        Reject({error: "invitationKey === null"});
                    } else {

                        if(this._invitations[invitationKey]){

                            let invitation = this._invitations[invitationKey]
                            let invitationState = invitation.getStatusState()

                            let invitationStateStatus = invitationState.get("status")

                            if ( typeof invitation.useKey === 'function' &&
                                invitationStateStatus == "waiting") {
                                let invitationStatus = invitation.useKey(invitationKey, deviceInfo);
                                if( invitationStatus == "used" )
                                {
                                    console.log("invitation Key Used", deviceInfo)
                                    Resolve({invitationKey: invitationKey, status: invitationStatus});
                                }else{
                                     console.log("‼️‼️😅😅😅😅 Key exists but not composed properly", invitationKey, invitationState);
                                    Reject({error: "Not Accepted", status : invitationStatus});
                                }
                            }else{
                                console.log("‼️‼️😅😅😅😅 Key exists but wasn't used, probably bad state", invitationKey, invitationState);
                                Reject({error: "Invitation can not use key!"});
                            }
                        }else{
                            console.log("😅😅😅😅 Invitation Key Not FOUND")
                            Reject({error: "Invitation is not available"});
                        }
                    }
                }));
            },
            useTargetKey: function (targetKey, signature, deviceInfo) {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (targetKey === null) {
                        Reject({error: "targetKey === null"});
                    } else {

                        if(this._targets[targetKey]){
                            let target = this._targets[targetKey]

                            if ( typeof target.useKey === 'function') {
                                console.log("Controller useTargetKey" )

                                target.useKey(targetKey, signature, deviceInfo)
                                    .then(lang.hitch(this, function (targetStatus){
                                        console.log("targetStatus Success" )
                                        if( targetStatus == "Success" )
                                        {
                                            console.log("target Key Used", deviceInfo)
                                            delete this._targets[targetKey]
                                            Resolve({targetKey: targetKey, status: targetStatus});
                                        }else{
                                            Reject({error: "Not Accepted", status : targetStatus});
                                        }
                                    }))
                                    .catch(lang.hitch(this,function (Error){
                                        console.log("😅😅😅😅😅 targetStatus Error", Error )
                                        Reject({error: "useTargetKey", status : Error});
                                    }));

                            }else{
                                Reject({error: "Target can not use key!"});
                            }



                        }else{
                            Reject({error: "Target is not available"});
                        }
                    }
                }));
            },
            //Instance Commands

            getInvitationState: function(invitationKey){
                if(this._invitations[invitationKey] && typeof this._invitations[invitationKey].getStatusState === 'function' )
                {
                    return this._invitations[invitationKey].getStatusState()
                }else {
                    return undefined
                }
            },

            getDeviceByPublicSigningKey: function(publicSigningKey){
                if(this._devicesBySigningKey[publicSigningKey.toString()]
                    && typeof this._devicesBySigningKey[publicSigningKey.toString()].getDeviceIdentifier === 'function' )
                {
                    return this._devicesBySigningKey[publicSigningKey.toString()]
                }else {
                    return undefined
                }
            },

            loadDevices: function(){
                this._devicesDatabase.getDevices().then(lang.hitch(this, function(Result){
                    // console.log("Balekute Connect Loading Devices", Result)
                    if(Array.isArray(Result)){
                        Result.forEach(lang.hitch(this, function(deviceEntry){
                            if(deviceEntry.deviceContent && deviceEntry.deviceContent.owner && deviceEntry.deviceContent.owner.userKey
                                && deviceEntry.deviceContent.deviceInfo && deviceEntry.deviceContent.deviceInfo.publicSigningKey) {

                                let newDevice = Device({owner: deviceEntry.deviceContent.owner,
                                    deviceInfo: deviceEntry.deviceContent.deviceInfo,
                                    _connectController: this, _module: this._module});
                                let newDeviceKey = newDevice.getKey()
                                let newDevicePublicSigningKey = newDevice.getPublicSigningKey()
                                this._devices[newDeviceKey.toString()]  = newDevice;
                                this._devicesBySigningKey[newDevicePublicSigningKey.toString()] = newDevice

                            }
                        }))
                    }
                })).catch(lang.hitch(this, function(Error){
                    console.log("getDevices  Error ❌❌❌ ", Error)
                }))

            },
            createDevice: function (input) {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (input === null) {
                        //Make sure that the Interface sent an input Object
                        Reject({error: "input === null"});
                    } else {
                        //Make sure that the input Object is structured correctly
                        if(input && input.owner && input.owner.userKey
                            && input.deviceInfo && input.deviceInfo.publicSigningKey)
                        {
                            //New Device Created!
                            console.log("NewUserDevice 🔆🔆🔆 ", input)
                           //todo check that device doesn't already exist
                            //if it does, error will be received
                            let newDevice = Device({owner: input.owner,
                                deviceInfo: input.deviceInfo,
                                _connectController: this, _module: this._module});
                            let newDeviceKey = newDevice.getKey()
                            let newDevicePublicSigningKey = newDevice.getPublicSigningKey()
                            if(newDeviceKey !== null)
                            {


                                this._devicesDatabase.newUserDevice(input).then(lang.hitch(this, function(Result){
                                    console.log("NewUserDevice 🔆🔆🔆 ", Result)

                                })).catch(lang.hitch(this, function(Error){
                                    console.log("NewUserDevice  Error ❌❌❌ ", Error)
                                }))

                                //Add it to the devices arrays
                                this._devices[newDeviceKey.toString()]  = newDevice;
                                this._devicesBySigningKey[newDevicePublicSigningKey.toString()] = newDevice


                                Resolve({result: "success", newKey: newDeviceKey});
                            }else {
                                //no key, no go
                                Reject({error: "new invitation could not produce key."});
                            }
                        }else
                        {
                            Reject({error: "input has no owner, publicKey, deviceName, or userKey.", input});
                        }
                    }
                }));
            },
            getStringHash: function(stringToCheck){
               return crypto.createHash('sha256').update(stringToCheck).digest('hex');

            },
            verifySignedString: function(stringToVerify, signature, publicKey)
            {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {


                    if (typeof stringToVerify === 'string' &&
                        typeof signature === 'string' &&
                        typeof publicKey === 'string' ) {

                        const message = Uint8Array.from(Buffer.from(stringToVerify, 'utf8'))
                        const publicKeyBuf = new Buffer.from(publicKey.toString('ascii'), 'ascii')
                        const signatureBuf = new Buffer.from(atob(signature), 'ascii')
                        const verifier = crypto.createVerify('sha256')

                        verifier.update(message, 'utf8')

                        const result = verifier.verify(publicKeyBuf, signatureBuf)

                        if (result) {
                            Resolve("Success")
                        } else {
                            Reject({Error: "Verification Failed" })
                        }
                    } else {
                        Reject({Error: "Failed: verifySignedString expects three strings" })
                    }
                }))
            }
        });
    }
);
