define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/diaplode/elements/tasks/Instance'],
    function (declare, baseModule, moduleInstance) {
        return declare("diaplodeElementsTasksModule", baseModule, {
            _displayName: "Diaplode Tasks",
            _allowedSessions: [1],

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("diaplodeElementsTasksModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);


