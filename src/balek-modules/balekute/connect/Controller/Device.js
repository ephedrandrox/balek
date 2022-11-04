define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/Stateful',
        'dojo/node!crypto'
    ],
    function (declare, lang, Stateful, crypto ) {
        return declare("balekuteConnectControllerDevice", null, {
            _module: null,
            _connectController: null,

            owner: { userKey: null},
            key: null,
            deviceInfo: null,

            statusState: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                StatusState = declare([Stateful], {});
                this.statusState = new StatusState({status: "initiating" });

                if( this._module !== null && this._connectController !== null
                    && this.deviceInfo != null
                    && this.deviceInfo.keychainIdentifier
                    && this.deviceInfo.publicSigningKey ){
                    console.log("balekuteConnectControllerDevice starting...");
                    this.key = String(crypto.randomUUID());
                    this.statusState = new StatusState({status: "awaiting" });
                }else
                {
                    console.log(this.deviceInfo,"balekuteConnectControllerDevice Cannot Start!...");
                }
            },
            getKey: function(){
                return this.key;
            },
            getPublicSigningKey: function(){
                return this.deviceInfo.publicSigningKey
            },
            getDeviceIdentifier: function(){
                return this.deviceInfo.keychainIdentifier
            },
            getOwnerUserKey: function(){
                return this.owner.userKey
            }
    });
    }
);

