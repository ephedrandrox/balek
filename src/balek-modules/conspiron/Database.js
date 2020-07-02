define(['dojo/_base/declare',
        'balek-modules/base/database/controller',],
    function (declare, databaseController) {
        return declare("conspironDatabaseController", [databaseController], {

            _Database: "conspiron",

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("conspironDatabaseController  starting...");
            }
        });
    }
);


