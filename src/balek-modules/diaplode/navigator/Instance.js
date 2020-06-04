define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',

        'balek-modules/Instance',
    ],
    function (declare, lang, topic, Stateful, baseInstance) {
        return declare("moduleDiaplodeRadialNavigatorInstance", baseInstance, {
            _instanceKey: null,
            _instanceState: null,
            _remoteInterfaceStateUpdateRemoteCallback: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                let instanceState = declare([Stateful], {
                    activeMenus: null,
                    availableMenus: null,
                });

                this._instanceState = new instanceState({
                    activeMenus: new Array(),
                    availableMenus: new Array(),
                });

                this._interfaceStateWatchHandle = this._instanceState.watch(lang.hitch(this, this.onInterfaceStateChange));

                console.log("moduleDiaplodeRadialNavigatorInstance starting...");
            },
            onInterfaceStateChange: function(){
                this._remoteInterfaceStateUpdateRemoteCallback({instanceState: JSON.stringify(this._instanceState)});
            },
            receiveMessage: function (moduleMessage, wssConnection, messageCallback) {
                if (moduleMessage.instanceKey == this._instanceKey) {
                    if (moduleMessage.messageData) {
                        if(moduleMessage.messageData.request){
                            if(moduleMessage.messageData.request === "Diaplode Navigator State"){
                                messageCallback({instanceState: JSON.stringify(this._instanceState)});
                                this._remoteInterfaceStateUpdateRemoteCallback = messageCallback;
                            }else if(moduleMessage.messageData.request === "New Navigator Menu" && moduleMessage.messageData.name){
                                this.createNewNavigatorMenu(moduleMessage.messageData.name)
                            }

                        }
                        console.log(moduleMessage.messageData);
                    }
                } else {
                    console.log("received Module message with incorrect instanceKey", moduleMessage.instanceKey, this._instanceKey)
                }
            },
            _end: function () {
                //overwrite this and reject to keep module instance from being unloaded
                //Until all resources can be released.
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    this._interfaceStateWatchHandle.unwatch();
                    this._interfaceStateWatchHandle.remove();
                    Resolve({success: "Unloaded Instance"});
                }));
            },
            createNewNavigatorMenu: function(name){

                let originalMenus = this._instanceState.get("availableMenus");
                originalMenus.push({name: name});
                this._instanceState.set("availableMenus", originalMenus);
            }
        });
    }
);


