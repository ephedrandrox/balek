define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        //Balek Components
        'balek-modules/users/info/Instance/userInfo',
        'balek-modules/components/syncedMap/Instance',
        'balek-modules/components/syncedCommander/Instance',
        ],
    function (declare, lang, topic, UserInfo, SyncedMapInstance, _SyncedCommanderInstance) {
        return declare("moduleUsersInfoInstance", _SyncedCommanderInstance, {
            _instanceKey: null,
            _userInfoInstance: null,

            availableSessions: null,

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("moduleUsersInfoInstance starting...");
                this._interfaceState.set("Component Name","User Info");
                this._interfaceState.set("Status", "Starting");

                this.availableSessions = new SyncedMapInstance({_instanceKey: this._instanceKey});
                this._interfaceState.set("availableSessionsComponentKey", this.availableSessions._componentKey);

                this.prepareSyncedState();

                //Create the main Instance
                this._userInfoInstance = new UserInfo({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey, _userKey: this._userKey,
                    _Controller: this});
                //Set Main Instance keys for interface
                this._interfaceState.set("userInfoInstanceKeys", {instanceKey: this._userInfoInstance._instanceKey,
                    sessionKey: this._userInfoInstance._sessionKey,
                    componentKey: this._userInfoInstance._componentKey});


                this._interfaceState.set("Status", "Started");


            },
            //##########################################################################################################
            //Base Instance Override Function
            //##########################################################################################################
            _end: function () {
                //calls inherited _end functions like stateSynced Object
                this.inherited(arguments);
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    console.log("destroying User Info Instance ");
                    Resolve({success: "Unloaded Instance"});
                }));
            }
        });
    }
);


