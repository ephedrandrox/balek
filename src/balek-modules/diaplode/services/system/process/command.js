/*
    This is the Diaplode System Process Command Map Command
*/
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/diaplode/services/system/process/base/command'
    ],
    function (declare,
              lang,
              systemCommand) {
        return declare("diaplodeSystemProcessCommand", null, {

            executionArray: null,
            _onOutputCallback: null,

            _systemCommand: null,
            _nextCommand: null,
            constructor: function (args) {
                declare.safeMixin(this, args);

                if(this.executionArray != null && Array.isArray(this.executionArray )
                && this.executionArray.length>0 && this._onOutputCallback!=null )
                {

                    let currentCommand = this.executionArray.shift();
                    this._command = currentCommand.command;
                    this._arguments = currentCommand.arguments;

                    if (this.executionArray.length>0)
                    {
                        //Make Another command and pass the truncated array
                        require([ 'balek-modules/diaplode/services/system/process/command'],
                            lang.hitch(this, function (processCommand) {
                                this._nextCommand = new processCommand({ executionArray: this.executionArray,
                                    _onOutputCallback: this._onOutputCallback});

                            }));
                    }else
                    {
                       //Last Command Made
                    }
                    this._systemCommand = new systemCommand({_command: this._command,
                                                    _arguments: this._arguments,
                                                    _onOutputCallback: this._onOutputCallback});
                }else
                {
                    console.log("Not enough parameters!");
                }

            },
            runCommand: function()
            {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {

                    if(this._systemCommand != null && this._systemCommand.runCommand)
                    {
                        this._systemCommand.runCommand().then(lang.hitch(this, function(commandResult){
                                Resolve(commandResult);
                        })).catch(lang.hitch(this, function(commandError){
                            Reject(commandError);
                        }));
                    }else
                    {
                        Reject({error: "No system Command to run!"})
                    }
                }));
            }
        });
    }
);

