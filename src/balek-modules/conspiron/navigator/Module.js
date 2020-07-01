define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/conspiron/Database',

        'balek-modules/conspiron/navigator/Instance'],
    function (declare, baseModule, moduleDatabase, moduleInstance) {
        return declare("conspironNavigatorModule", baseModule, {
            _displayName: "Conspiron Navigator",
            _allowedSessions: [1],

            _databaseController: null,


            constructor: function (args) {

                declare.safeMixin(this, args);

                this._databaseController = new moduleDatabase();
                this._databaseController.connectToDatabase();


                console.log("conspironNavigatorModule  starting...");
            },
            newInstance: function (args) {
                //must be overridden from base
                return new moduleInstance(args);
            }
        });
    }
);





