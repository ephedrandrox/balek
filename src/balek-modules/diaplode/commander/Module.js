define(['dojo/_base/declare',
        'balek-modules/Module',

        'balek-modules/diaplode/commander/Instance'],
    function (declare, baseModule, moduleInstance) {
        return declare("diaplodeCommanderModule", [baseModule], {
            _displayName: "Diaplode Commander",
            _allowedSessions: [1],


            constructor: function (args) {

                declare.safeMixin(this, args);



                console.log("diaplodeCommanderModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);


