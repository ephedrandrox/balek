define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/topic',

        'dojo/Stateful',
        'balek-modules/balekute/connect/Controller/Invitation',
        'balek-modules/balekute/connect/Controller/Device',
        'balek-modules/balekute/connect/Controller/Target',

        'balek-modules/balekute/connect/Database/devices',

        'balek-server/users/usersController/instanceCommands',

        'dojo/node!qrcode-terminal',
        "dojo/node!fs",
        'dojo/node!crypto',
        'dojo/node!os'


    ],
    function (declare, lang, topic, Stateful, Invitation, Device, Target, devicesDatabase,
              UsersControllerInstanceCommands,
              qrcode, fsNodeObject, crypto, os
 ) {
        return declare("balekuteConnectController", null, {
            _module: null,

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
            constructor: function (args) {
                declare.safeMixin(this, args);

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
                console.log("balekuteConnectController  starting...");

                this.loadOrCreateOwnerDeviceInvitation().then(lang.hitch(this, function(Result) {
                    if(Result.ownerClaimKey){
                        qrcode.generate("Digiscan://"+ os.hostname() +"/ownerClaim/"+
                            Result.ownerClaimKey, {small: true}, lang.hitch(this, function(invitationCode){
                            console.log(invitationCode)
                            this.statusAsState.set("hasOwnerDevice", false)
                        }))
                    }else {
                        this.statusAsState.set("hasOwnerDevice", true)
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
                const ownerClaimFile = this._ownerClaimFileLocation
                const newData = { ownerClaimKey: String(crypto.randomUUID()) };
                fsNodeObject.writeFileSync(ownerClaimFile, JSON.stringify(newData));

                this._ownerClaimKey = newData.ownerClaimKey

                return this._ownerClaimKey
            },
            loadOrCreateOwnerDeviceInvitation: function(){
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                   {
                       const ownerClaimFile = this._ownerClaimFileLocation

                       this.readJSONFromFile(ownerClaimFile).then(lang.hitch(this, function (parsedJSON){
                           if (parsedJSON.ownerClaimKey){
                              Resolve({ownerClaimKey: this.resetOwnerClaimKey()})
                           }
                           else if (parsedJSON.ownerPublicKey){
                               this._ownerPublicKey = parsedJSON.ownerPublicKey
                               Resolve({ownerPublicKey: parsedJSON.ownerPublicKey})
                           }
                       })).catch(lang.hitch(this, function (error){
                           console.log('Error Occured:', error);
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
                    console.log(this._targets,this._targetsBySessionKey, newTargetKey, sessionKey)
                    this._targets[newTargetKey.toString()] = newTarget
                    this._targetsBySessionKey[sessionKey.toString()] = newTarget
                }

                return newTarget
            },
            createInvitation: function (input) {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (input === null) {
                        //Make sure that the Interface sent a conversationContent Object
                            Reject({error: "input === null"});
                    } else {
                        //Make sure that the invitationContent Object is structured correctly
                        if(input && input.owner && input.owner.userKey)
                        {
                            //New Invitation Created!

                            if(input.invitationKey){
                                let newInvitation = Invitation({key: input.invitationKey, owner: input.owner, host: input.host, _connectController: this, _module: this._module});
                            }else
                            {
                                let newInvitation = Invitation({owner: input.owner, host: input.host, _connectController: this, _module: this._module});
                            }

                            let newInvitationKey = newInvitation.getKey()
                            if(newInvitationKey !== null)
                            {

                                //Add it to the invitations array
                                this._invitations[newInvitationKey.toString()]  = newInvitation;
                                //add to all users lists:
                                Resolve({result: "success", newKey: newInvitationKey});
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

                        if(this._invitations[invitationKey]){
                            let invitation = this._invitations[invitationKey]

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
                            if (ownerClaimKey === this._ownerClaimKey ) {//isTheAdminKey){
                             //If there is no owner Device and the claim key matches
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
                console.log("_devicesBySigningKey", publicSigningKey, this._devicesBySigningKey, this._devicesBySigningKey[publicSigningKey.toString()])
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
                    console.log("Balekute Connect Loading Devices", Result)
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
            }
        });
    }
);
