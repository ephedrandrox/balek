define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/conspiron/login/Instance'],
    function (declare, baseModule, moduleInstance) {
        return declare("conspironLoginModule", baseModule, {
            _displayName: "Conspiron Login",
            _allowedSessions: [0],

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("conspironLoginModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);


