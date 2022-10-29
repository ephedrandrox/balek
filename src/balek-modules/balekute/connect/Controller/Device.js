define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/Stateful',
        'dojo/node!crypto'
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
                this.statusState = new StatusState({status: "waiting", host: this.host,
                    publicSigningKey: "", keychainIdentifier: "" });

                console.log("balekuteConnectControllerInvitation starting...");
                this.key = String(crypto.randomUUID());
            },
            useKey: function (invitationKey, deviceInfo){
                //If the Invitation Key Matches, check device info
                //Checks that the DeviceInfo contains a key and signature that verify the keychainIdentifier
                if(invitationKey == this.key && this.statusState.get("status") == "waiting"){
                    //Verify Signature Key and keychainIdentifier
                    const publicSigningKey = deviceInfo.publicSigningKey
                    const signature = deviceInfo.signature
                    const message = Uint8Array.from(Buffer.from(deviceInfo.keychainIdentifier, 'utf8'));
                    const publicKeyBuf = new Buffer(publicSigningKey.toString('ascii'), 'ascii')
                    const signatureBuf = new Buffer(atob(signature).toString('ascii'), 'ascii')
                    const verifier = crypto.createVerify('sha256')
                    verifier.update(message, 'utf8')
                    const result = verifier.verify(publicKeyBuf, signatureBuf)
                    //If Verified Register the device
                    if(result)
                    {
                        this.statusState.set("status", "used")

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
            userAcceptsDevice: function(owner, invitationKey)
            {
                console.log(owner, invitationKey)
                if(owner.userKey == this.owner.userKey
                && invitationKey == this.key){

                        this.statusState.set("status", "accepted")


                }else{
                    this.statusState.set("status", "error")
                    this.statusState.set("error", "Owner Device Acceptance Failed")
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

