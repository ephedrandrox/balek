define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/diaplode/login/Instance'],
    function (declare, baseModule, moduleInstance) {
        return declare("diaplodeLoginModule", baseModule, {
            _displayName: "Diaplode Login",
            _allowedSessions: [0],

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("diaplodeLoginModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);


