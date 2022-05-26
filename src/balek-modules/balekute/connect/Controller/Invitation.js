define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/Stateful',
        'dojo/node!crypto'
    ],
    function (declare, lang, Stateful, crypto) {
        return declare("balekuteConnectControllerInvitation", null, {
            _module: null,
            _connectController: null,

            owner: { userKey: null},
            key: "",

            statusState: null,
            invitationState: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                if(this._module === null || this._connectController === null){
                    console.log("balekuteConnectControllerInvitation Cannot Start!...");
                }
                StatusState = declare([Stateful], {

                });
                this.statusState = new StatusState({});

                console.log("balekuteConnectControllerInvitation starting...");
                this.key = String(crypto.randomUUID());
            },
            useKey: function (key){
                if(key == this.key){
                    this.statusState.set("status", "accepted")
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

