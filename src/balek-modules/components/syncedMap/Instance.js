define(['dojo/_base/declare',
        'balek-modules/Instance',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',],
    function (declare, baseInstance, stateSyncer ,remoteCommander) {
        return declare("moduleBaseSyncedMapInstance", [baseInstance, stateSyncer ,remoteCommander], {
            _instanceKey: null,
            _sessionKey: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                console.log("moduleBaseSyncedMapInstance starting...");

                this.prepareSyncedState();

                this._interfaceState.set("Module", "moduleBaseSyncedMapInstance");

            },
            add: function(key, value){
                this._interfaceState.set(key.toString(), value);
            },
            receiveMessage: function (moduleMessage, wssConnection, messageCallback) {
                if (moduleMessage.instanceKey == this._instanceKey) {
                    if (moduleMessage.messageData) {
                        if(moduleMessage.messageData.request){
                            if( moduleMessage.messageData.request === "Component Key") {
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
                            if( moduleMessage.messageData.request === "Component State Connect" &&
                                moduleMessage.messageData.componentKey) {
                                this.connectComponentInterface(this._instanceKey,
                                    moduleMessage.messageData.componentKey,
                                    moduleMessage.messageData.stateName,
                                    messageCallback);

                            }
                            if( moduleMessage.messageData.request === "Component State Update" &&
                                moduleMessage.messageData.componentKey) {
                                this.updateComponentInterface(this._instanceKey,
                                    moduleMessage.messageData.componentKey,
                                    moduleMessage.messageData.stateName,
                                    moduleMessage.messageData.update);

                            }
                            if( moduleMessage.messageData.request === "Component State Default" &&
                                moduleMessage.messageData.componentKey) {
                                this.updateComponentStateDefaultValue(this._instanceKey,
                                    moduleMessage.messageData.componentKey,
                                    moduleMessage.messageData.stateName,
                                    moduleMessage.messageData.default);

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


