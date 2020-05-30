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

                topic.subscribe("receiveSessionMessage", lang.hitch(this, this.receiveSessionMessage));
                topic.subscribe("receiveSessionManagerMessage", lang.hitch(this, this.receiveSessionManagerMessage));

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
                        let permissionGroups = this._session._sessionState.get("_permissionGroups");
                        let userName = this._session._sessionState.get("_username");
                        //copy these to session Change, maybe we should use the session info
                        //from the server in case we are admin entering a different users session


                        this._session.unload();
                        delete this._session;
                        console.log("Session Unloaded");
                        topic.publish("resetUI", lang.hitch(this, function () {
                            console.log("UI reset reset");

                            this._session = new sessionManagerSession({
                                _sessionKey: sessionManagerMessage.changeSessionKey,
                                _sessionStatus: 1
                            });

                            this._session.updateSessionState({
                                _sessionStatus: 1,
                                _permissionGroups: permissionGroups,
                                _username: userName
                            });
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
            sessionStatusActionReceived: function (sessionStatusAction) {
                if (sessionStatusAction.action) {
                    switch (sessionStatusAction.action) {
                        case "Session Status Changed":
                            this.sessionStatusChanged(sessionStatusAction);
                            break;
                    }
                }
            },

            sessionStatusChanged: function (sessionStatusAction) {
                if (sessionStatusAction.sessionStatus === 0) {
                    //new Session, not logged in
                    if (this._session === null && (sessionStatusAction.sessionKey != undefined)) {
                        //haven't logged in yet
                        this._session = new sessionManagerSession({
                            _sessionKey: sessionStatusAction.sessionKey,
                            _sessionStatus: sessionStatusAction.sessionStatus
                        });
                        //Server should send module as session changes
                    } else {
                        //already have a session
                    }
                } else if (sessionStatusAction.sessionStatus === 1) {
                    this._session.updateSessionState({
                        _sessionStatus: sessionStatusAction.sessionStatus,
                        _permissionGroups: sessionStatusAction.permissionGroups,
                        _username: sessionStatusAction.username
                    });
                }
            }

        });
    });