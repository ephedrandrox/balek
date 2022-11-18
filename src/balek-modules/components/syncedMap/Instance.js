define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Instance',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',],
    function (declare, lang, baseInstance, stateSyncer ,remoteCommander) {
        return declare("moduleBaseSyncedMapInstance", [baseInstance, stateSyncer ,remoteCommander], {
            _instanceKey: null,
            _sessionKey: null,

            _relayStateWatchHandle: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleBaseSyncedMapInstance starting...");
                this.prepareSyncedState();
                this._interfaceState.set("Module", "moduleBaseSyncedMapInstance");

            },
            add: function(key, value){
                this._interfaceState.set(key.toString(), value);
            },
            remove: function(key) {
                this._interfaceState.set(key.toString(), undefined);
            },
            relayState: function(state){
                for (const key in state) {
                    let value = state[key]
                    if(typeof value !== 'function' && key != "_attrPairNames"
                        && key != "declaredClass"){
                        console.log("adding available Sessions from  State", key, value)
                        this.add(key, value );
                    }
                }
                this._relayStateWatchHandle = state.watch(lang.hitch(this, this.onRelayStateChange))
            },
            onRelayStateChange: function(name, oldState, newState){
                console.log("onSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChange",name, oldState, newState)

                if (newState === undefined){
                    this.remove(name)
                    console.log("remove",name, oldState, newState)

                }else{
                    this.add(name, newState)
                    console.log("onSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChangeonSessionListChange",name, oldState, newState)
                }
            }
            ,
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


