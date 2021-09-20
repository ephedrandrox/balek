/*
    This is the Diaplode System Process Command Base Service
*/
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/diaplode/services/system/process/base/process'
    ],
    function (declare,
              lang,
              systemProcess) {
        return declare("diaplodeSystemProcessBaseCommand", systemProcess, {

            _command: null,
            _arguments: null,

            constructor: function (args) {
                //todo Build this object to include tests and state such as status
                declare.safeMixin(this, args);
            },
            runCommand: function(){
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if(this._command !==null && this._arguments !== null){
                        this._onCloseCallback = function(closeCode){
                            Resolve({closeCommand: closeCode});
                        }
                        this._onErrorCallback = function(errorData){
                            Reject({error: errorData});
                        }
                        this.startProcess();
                    }
                }));
            },
            sendInput: function(inputData)
            {
                this.inherited(arguments);
            }
        });
    }
);

