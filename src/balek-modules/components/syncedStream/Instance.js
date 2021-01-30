define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Instance',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',],
    function (declare, lang, baseInstance, stateSyncer ,remoteCommander) {
        return declare("moduleBaseSyncedStreamInstance", [baseInstance, stateSyncer ,remoteCommander], {
            _instanceKey: null,
            _sessionKey: null,

            outputArray: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                console.log("moduleBaseSyncedStreamInstance starting...");
                this.outputArray = [];

                this._commands={
                    "preloadChunks" : lang.hitch(this, this.preloadChunksForInterface)
                };
                this.setInterfaceCommands();
                this.prepareSyncedState();

                this._interfaceState.set("Module", "moduleBaseSyncedStreamInstance");

            },
            appendOutput: function(outputToAppend){

                let newLength =   this.outputArray.push(outputToAppend);
                this.sendOutputChunk(newLength-1);

            },
            preloadChunksForInterface: function(preloadDepth, returnCallback){
               let maxLength =  this.outputArray.length;

               let preloadStart = maxLength -1 - preloadDepth;
               let preloadEnd = maxLength -1;

                preloadStart = preloadStart < 0  ? 0 : preloadStart;

                let outputToReturn = {};
                for(let i  = preloadStart; i <=preloadEnd; i++)
                {
                    outputToReturn[i] = this.outputArray[i];
                }
                returnCallback({streamSize: this.outputArray.length, preloadChunks: outputToReturn});

            },
            sendOutputChunk: function(position = null ){

                if(position === null)
                {

                }else if(this.outputArray[position] !== undefined)
                {
                    this._interfaceState.set("streamChunk", { streamSize:  this.outputArray.length,
                        position: position,
                        data: this.outputArray[position]} );
                }

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


