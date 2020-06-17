define(['dojo/_base/declare',
        'balek-modules/base/database/controller'],
    function (declare, databaseController) {
        return declare("diaplodeDatabaseController", [databaseController], {
_Database: "diaplode",

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("diaplodeDatabaseController  starting...");
            }
        });
    }
);


