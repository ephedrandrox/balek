define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/Instance',
        'balek-modules/diaplode/navigator/Instance/navigator',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',

    ],
    function (declare, lang, topic, baseInstance, navigator, stateSyncer ,remoteCommander) {
        return declare("moduleDiaplodeNavigatorModuleInstance", baseInstance, {
            _instanceKey: null,
            _sessionKey: null,
            _navigator: null,
            _remoteCommander: null,
            _stateSyncer: null,

            constructor: function (args) {

                declare.safeMixin(this, args);
                this._remoteCommander= remoteCommander({_instanceKey: this._instanceKey});
                this._stateSyncer= new stateSyncer({_instanceKey: this._instanceKey});


                topic.publish("getSessionUserKey", this._sessionKey, lang.hitch(this, function(userKey){
                    this._navigator = new navigator({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey, _userKey: userKey});

                }));

                console.log("moduleDiaplodeRadialNavigatorInstance starting...");



            },
            receiveMessage: function (moduleMessage, wssConnection, messageCallback) {
                //todo remove this function and inherit synced commander
                if (moduleMessage.instanceKey == this._instanceKey) {
                    if (moduleMessage.messageData) {
                        if(moduleMessage.messageData.request){

                            if( moduleMessage.messageData.request === "Navigator Component Key") {
                                messageCallback({componentKey: this._navigator._componentKey})  ;
                            }

                                if( moduleMessage.messageData.request === "Remote Command" &&
                                    moduleMessage.messageData.remoteCommanderKey &&
                                    moduleMessage.messageData.remoteCommand !== undefined) {

                                     this._remoteCommander.routeCommand(this._instanceKey,
                                         moduleMessage.messageData.remoteCommanderKey,
                                         moduleMessage.messageData.remoteCommand,
                                         messageCallback,
                                         moduleMessage.messageData.remoteCommandArguments);

                                    }
                                if( moduleMessage.messageData.request === "State Connect" &&
                                    moduleMessage.messageData.componentKey) {

                                    this._stateSyncer.connectInterface(this._instanceKey,
                                        moduleMessage.messageData.componentKey,
                                        messageCallback);

                                }
                                if( moduleMessage.messageData.request === "Component State Connect" &&
                                    moduleMessage.messageData.componentKey) {

                                    this._stateSyncer.connectComponentInterface(this._instanceKey,
                                        moduleMessage.messageData.componentKey,
                                        moduleMessage.messageData.stateName,
                                        messageCallback);

                                }
                            if( moduleMessage.messageData.request === "Component State Update" &&
                                moduleMessage.messageData.componentKey) {
                                //debugger;
                                this._stateSyncer.updateComponentInterface(this._instanceKey,
                                    moduleMessage.messageData.componentKey,
                                    moduleMessage.messageData.stateName,
                                    moduleMessage.messageData.update);

                            }


                        }
                        //console.log(moduleMessage.messageData);
                    }
                } else {
                    console.log("received Module message with incorrect instanceKey",
                        moduleMessage.instanceKey, this._instanceKey)
                }
            },_end: function () {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    console.log("destroying navigator Module Interface ");


                    Resolve({success: "Unloaded Instance"});
                }));
            }
        });
    }
);


