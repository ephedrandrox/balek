define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',],
    function (declare, lang, baseInterface, stateSyncer ,remoteCommander ) {
        return declare("moduleBaseSyncedCommanderInterface", [baseInterface, stateSyncer ,remoteCommander ],{
            _instanceKey: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleBaseSyncedCommanderInterface started");

                if(!this._componentKey){
                    this.sendInstanceCallbackMessage({
                        request: "Component Key",
                    }, lang.hitch(this, function (requestResults) {
                      //  console.log("got command return results", requestResults);
                        this._componentKey = requestResults.componentKey
                        this.askToConnectInterface();

                    }));
                }else {
                    this.askToConnectInterface();
                }
            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommands and link them
                if (name === "interfaceRemoteCommands") {
                    this.linkRemoteCommands(newState);
                }
                //We Also Check for interfaceRemoteCommandKey so we can send commands
                if (name === "interfaceRemoteCommandKey") {
                   // console.log("Remote COmmander Key!");
                    this._interfaceRemoteCommanderKey = newState;
                }

            }
        });
    }
);



