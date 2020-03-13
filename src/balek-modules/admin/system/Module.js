define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/admin/system/Instance'],
    function (declare, baseModule, moduleInstance) {

        return declare("adminSystemModule", baseModule, {
            _displayName: "System Administration",
            _iconPath: "balek-modules/session/menu/resources/images/system.svg",

            _allowedGroups: ["admin"],
            _allowedSessions: [1],

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("adminSystemModule  starting...");

            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }

        });
    }
);


