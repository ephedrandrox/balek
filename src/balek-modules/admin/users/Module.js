define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/admin/users/Instance'],
    function (declare, baseModule, moduleInstance) {
        return declare("adminUsersModule", baseModule, {
            _displayName: "User Administration",
            _iconPath: "balek-modules/admin/users/resources/images/icon.svg",
            _allowedGroups: ["admin"],
            _allowedSessions: [1],

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("adminUsersModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);


