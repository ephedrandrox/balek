define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/admin/users/Instance/userManagement',
        'balek-modules/components/syncedCommander/Instance'
    ],
    function (declare, lang, topic, userManagementInstance, _syncedCommanderInstance) {

        return declare("moduleAdminUsersInstance", _syncedCommanderInstance, {
            _instanceKey: null,

            _userManagementInstance: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                console.log("moduleAdminUsersInstance starting...");

                this._userManagementInstance = new userManagementInstance({_instanceKey: this._instanceKey});

                this._interfaceState.set("userManagementInstanceKeys" , {instanceKey: this._userManagementInstance._instanceKey,
                    componentKey: this._userManagementInstance._componentKey});

            }
        });
    }
);


