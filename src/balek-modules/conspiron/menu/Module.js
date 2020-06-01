define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/conspiron/menu/Instance'],
    function (declare, baseModule, moduleInstance) {
        return declare("conspironMenuModule", baseModule, {
            _displayName: "Conspiron Menu",
            _allowedSessions: [1],

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("conspironMenuModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);


