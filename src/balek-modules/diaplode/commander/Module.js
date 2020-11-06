define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/diaplode/Database',

        'balek-modules/diaplode/commander/Instance'],
    function (declare, baseModule, moduleDatabase, moduleInstance) {
        return declare("diaplodeCommanderModule", [baseModule], {
            _displayName: "Diaplode Commander",
            _allowedSessions: [1],
            _databaseController: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._databaseController = new moduleDatabase();
                this._databaseController.connectToDatabase();

                console.log("diaplodeCommanderModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);


