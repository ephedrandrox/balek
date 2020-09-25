define(['dojo/_base/declare',
        'balek-modules/Instance',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',],
    function (declare, baseInstance, stateSyncer ,remoteCommander) {
        return declare("moduleBaseSyncedCommanderInstance", [baseInstance, stateSyncer ,remoteCommander], {
            _instanceKey: null,
            _sessionKey: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                console.log("moduleBaseSyncedCommanderInstance starting...");

                this.prepareSyncedState();
            },
            receiveMessage: function (moduleMessage, wssConnection, messageCallback) {
                if (moduleMessage.instanceKey == this._instanceKey) {
                    if (moduleMessage.messageData) {
                        if(moduleMessage.messageData.request){
                            if( moduleMessage.messageData.request === "Component Key") {
                                debugger;
                                messageCallback({componentKey: this._componentKey})  ;
                            }
                            if( moduleMessage.messageData.request === "Remote Command" &&
                                moduleMessage.messageData.remoteCommanderKey &&
                                moduleMessage.messageData.remoteCommand !== undefined) {

                                this.routeCommand(this._instanceKey,
                                    moduleMessage.messageData.remoteCommanderKey,
                                    moduleMessage.messageData.remoteCommand,
                                    messageCallback,
                                    moduleMessage.messageData.remoteCommandArguments);
                            }
                            if( moduleMessage.messageData.request === "State Connect" &&
                                moduleMessage.messageData.componentKey) {
                                this.connectInterface(this._instanceKey,
                                    moduleMessage.messageData.componentKey,
                                    messageCallback);
                            }
                        }
                    }
                } else {
                    console.log("received Module message with incorrect instanceKey",
                        moduleMessage.instanceKey, this._instanceKey)
                }
            }
        });
    }
);


