define(['dojo/_base/declare',
        'balek-modules/base/database/controller',],
    function (declare, databaseController) {
        return declare("balekuteDatabaseController", [databaseController], {

            //_Database: "balekute",

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("balekuteDatabaseController  starting...");
            }
        });
    }
);


