define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/topic',

        'dojo/Stateful',
        'balek-modules/balekute/connect/Controller/Invitation',
        'balek-modules/balekute/connect/Controller/Device',
        'balek-modules/balekute/connect/Controller/Target',

        'balek-modules/balekute/connect/Database/devices'


    ],
    function (declare, lang, topic, Stateful, Invitation, Device, Target, devicesDatabase
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

            statusAsState: null,

            mongoConnection: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                this._invitations = {};
                this._invitationStates = {}

                this._devices = {} //probably delete this
                this._devicesBySigningKey = {}

                this._targets = {}
                this._targetsBySessionKey = {}

                let StatusState = declare([Stateful], {});

                this.statusAsState = new StatusState({});

                if(this._module === null){
                    console.log("diaplodeConversationsController  Cannot Start!...");
                }

                this._devicesDatabase = new devicesDatabase({_instanceKey: this._instanceKey});

                this.loadDevices()
                console.log("diaplodeConversationsController  starting...");
            },
            //Interface Commands:

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
                        //Make sure that the conversationContent Object is structured correctly
                        if(input && input.owner && input.owner.userKey)
                        {
                            //New Conversation Created!
                            let newInvitation = Invitation({owner: input.owner, host: input.host, _connectController: this, _module: this._module});
                            let newInvitationKey = newInvitation.getKey()
                            if(newInvitationKey !== null)
                            {

                                //Add it to the conversations array
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
            useInvitationKey: function (invitationKey, deviceInfo) {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (invitationKey === null) {
                        Reject({error: "invitationKey === null"});
                    } else {

                        if(this._invitations[invitationKey]){
                            let invitation = this._invitations[invitationKey]

                            if ( typeof invitation.useKey === 'function') {
                                let invitationStatus = invitation.useKey(invitationKey, deviceInfo);
                                if( invitationStatus == "used" )
                                {
                                    console.log("invitation Key Used", deviceInfo)
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
            useTargetKey: function (targetKey, signature, deviceInfo) {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (targetKey === null) {
                        Reject({error: "targetKey === null"});
                    } else {

                        if(this._targets[targetKey]){
                            let target = this._targets[targetKey]

                            if ( typeof target.useKey === 'function') {
                                let targetStatus = target.useKey(targetKey, signature, deviceInfo);
                                if( targetStatus == "Success" )
                                {
                                    console.log("target Key Used", deviceInfo)
                                    Resolve({targetKey: targetKey, status: targetStatus});
                                }else{
                                    Reject({error: "Not Accepted", status : targetStatus});
                                }
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
                    console.log("getDevices 🔆🔆🔆 ", Result)
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
                            let newDevice = Device({owner: input.owner,
                                deviceInfo: input.deviceInfo,
                                _connectController: this, _module: this._module});
                            let newDeviceKey = newDevice.getKey()
                            let newDevicePublicSigningKey = newDevice.getPublicSigningKey()
                            if(newDeviceKey !== null)
                            {

                                //todo add to mongo database and load on start

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
