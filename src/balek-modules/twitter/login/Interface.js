//This file is loaded by the Balek interface aka web client
//And is used to create a new module interface to connect to an module instance
define(['dojo/_base/declare',
        "dojo/topic",
        'balek-modules/components/login/Interface',],                                        //Array of files to include
    function (declare, topic, _loginInterface) {                                    //variables from array of included files
        return declare("moduleTwitterLoginInterface", _loginInterface, {   //Declares Interface extending base Interface
            _instanceKey: null,                                             //This is used to identify and communicate with the module instance

            constructor: function (args) {                                  //called when a new interface is created
                declare.safeMixin(this, args);                              //mixes in args from moduleManager like _instanceKey
                console.log("moduleTwitterLoginInstance started", this._instanceKey);
            },
            _onLoginSuccess(){
                topic.publish("requestModuleLoad", "session/menu");
                topic.publish("loadBackground", "flowerOfLife");
                this.unload();
            }
        });
    }
);
