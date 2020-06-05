define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/Instance',
        'balek-modules/diaplode/navigator/Instance/navigator'
    ],
    function (declare, lang, topic, baseInstance, navigator) {
        return declare("moduleDiaplodeNavigatorModuleInstance", baseInstance, {
            _instanceKey: null,
            _navigator: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                console.log("moduleDiaplodeRadialNavigatorInstance starting...");
            },
            receiveMessage: function (moduleMessage, wssConnection, messageCallback) {
                if (moduleMessage.instanceKey == this._instanceKey) {
                    if (moduleMessage.messageData) {
                        if(moduleMessage.messageData.request){
                            if(moduleMessage.messageData.request === "Diaplode Navigator State"){
                                this._navigator = new navigator({_stateChangeInterfaceCallback: messageCallback});
                            }else if(this._navigator){
                                if( moduleMessage.messageData.request === "New Navigator Menu" && moduleMessage.messageData.name) {
                                    debugger;
                                    this._navigator.createNewNavigatorMenu(moduleMessage.messageData.name, messageCallback)
                                }
                                if( moduleMessage.messageData.request === "Change Navigator Menu Name" && moduleMessage.messageData.name && moduleMessage.messageData.menuKey) {
                                    debugger;
                                    this._navigator.changeNavigatorMenuName(moduleMessage.messageData.name, moduleMessage.messageData.menuKey);
                                }
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
            }
        });
    }
);


