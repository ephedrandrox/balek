define(['dojo/_base/declare',
        'balek-modules/base/database/controller',],
    function (declare, databaseController) {
        return declare("diaplodeDatabaseController", [databaseController], {

          //  _Database: "digivigil",

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("digivigilDatabaseController  starting...");
            }
        });
    }
);


