define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/users/guide/Instance'],
    function (declare, baseModule, moduleInstance) {
        return declare("usersGuideModule", baseModule, {

            _displayName: "Users Guide",
            _allowedGroups: ["users"],
            _allowedSessions: [1],

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("usersGuideModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }

        });
    }
);


