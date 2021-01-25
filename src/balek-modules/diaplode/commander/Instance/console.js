define(['dojo/_base/declare',
        'dojo/_base/lang',

        //Diaplode Service Includes
        'balek-modules/diaplode/services/system/process/base/command',
        //Balek Instance Includes
        'balek-modules/components/syncedCommander/Instance',

    ],
    function (declare,
              lang,
              systemCommand,
              //Balek Instance Includes
              _syncedCommanderInstance) {
        return declare("moduleDiaplodeCommanderInstanceConsole", [_syncedCommanderInstance], {

            _sshService: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleDiaplodeCommanderInstanceConsole");

                //set setRemoteCommander commands
                this._commands={
                    "sendConsoleInput": lang.hitch(this, this.sendConsoleInput),
                    "dockInterface" : lang.hitch(this, this.dockInterface),
                    "undockInterface" : lang.hitch(this, this.undockInterface)
                };
                this.setInterfaceCommands();

                this._interfaceState.set("Component Name","console");
                //creates component Key that can be used to connect to state
                this.prepareSyncedState();


                this._interfaceState.set("consoleDocked", "true");
                this._interfaceState.set("consoleOutput", "");
                this._interfaceState.set("Status", "Ready");


                //import commandMap and SSH services then use them to output to the console

                require([ 'balek-modules/diaplode/services/system/process/commandMap',
                        'balek-modules/diaplode/services/system/ssh/ssh'],
                    lang.hitch(this, function (commandMap, sshService) {
                        //execution array gets executed in order after each command
                        //returns successfully. If error, commands are stopped
                        let newCommandMap =  new commandMap({executionArray : [{
                                command: "uname",
                                arguments: ["-a"]

                            },{
                                command: "pwd",
                                arguments: []

                            },{
                                command: "ls",
                                arguments: [],

                            },
                            {
                                command: "git",
                                arguments: ["--version"],

                            },
                            {
                                command: "node",
                                arguments: ["--version"]
                            },
                            {
                                command: "docker",
                                arguments: ["--version"]
                            },
                            {
                                command: "whoami",
                                arguments: []

                            },
                            {
                                command: "cat",
                                arguments: ["builds/diaplode/conf/ssh/id_rsa.pub"]

                            }],
                            _onOutputCallback: lang.hitch(this, function(data){
                                this._interfaceState.set("consoleOutput",  this._interfaceState.get("consoleOutput")+data);
                            })});

                        //Command map runs execution array in order and stops on error
                        newCommandMap.runCommands().then(lang.hitch(this, function(commandMapResult){
                            // all commands executed
                            // //console.log(commandMapResult);
                            /*
                            this._sshService = new sshService({sshUsername: "ephedrandrox", sshHostname: "localhost",
                                _onOutputCallback: lang.hitch(this, function(data){
                                    this._interfaceState.set("consoleOutput",  this._interfaceState.get("consoleOutput")+data);
                                })});*/
                        })).catch(lang.hitch(this, function(commandMapError){
                            console.log(commandMapError);
                        }));
                }));

            },
            sendConsoleInput: function( input){
                console.log(input);
                this._sshService.sendInput(input);
            },
            dockInterface: function()
            {
                this._interfaceState.set("consoleDocked", "true");
            },
            undockInterface: function()
            {
                this._interfaceState.set("consoleDocked", "false");
            },
            _end: function(){
                //calls inherited _end functions like stateSynced Object
                this.inherited(arguments);
            }
        });
    });