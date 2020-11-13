define(['dojo/_base/declare',
        'dojo/topic',
        //Balek Interface Includes
        'balek-modules/diaplode/commander/Interface/terminal',
        'balek-modules/diaplode/commander/Interface/console',
        //Balek Interface Extensions
        'balek-modules/components/syncedCommander/Interface',],
    function (declare, topic, terminalInterface, consoleInterface,  _syncedCommanderInterface ) {
        return declare("moduleDiaplodeCommanderInterface", _syncedCommanderInterface, {
            _instanceKey: null,

            _terminalInterfaces:[],
            _consoleInterface: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                this._terminalInterfaces=[];
                console.log("moduleDiaplodeCommanderInterface started", this._instanceKey);
            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to be here so remoteCommander works
                this.inherited(arguments);
                if (name === "Status" && newState === "Ready") {
                    console.log("Instance Status:", newState);
                    //we could do something based on error status here
                }else if (name === "commanderConsoleInstanceKeys") {
                    //Check that we got all the keys
                    if(newState.instanceKey && newState.sessionKey && newState.userKey && newState.componentKey)
                    {
                        console.log("Creating contactsMenuInterface from Keys:", newState);
                        //create contactsMenuInterface from synced state keys
                        this._consoleInterface = new consoleInterface({   _instanceKey:newState.instanceKey,
                            _sessionKey:  newState.sessionKey,
                            _userKey: newState.userKey,
                            _componentKey: newState.componentKey,
                            _commanderInstanceCommands:  this._instanceCommands });
                    }
                }else if(name.toString().substr(0,29) === "commanderTerminalInstanceKeys" &&
                    newState.instanceKey && newState.componentKey && newState.sessionKey){
                    console.log("starttttttt");

                    this._terminalInterfaces.push(new terminalInterface({
                        _instanceKey:newState.instanceKey,
                        _componentKey:newState.componentKey,
                        _sessionKey:newState.sessionKey}))
                }
            }
        });
    }
);