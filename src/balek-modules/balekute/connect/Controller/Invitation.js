define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/Stateful',
        'dojo/node!crypto'
      //  'dojo/node!curve25519-js',
   // 'dojo/node!elliptic'

    ],
    function (declare, lang, Stateful, crypto ) {
        return declare("balekuteConnectControllerInvitation", null, {
            _module: null,
            _connectController: null,

            owner: { userKey: null},
            key: "",

            statusState: null,
            //todo change to invitationState
            invitationState: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                if(this._module === null || this._connectController === null){
                    console.log("balekuteConnectControllerInvitation Cannot Start!...");
                }
                StatusState = declare([Stateful], {

                });
                this.statusState = new StatusState({status: "waiting", host: this.host});

                console.log("balekuteConnectControllerInvitation starting...");
                this.key = String(crypto.randomUUID());
            },
            useKey: function (invitationKey, deviceInfo){
                if(invitationKey == this.key){

                    let publicSigningKey = deviceInfo.publicSigningKey
                    let signature = deviceInfo.signature


                    let message = Uint8Array.from(Buffer.from("BalekuteSignatureTest", 'utf8'));
                    const publicKeyBuf = new Buffer(publicSigningKey.toString('ascii'), 'ascii')
                    const signatureBuf = new Buffer(atob(signature).toString('ascii'), 'ascii')


                    const verifier = crypto.createVerify('sha256')
                    verifier.update(message, 'utf8')
                    const result = verifier.verify(publicKeyBuf, signatureBuf)
                    console.log("result", result)


                    if(result)
                    {
                        this.statusState.set("status", "accepted")
                        this.statusState.set("hostname", deviceInfo.hostname)
                        this.statusState.set("publicSigningKey", publicSigningKey)
                        this.statusState.set("keychainIdentifier", deviceInfo.keychainIdentifier)
                        this.statusState.set("name", deviceInfo.name)
                        this.statusState.set("osName", deviceInfo.osName)
                        this.statusState.set("signature", signature)
                    }else{
                        this.statusState.set("status", "error")
                        this.statusState.set("error", "Signature failed")
                    }

                }
                return this.statusState.get("status")
            },
            getKey: function(){
                return this.key;
            },
            getOwnerKey: function(){
                return this.owner.userKey;
            },
            getStatusState: function(){
                return this.statusState;
            }


    });
    }
);

