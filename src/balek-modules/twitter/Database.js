define(['dojo/_base/declare',
        'balek-modules/base/database/controller',],
    function (declare, databaseController) {
        return declare("twitterDatabaseController", [databaseController], {

            _Database: "twitter",           //Can Change this

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("twitterDatabaseController  starting...");
            }
        });
    }
);


