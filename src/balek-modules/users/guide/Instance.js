define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/users/guide/Instance/usersGuide',
        'balek-modules/components/syncedCommander/Instance',
    ],
    function (declare, lang, UsersGuide, _SyncedCommanderInstance) {
        return declare("moduleUsersGuideInstance", _SyncedCommanderInstance, {
            _instanceKey: null,

            _usersGuideInstance: null,

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("moduleUsersGuideInstance starting...");

                this._interfaceState.set("Component Name","User Guide");
                this._interfaceState.set("Status", "Starting");

                this.prepareSyncedState();

                this._usersGuideInstance = new UsersGuide({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey,
                    _userKey: this._userKey, _Controller: this});

                this._interfaceState.set("userGuideInstanceKeys", {instanceKey: this._usersGuideInstance._instanceKey,
                    sessionKey: this._usersGuideInstance._sessionKey,
                    componentKey: this._usersGuideInstance._componentKey});

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


