define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/diaplode/elements/Instance'],
    function (declare, baseModule, moduleInstance) {
        return declare("diaplodeElementsModule", baseModule, {
            _displayName: "Diaplode Elements",
            _allowedSessions: [1],

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("diaplodeElementsModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);


