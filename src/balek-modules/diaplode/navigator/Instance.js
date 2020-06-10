define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/Instance',
        'balek-modules/diaplode/navigator/Instance/navigator',
        'balek-modules/base/command/remote',

    ],
    function (declare, lang, topic, baseInstance, navigator, remoteCommander) {
        return declare("moduleDiaplodeNavigatorModuleInstance", baseInstance, {
            _instanceKey: null,
            _navigator: null,
            _remoteCommander: null,

            constructor: function (args) {

                declare.safeMixin(this, args);
                this._remoteCommander= remoteCommander({_instanceKey: this._instanceKey});
                console.log("moduleDiaplodeRadialNavigatorInstance starting...");
            },
            receiveMessage: function (moduleMessage, wssConnection, messageCallback) {
                if (moduleMessage.instanceKey == this._instanceKey) {
                    if (moduleMessage.messageData) {
                        if(moduleMessage.messageData.request){
                            if(moduleMessage.messageData.request === "New Navigator"){

                                if(this._navigator && this._navigator.setNewInterfaceCallback)
                                {
                                    this._navigator.setNewInterfaceCallback(messageCallback);
                                }else {
                                    this._navigator = new navigator({_instanceKey: this._instanceKey, _stateChangeInterfaceCallback: messageCallback});
                                }
                            }else if(this._navigator){
                                if( moduleMessage.messageData.request === "Remote Command" && moduleMessage.messageData.remoteCommanderKey && moduleMessage.messageData.remoteCommand !== undefined) {
                                     this._remoteCommander.routeCommand(this._instanceKey, moduleMessage.messageData.remoteCommanderKey, moduleMessage.messageData.remoteCommand, messageCallback, moduleMessage.messageData.remoteCommandArguments);
                                    }
                                if( moduleMessage.messageData.request === "New Navigator Menu" && moduleMessage.messageData.name && moduleMessage.messageData.menuKey === undefined) {

                                    this._navigator.createNewNavigatorMenu(moduleMessage.messageData.name, messageCallback);
                                }
                                if( moduleMessage.messageData.request === "New Navigator Menu" && moduleMessage.messageData.name && moduleMessage.messageData.menuKey) {
                                    debugger;
                                    this._navigator.connectNavigatorMenuInterface(moduleMessage.messageData.menuKey, messageCallback);
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
            },_end: function () {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    console.log("destroying navigator Module Interface ");


                    Resolve({success: "Unloaded Instance"});
                }));
            }
        });
    }
);


