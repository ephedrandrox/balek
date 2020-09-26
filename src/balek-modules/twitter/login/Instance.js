//This file is loaded by the module when it is loaded into the Balek Instance
//And is used to create a new instance when it is requested by the moduleManager
define(['dojo/_base/declare',
        'balek-modules/components/login/Instance',],                                     //Array of files to include
    function (declare, _loginInstance) {                                  //variables from array of included files
        return declare("moduleTwitterLoginInstance", _loginInstance, {    //Declares instance extending base instance
            _instanceKey: null,                                         //used to identify instance, set by moduleManager

            constructor: function (args) {                              //called when a new instance is created by moduleManager for a session
                declare.safeMixin(this, args);                          //mixes in args from moduleManager like _instanceKey
                console.log("moduleTwitterLoginInstance starting...", this._instanceKey);
            }
        });
    }
);