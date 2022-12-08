define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/users/info/Instance'],
    function (declare, baseModule, moduleInstance) {
        return declare("usersInfoModule", baseModule, {

            _displayName: "User Info",
            _iconPath: 'balek-modules/users/info/resources/images/icon.svg',

            _allowedGroups: ["users"],
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


