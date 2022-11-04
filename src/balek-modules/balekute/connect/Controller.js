define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/topic',

        'dojo/Stateful',
        'balek-modules/balekute/connect/Controller/Invitation',
        'balek-modules/balekute/connect/Controller/Device',
        'balek-modules/balekute/connect/Controller/Target'


    ],
    function (declare, lang, topic, Stateful, Invitation, Device, Target
 ) {
        return declare("balekuteConnectController", null, {
            _module: null,

            _invitations: null,
            _invitationStates: null,

            _devices: null,
            _devicesBySigningKey: null,

            _targets: null,
            _targetsBySessionKey: null,

            statusAsState: null,

            mongoConnection: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                this._invitations = {};
                this._invitationStates = {}

                this._devices = {}
                this._devicesBySigningKey = {}

                this._targets = {}
                this._targetsBySessionKey = {}

                let StatusState = declare([Stateful], {});

                this.statusAsState = new StatusState({});

                if(this._module === null){
                    console.log("diaplodeConversationsController  Cannot Start!...");
                }

                topic.publish("getMongoSettingsWithCallback", lang.hitch(this, function (mongoDBConfig) {
                    topic.publish("getMongoDbConnection", mongoDBConfig.host, mongoDBConfig.port, mongoDBConfig.user, mongoDBConfig.password, mongoDBConfig.database, lang.hitch(this, function (dbConnection) {
                        this.mongoConnection = dbConnection;
                    }));
                }));


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
