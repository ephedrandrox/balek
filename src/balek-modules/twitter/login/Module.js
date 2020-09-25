//This file is loaded by the moduleManager When Balek is started
//where it is used to create a new module for spawning module instances
define(['dojo/_base/declare',
        'balek-modules/Module',
        'balek-modules/twitter/login/Instance',],               //array of files to include
    function (declare, baseModule, moduleInstance) {            //variables from array of included files
        return declare("moduleTwitterLoginModule", baseModule, {   //Declares module extending base module
            _displayName: "Twitter Dev Login",                  //This is the name used for user interaction
            _allowedSessions: [0],                              //Array of Status Sessions are allowed to have that load this module

            constructor: function (args) {                      //Module constructor called when module is loaded into moduleManager
                declare.safeMixin(this, args);                  //Used to mix in any arguments that need to be added by moduleManager
                console.log("twitterDevLoginModule  starting...");
            },
            newInstance: function (args) {                      //this is what is called when a new instance is requested
                return new moduleInstance(args);                //returns new instance of moduleInstance aka 'balek-modules/dev-twitter/login/Instance'
            }
        });
    }
);