/*
    This is the Diaplode System SSH Service
    Uses Base command to start ssh service
    Needs ~/.ssh/id_rsa.pub added to  ~/.ssh/authorized_keys
    or whatever your public key is when executing
    ssh from same term as the node process that starts Balek
*/
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/diaplode/services/system/process/base/command'
    ],
    function (declare,
              lang,
              systemCommand) {
        return declare("diaplodeSystemSSHService", null, {

            _onOutputCallback: null,
            _onErrorCallback: null,
            _onCloseCallback: null,

            _systemCommand: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                //ToDO have it check for ssh version and ability to connect
                console.log("diaplodeSystemSSHService starting...");
                if(this.sshUsername != null && this.sshHostname != null && this._onOutputCallback != null) {
                    //let sshArguments = ["-tt", "localhost"];
                    let sshArguments = ["-tt", "-o" ,"StrictHostKeyChecking=no","-p", "2222","-l", "diaplode",  "-i", "./builds/diaplode/conf/ssh/id_rsa", "openssh"];
                    this._systemCommand = new systemCommand({_command: "ssh",
                        _arguments: sshArguments,
                        _onOutputCallback: this._onOutputCallback});
                    this.runCommand().then(lang.hitch(this, function(sshResult){
                        //it should just keep running
                        //we could put something here to restart if it finishes
                    })).catch(lang.hitch(this, function(sshErrorResult){
                        //If there is an error with SSH client this will be called
                    }));
                }
            },
            runCommand: function()
            {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if(this._systemCommand != null && this._systemCommand.runCommand)
                    {
                        this._systemCommand.runCommand().then(lang.hitch(this, function(commandResult){
                            this._onOutputCallback("SSH Closed:"+ JSON.stringify(commandResult, null, 2) + "\n");
                        })).catch(lang.hitch(this, function(commandError){
                            Reject(commandError);
                        }));
                    }else
                    {
                        Reject({error: "No system Command to run!"})
                    }
                }));
            },
            sendInput: function(inputData){
                this._systemCommand.sendInput(inputData);
            }
        });
    }
);

