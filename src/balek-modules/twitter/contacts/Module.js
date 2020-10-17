//This file is loaded by the moduleManager Balek is started
//where it is used to create a new module for spawning module instances
define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/twitter/Database',
        'balek-modules/twitter/contacts/Instance',],            //array of files to include
    function (declare, baseModule, moduleDatabase, moduleInstance) {            //variables from array of included files
        return declare("twitterContactsModule", baseModule, {   //Declares module extending base module
            _displayName: "Twitter Contacts",                   //This is the name used for user interaction
            _allowedSessions: [1],                              //Array of Status Sessions are allowed to have that load this module

            _databaseController: null,                          //place to store the database Controller

            constructor: function (args) {                      //Module constructor called when module is loaded into moduleManager
                declare.safeMixin(this, args);                  //Used to mix in any arguments that need to be added by moduleManager
                console.log("twitterContactsModule  starting...");

                this._databaseController = new moduleDatabase();//create the database Controller from the Database.js file
                this._databaseController.connectToDatabase();   //connect to this database


            },
            newInstance: function (args) {                      //this is what is called when a new instance is requested
                return new moduleInstance(args);                //returns new instance of moduleInstance aka 'balek-modules/twitter/login/Instance'
            }
        });
    }
);