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
                                if( moduleMessage.messageData.request === "Change Navigator Menu Active Status" && moduleMessage.messageData.status !== undefined && moduleMessage.messageData.menuKey) {
                                    debugger;
                                    this._navigator.changeNavigatorMenuActiveStatus(moduleMessage.messageData.status, moduleMessage.messageData.menuKey);
                                }
                                if( moduleMessage.messageData.request === "New Navigator Menu Item" && moduleMessage.messageData.menuKey) {
                                    debugger;
                                    this._navigator.createNewNavigatorMenuItem( moduleMessage.messageData.menuKey, messageCallback);
                                }
                            }
                        }
                        console.log(moduleMessage.messageData);
                    }
                } else {
                    console.log("received Module message with incorrect instanceKey", moduleMessage.instanceKey, this._instanceKey)
                }
            }
        });
    }
);


