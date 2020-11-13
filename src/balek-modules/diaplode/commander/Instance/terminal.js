define(['dojo/_base/declare',
        'dojo/_base/lang',
        //Balek Service Includes
        'balek-modules/diaplode/services/system/ssh/ssh',
        //Balek Instance Includes
        'balek-modules/components/syncedCommander/Instance',
    ],
    function (declare,
              lang,


              //Balek Service Includes
              sshService,
              //Balek Instance Includes
              _syncedCommanderInstance) {
        return declare("moduleDiaplodeCommanderInstanceTerminal", [_syncedCommanderInstance], {

            _sshService: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleDiaplodeCommanderInstanceTerminal");

                //set setRemoteCommander commands
                this._commands={
                    "connectTerminal": lang.hitch(this, this.connectTerminal),
                    "sendTerminalInput": lang.hitch(this, this.sendTerminalInput),
                    "dockInterface" : lang.hitch(this, this.dockInterface),
                    "undockInterface" : lang.hitch(this, this.undockInterface)
                };
                this.setInterfaceCommands();

                this._interfaceState.set("Component Name","terminal");
                //creates component Key that can be used to connect to state
                this.prepareSyncedState();


                this._interfaceState.set("terminalDocked", "false");
                this._interfaceState.set("terminalOutput", "");
                this._interfaceState.set("Status", "Ready");


            },
            //##########################################################################################################
            //Remote Command Functions Section
            //##########################################################################################################
            connectTerminal:  function(remoteCommandCallback)
            {
                remoteCommandCallback({success: "Connecting Terminal"});

                this._sshService = new sshService({sshUsername: "ephedrandrox", sshHostname: "localhost",
                    _onOutputCallback: lang.hitch(this, function(data){
                        this._interfaceState.set("terminalOutput",  this._interfaceState.get("terminalOutput")+data);
                    })});

            },
            sendTerminalInput: function( input){
                console.log(input);
                this._sshService.sendInput(input);
            },
            dockInterface: function()
            {
                this._interfaceState.set("terminalDocked", "true");
            },
            undockInterface: function()
            {
                this._interfaceState.set("terminalDocked", "false");
            },
            //##########################################################################################################
            //Instance Override Functions Section
            //##########################################################################################################
            _end: function(){
                //calls inherited _end functions like stateSynced Object
                this.inherited(arguments);
            }
        });
    });