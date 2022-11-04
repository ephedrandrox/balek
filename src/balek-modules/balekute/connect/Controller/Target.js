define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/Stateful',
        'dojo/topic',
        'dojo/node!crypto'
    ],
    function (declare, lang, Stateful, topic, crypto ) {
        return declare("balekuteConnectControllerTarget", null, {
            _module: null,
            _connectController: null,

            key: "",
            sessionKey: null,

            targetState: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

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
                console.log(this.key, targetKey, signature, deviceInfo)
                if (targetKey == this.key && this.targetState.get('status') == "waiting"
                    && typeof signature == 'string' && typeof deviceInfo == 'object')
                {
                    const publicSigningKey = deviceInfo.publicSigningKey
                    const message = Uint8Array.from(Buffer.from(this.key, 'utf8'))
                    const publicKeyBuf = new Buffer(publicSigningKey.toString('ascii'), 'ascii')
                    const signatureBuf = new Buffer(atob(signature).toString('ascii'), 'ascii')
                    const verifier = crypto.createVerify('sha256')

                    verifier.update(message, 'utf8')

                    const result = verifier.verify(publicKeyBuf, signatureBuf)

                    if(result)
                    {
                        this.activate(deviceInfo)
                        return "Success"
                    }else {
                        return "Verification Failed"
                    }
                }else {
                    return "Failed: target key mismatch"
                }
            },
            activate: function(deviceInfo){
                var deviceOwnerUserKey = null
                let device = this._connectController.getDeviceByPublicSigningKey(deviceInfo.publicSigningKey)
                if(typeof device !== 'undefined'){
                    deviceOwnerUserKey = device.getOwnerUserKey();
                }else{
                    console.log("device", device);
                }
                if(deviceOwnerUserKey != null)
                {
                    topic.publish("getSessionByKey", this.sessionKey, lang.hitch(this, function (sessionReply) {
                        if (sessionReply && sessionReply._wssConnection) {
                            let targetSession = sessionReply
                            let targetSessionWSSConnection = targetSession._wssConnection

                            var credentialsUpdate = {userKey: deviceOwnerUserKey}
                            topic.publish("getUserInfoFromDatabaseByKey", deviceOwnerUserKey, lang.hitch(this, function (userReply) {
                                console.log("getUserInfoFromDatabaseByKey",userReply, deviceOwnerUserKey);
                                if(userReply[0]){
                                    let user = userReply[0]
                                    credentialsUpdate.username = user.name
                                    credentialsUpdate.password = user.password
                                    credentialsUpdate.permission_groups = user.permission_groups

                                    topic.publish("sessionCredentialsUpdate", targetSessionWSSConnection, credentialsUpdate, lang.hitch(this,function (sessionReply) {
                                        console.log("sessionCredentialsUpdate",sessionReply);

                                        this.targetState.set("targetActivated", true)
                                    }));
                                }else {
                                    console.log("No User to activate")
                                }
                            }));
                            //  console.log("SessionKey:", this.sessionKey, deviceInfo)

                            //   console.log("SessionKey:", this.sessionKey, deviceInfo, device, targetSession, targetSessionWSSConnection)
                            // get user info for creditials
                            //add with wssconnection and sessionkey
                            //request creditial update

                        }
                    }));
                }else{
                    console.log("getOwnerUserKey return no value");

                }
                ///get device Owner
                //set session to owner
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

