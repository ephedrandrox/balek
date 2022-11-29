define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/components/syncedCommander/Instance'
    ],
    function (declare, lang, topic, syncedCommanderInstance) {

        return declare("moduleAdminUsersNewUserInstance", syncedCommanderInstance, {
            _instanceKey: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                console.log("moduleAdminUsersNewUserInstance starting...");

                this._interfaceState.set("moduleName","moduleAdminUsersNewUserInstance");

            }
        });
    }
);


