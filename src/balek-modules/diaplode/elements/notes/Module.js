define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/diaplode/elements/notes/Instance'],
    function (declare, baseModule, moduleInstance) {
        return declare("diaplodeElementsNotesModule", baseModule, {
            _displayName: "Diaplode Notes",
            _allowedSessions: [1],

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("diaplodeElementsNotesModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);


