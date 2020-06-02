define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/diaplode/navigator/Instance'],
    function (declare, baseModule, moduleInstance) {
        return declare("diaplodeRadialNavigatorModule", baseModule, {
            _displayName: "Diaplode Navigator",
            _allowedSessions: [1],

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("diaplodeRadialNavigatorModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);


