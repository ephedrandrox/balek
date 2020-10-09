define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'balek-client/session/session',
        'balek/sessionManager'],
    function (declare,
              lang,
              topic,
              Stateful,
              sessionManagerSession,
              balekSessionManager) {

        return declare("balekClientSessionManager", balekSessionManager, {

            _session: null,
            _availableSessionsState: null,
            constructor: function (args) {

                declare.safeMixin(this, args);

                let availableSessionsState = declare([Stateful], {
                    availableSessions: null
                });

                this._availableSessionsState = new availableSessionsState({
                    availableSessions: {}
                });


                topic.subscribe("sessionStatusActionReceived", lang.hitch(this, this.sessionStatusActionReceived));

                topic.subscribe("requestNewWorkspace", lang.hitch(this, this.requestNewWorkspace));
                topic.subscribe("requestSessionChange", lang.hitch(this, this.requestSessionChange));
                topic.subscribe("requestSessionChangeAndUnloadAll", lang.hitch(this, this.requestSessionChangeAndUnloadAll));
                topic.subscribe("requestSessionUnloadModuleInstance", lang.hitch(this, this.requestSessionUnloadModuleInstance));
                topic.subscribe("requestSessionUnload", lang.hitch(this, this.requestUnloadSession));


                topic.subscribe("receiveSessionMessage", lang.hitch(this, this.receiveSessionMessage));
                topic.subscribe("receiveSessionManagerMessage", lang.hitch(this, this.receiveSessionManagerMessage));

               //todo remove this
                topic.subscribe("getAvailableSessionsState", lang.hitch(this, this.getAvailableSessionsState));


            },
            getAvailableSessionsState: function (availableSessionsStateReturn) {
                availableSessionsStateReturn(this._availableSessionsState);
                this.getAvailableSessionsFromServer();
            },
            getAvailableSessionsFromServer: function () {
                topic.publish("sendBalekProtocolMessage", {
                    sessionManagerMessage: {
                        sessionKey: this._session._sessionKey,
                        requestAvailableSessions: true
                    }
                });
            },
            receiveSessionMessage: function (sessionMessage) {

                if (sessionMessage.workspacesUpdate && sessionMessage.sessionKey) {
                    this._session._workspaceManager.workspacesUpdate(sessionMessage.workspacesUpdate);
                } else if(!sessionMessage.interfaceLoadRequestReply) {
                    console.log("unknown session message", sessionMessage);
                }
            },
            receiveSessionManagerMessage: function (sessionManagerMessage) {
                if (sessionManagerMessage.changeSessionKey) {
                    topic.publish("unloadAllInterfaces", lang.hitch(this, function () {
                        console.log("interaces down");
                        let permissionGroups = this._session.getPermissionGroups();
                        let userName = this._session.getUserName();
                        //copy these to session Change, maybe we should use the session info
                        //from the server in case we are admin entering a different users session


                        this._session.unload();
                        delete this._session;
                        console.log("Session Unloaded");
                        topic.publish("resetUI", lang.hitch(this, function () {
                            console.log("UI reset reset");
//make a new session here by using the function in this object that I am going to make
                            this._session = new sessionManagerSession({
                                _sessionKey: sessionManagerMessage.changeSessionKey //,
                          //      _sessionStatus: 1
                            });

                           // this._session.updateSessionState({
                           //     _sessionStatus: 1,
                           //     _permissionGroups: permissionGroups,
                           //     _username: userName
                          //  });
                            topic.publish("loadBackground", "flowerOfLife");

                        }));
                    }));
                } else if (sessionManagerMessage.availableSessions) {
                    this._availableSessionsState.set("availableSessions", sessionManagerMessage.availableSessions);
                } else {
                    console.log("unknown session message", sessionManagerMessage);
                }
            },
            requestNewWorkspace: function () {
                topic.publish("sendBalekProtocolMessage", {
                    sessionMessage: {
                        sessionKey: this._session._sessionKey,
                        sessionRequest: {
                            workspaceRequest: {
                                requestType: "new"
                            }
                        }
                    }
                });
            },
            requestSessionChange: function (changeSessionKey) {
                topic.publish("sendBalekProtocolMessage", {
                    sessionManagerMessage: {
                        sessionKey: this._session._sessionKey,
                        changeSessionKey: changeSessionKey
                    }
                });
            },
            requestSessionChangeAndUnloadAll: function(changeSessionKey)
            {
                topic.publish("sendBalekProtocolMessage", {
                    sessionManagerMessage: {
                        sessionKey: this._session._sessionKey,
                        changeSessionKey: changeSessionKey,
                        changeSessionOptionUnloadAll: true
                    }
                });
            },
            requestSessionUnloadModuleInstance: function(sessionModuleInstanceKey, serverReplyCallback){
                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    sessionMessage: {
                        sessionKey: this._session._sessionKey,
                        sessionRequest: {
                            moduleUnloadRequest: {
                                sessionModuleInstanceKey: sessionModuleInstanceKey
                            }
                        }
                    }
                }, serverReplyCallback);
            },
            requestUnloadSession: function (sessionKey, serverReplyCallback){
                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    sessionMessage: {
                        sessionKey: this._session._sessionKey,
                        sessionRequest: {
                           sessionUnloadRequest: {
                                sessionKey: sessionKey
                            }
                        }
                    }
                }, serverReplyCallback);
            },
            sessionStatusActionReceived: function (sessionStatusAction) {
                if (sessionStatusAction.action) {
                    switch (sessionStatusAction.action) {
                        case "New Session":
                            if(sessionStatusAction.sessionKey != undefined){
                                this.createNewSessionInterface(sessionStatusAction.sessionKey);
                            }
                            break;
                    }
                }
            },

            createNewSessionInterface: function (sessionKey) {
                if (this._session === null &&  sessionKey != undefined) {
                    //haven't logged in yet
                    this._session = new sessionManagerSession({
                        _sessionKey: sessionKey
                    });
                } else {
                    //already have a session
                }
            }


        });
    });