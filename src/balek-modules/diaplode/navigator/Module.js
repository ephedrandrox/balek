define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/diaplode/menu/Instance'],
    function (declare, baseModule, moduleInstance) {
        return declare("diaplodeRadialMenuModule", baseModule, {
            _displayName: "Diaplode Menu",
            _allowedSessions: [1],

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("diaplodeRadialMenuModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);


