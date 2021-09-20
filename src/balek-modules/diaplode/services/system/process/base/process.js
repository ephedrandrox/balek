/*
    This is the Diaplode System Process Base Service
*/
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/Stateful',
        'dojo/node!child_process'
    ],
    function (declare,
              lang,
              Stateful,
              childProcess) {
        return declare("diaplodeSystemProcessBaseProcess", null, {
            _command: null,
            _arguments: null,

            _onOutputCallback: null,
            _onCloseCallback: null,
            _onErrorCallback: null,

            _systemProcess: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
            },
            startProcess: function()
            {
                if(this._command !==null && this._arguments !== null && this._systemProcess === null) {
                    try {
                        this._systemProcess = childProcess.spawn(this._command, this._arguments);

                        //Standard Output Handler
                        this._systemProcess.stdout.setEncoding('utf8');
                        this._systemProcess.stdout.on('data', lang.hitch(this, "onProcessOutput"));

                        //todo change to onProccessErrorOutput if errorOutput handler included
                        //when we need one
                        //Error Output Handler
                        this._systemProcess.stderr.setEncoding('utf8');
                        this._systemProcess.stderr.on('data', lang.hitch(this, "onProcessOutput"));

                        //Process close Handler
                        this._systemProcess.on('close', lang.hitch(this,"onProcessClose"));
                        //Process Error thrown
                        this._systemProcess.on('error', lang.hitch(this,"onProcessError"));

                    } catch (error) {
                        console.log(error);
                    }
                }
            },
            sendInput: function(inputData)
            {
                this._systemProcess.stdin.write(inputData);
            },
            onProcessOutput: function(data){
                if(this._onOutputCallback !== null)
                {
                    this._onOutputCallback(data);
                }
            },
            onProcessError: function(errorData){
                if(this._onErrorCallback !== null)
                {
                    this._onErrorCallback(errorData);
                }
            },
            onProcessClose: function(code) {
                if(this._onCloseCallback !== null)
                {
                    this._onCloseCallback(code);
                }
            }
        });
    }
);

