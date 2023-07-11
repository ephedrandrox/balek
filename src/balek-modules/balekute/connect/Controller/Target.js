define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/Stateful',
        'dojo/topic',
        'balek-server/session/sessionsController/instanceCommands',

        'dojo/node!crypto'
    ],
    function (declare, lang, Stateful, topic, SessionsControllerInstanceCommands,crypto ) {
        return declare("balekuteConnectControllerTarget", null, {
            _module: null,
            _connectController: null,

            key: "",
            sessionKey: null,

            targetState: null,
            sessionsControllerCommands: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                let sessionsControllerInstanceCommands = new SessionsControllerInstanceCommands();
                this.sessionsControllerCommands = sessionsControllerInstanceCommands.getCommands();

                TargetState = declare([Stateful], {});
                this.targetState = new TargetState({status: "waiting"})

                if( this._module !== null && this._connectController !== null
                && this.sessionKey){
                    console.log("balekuteConnectControllerTarget starting...");
                    this.key = String(crypto.randomUUID());
                }else
                {
                    console.log(this.deviceInfo,"balekuteConnectControllerTarget Cannot Start!...");
                }
            },
            useKey: function(targetKey, signature, deviceInfo)
            {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {

                    if (targetKey == this.key && this.targetState.get('status') == "waiting"
                        && typeof signature == 'string' && typeof deviceInfo == 'object') {
                        const publicSigningKey = deviceInfo.publicSigningKey
                        const message = Uint8Array.from(Buffer.from(this.key, 'utf8'))
                        const publicKeyBuf = new Buffer(publicSigningKey.toString('ascii'), 'ascii')
                        const signatureBuf = new Buffer(atob(signature).toString('ascii'), 'ascii')
                        const verifier = crypto.createVerify('sha256')

                        verifier.update(message, 'utf8')

                        const result = verifier.verify(publicKeyBuf, signatureBuf)

                        if (result) {
                            this.targetState.set('status', 'Activating')
                            this.activate(deviceInfo)
                            Resolve("Success")
                        } else {
                            Reject({Error: "Verification Failed" })
                        }
                    } else {
                        Reject({Error: "Failed: target key mismatch" })
                    }
                }))
            },
            activate: function(deviceInfo){
                let deviceOwnerUserKey = null
                let device = this._connectController.getDeviceByPublicSigningKey(deviceInfo.publicSigningKey)
                if(typeof device !== 'undefined'){
                    deviceOwnerUserKey = device.getOwnerUserKey();
                }else{
                    console.log("device", device);
                }
                if(deviceOwnerUserKey != null)
                {

                    let session = this.sessionsControllerCommands.getSessionByKey(this.sessionKey)
                    if (session && session._wssConnection) {
                        let targetSession = session
                        let targetSessionWSSConnection = targetSession._wssConnection

                        var credentialsUpdate = {userKey: deviceOwnerUserKey}
                        topic.publish("getUserInfoFromDatabaseByKey", deviceOwnerUserKey, lang.hitch(this, function (userReply) {
                            console.log("getUserInfoFromDatabaseByKey",userReply, deviceOwnerUserKey);
                            if(userReply[0]){
                                let user = userReply[0]
                                credentialsUpdate.username = user.name
                                credentialsUpdate.password = user.password
                                credentialsUpdate.permission_groups = user.permission_groups

                                topic.publish("sessionCredentialsUpdate", targetSessionWSSConnection, credentialsUpdate, lang.hitch(this,function (session) {
                                    console.log("sessionCredentialsUpdate",session);
                                    this.targetState.set('status') == "Activated"
                                    this.targetState.set("targetActivated", true)
                                }));
                            }else {
                                console.log("No User to activate")
                            }
                        }));

                    }


                }else{
                    console.log("getOwnerUserKey return no value");
                }

            },
            getKey: function(){
                return this.key;
            },
            getSessionKey: function(){
                return this.sessionKey
            },
            getState: function(){
                return this.targetState
            }
    });
    }
);

