define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'balek/session/session',
        'balek-client/session/workspaceManager'],
    function (declare, lang, topic, Stateful, balekSessionManagerSession, balekWorkspaceManger) {


        return declare("balekClientSessionManagerSession", balekSessionManagerSession, {

            _sessionState: null,
            _workspaceManager: null,
            _getSessionStateTopicHandle: null,
            _sessionKey: null,

           // _Controller: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                this._workspaceManager = new balekWorkspaceManger({_sessionKey: this._sessionKey});
              //  this._Controller = new SessionController({_session: this});


                let sessionState = declare([Stateful], {
                    _sessionKey: null,
                    _sessionStatus: null,
                    _permissionGroups: null,
                    _username: null
                });

                this._sessionState = new sessionState({
                    _sessionKey: this._sessionKey,
                    _sessionStatus: this._sessionStatus
                });

                this._getSessionStateTopicHandle = {};
                this._getSessionStateTopicHandle = topic.subscribe("getSessionState", lang.hitch(this, this.getSessionState));




                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    sessionMessage: {
                        sessionKey: this._sessionKey,
                        sessionRequest: {
                            interfaceLoadRequest: {
                                requestType: "all"
                            }
                        }
                    }
                }, lang.hitch(this, this.onInterfaceLoadRequestReply));


                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    sessionMessage: {
                        sessionKey: this._sessionKey,
                        sessionRequest: {
                            interfaceConnectSyncedStateRequest: {

                            }
                        }
                    }
                }, lang.hitch(this, this.onSyncedStateChangeCallback));



            },
            onSyncedStateChange: function(name, oldState, newState){
               console.log(name, newState);
            },
            onInterfaceLoadRequestReply(interfaceLoadRequest) {
                let sessionMessage = interfaceLoadRequest.sessionMessage;

                if (sessionMessage.sessionKey && sessionMessage.sessionKey.toString() === this._sessionKey.toString() && sessionMessage.interfaceLoadRequestReply) {
                    let interfaceLoadRequestReply = sessionMessage.interfaceLoadRequestReply;
                    if (interfaceLoadRequestReply.interfaceData && interfaceLoadRequestReply.workspaceData
                        && interfaceLoadRequestReply.backgroundComponent !== undefined) {
                        let interfaceData = interfaceLoadRequestReply.interfaceData;
                        let workspaceData = interfaceLoadRequestReply.workspaceData;
                        let backgroundComponent = interfaceLoadRequestReply.backgroundComponent;

                        this.loadInterfacesForSession(interfaceData)
                            .then(lang.hitch(this, function () {
                            })).catch(lang.hitch(this, function (error) {
                            console.log("Error Loading Interfaces", error);
                        }));
                    }
                }
            },
            loadInterfacesForSession(interfaceLoadData) {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {

                    let loadedCount = 0;
                    let amountToLoad = Object.keys(interfaceLoadData).length;

                    let oneLoaded = function () {
                        loadedCount++;
                        if (loadedCount === amountToLoad) {
                            Resolve();
                        }
                    };
                    for (const interfaceKey in interfaceLoadData) {
                        let interfaceObject = interfaceLoadData[interfaceKey];
                        let moduleName = interfaceObject.moduleName;
                        let modulePath = "balek-modules/" + interfaceObject.moduleName + "/Interface";
                        let instanceKey = interfaceObject.instanceKey;
                        topic.publish("getInterfaceFromInstanceKey", instanceKey, function(interfaceForInstance){

                            if(interfaceForInstance === false){

                                topic.publish("loadModuleInterface", moduleName, modulePath, instanceKey, function (loadedInterface) {
                                    oneLoaded();
                                });


                            }else{
                                oneLoaded();
                            }
                        });

                    }
                    //todo could set a timeout to reject after enough loading time
                }));
            },
            updateSessionState: function (args) {
                declare.safeMixin(this._sessionState, args);

            },
            userInGroup: function (group) {
                let permissionGroups = this._sessionState.get("_permissionGroups");
                if (Array.isArray(permissionGroups) && permissionGroups.includes(group)) {
                    return true;
                } else {
                    return false;
                }
            },
            getSessionState: function (sessionStateReturn) {
                if(sessionStateReturn){
                    sessionStateReturn(this._syncedState);
                }else{
                    return this._syncedState
                }
            },
            unload: function () {
                this._getSessionStateTopicHandle.remove();
                this._workspaceManager.unload();
                this.inherited(arguments);

            }
        });
    });