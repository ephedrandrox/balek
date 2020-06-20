define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/diaplode/navigator/Database',

        'balek-modules/diaplode/navigator/Instance'],
    function (declare, baseModule, moduleDatabase, moduleInstance) {
        return declare("diaplodeRadialNavigatorModule", [baseModule], {
            _displayName: "Diaplode Navigator",
            _allowedSessions: [1],
            _databaseController: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._databaseController = new moduleDatabase();
                this._databaseController.connectToDatabase();

                console.log("diaplodeNavigatorModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);


