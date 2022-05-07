define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/diaplode/elements/files/Instance'],
    function (declare, baseModule, moduleInstance) {
        return declare("diaplodeElementsFilesModule", baseModule, {
            _displayName: "Diaplode Files",
            _allowedSessions: [1],

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("diaplodeElementsFilesModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);


