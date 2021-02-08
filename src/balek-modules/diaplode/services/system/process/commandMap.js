/*
    This is the Diaplode System Process Command Map Service
*/
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/diaplode/services/system/process/command'
    ],
    function (declare,
              lang,
              processCommand) {
        return declare("diaplodeSystemProcessCommandMap", null, {

            executionArray: null,
            _firstCommand: null,
            _onOutputCallback: null,
            constructor: function (args) {
                declare.safeMixin(this, args);

                console.log("diaplodeSystemProcessCommandMap Service starting...");

                if(this.executionArray != null && Array.isArray(this.executionArray ) && this._onOutputCallback != null)
                {
                    this._firstCommand = new processCommand({ executionArray: this.executionArray,
                            _onOutputCallback: this._onOutputCallback});
                }else
                {
                    console.log("executionArray not set");
                }
            },
            runCommands: function()
            {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {

                    let currentCommand = this._firstCommand;

                    let runNextCommand = lang.hitch(this, function(nextCommand){
                        if(nextCommand !== undefined)
                        {
                            currentCommand = nextCommand;
                        }
                        this._onOutputCallback("Running "+'\033[0;31m'+currentCommand._command + " " + currentCommand._arguments.join(" ") +'\033[33m' +"\n\n");
                        currentCommand.runCommand().then( lang.hitch(this, function(commandResult){
                            if(currentCommand._nextCommand){
                                //Run Next Command
                                this._onOutputCallback("\033[0m\n➢➢➢\n\n");
                                runNextCommand(currentCommand._nextCommand);
                            }else
                            {
                                //All Commands ran
                                this._onOutputCallback("\033[0m\n➢➢➢\n\n");
                                Resolve({success: "Commands all executed"});
                            }
                        })).catch(lang.hitch(this, function(commandError){

                            this._onOutputCallback("\033[0;31mCommand Not Found\n\033[0m\n➢➢➢\n\n");
                            runNextCommand(currentCommand._nextCommand);

                            console.log(commandError);
                             Reject({error: commandError});
                        }));
                    });

                    runNextCommand(currentCommand);
                }));
            }
        });
    }
);


