define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/node!crypto',

        'balek-server/session/session',
        'balek/sessionManager'],
    function (declare, lang, topic, crypto, sessionManagerSession, balekSessionManager) {
        return declare("balekServerSessionManager", balekSessionManager, {

            _sessions: {},

            constructor: function (args) {
                //todo add ability to remove session
                //todo remove sessions that have only the main module loaded and a disconnected socket

                declare.safeMixin(this, args);

                console.log("Initializing Balek Session Manager for server...");

                this._sessions = {};

                topic.subscribe("requestSessionKey", lang.hitch(this, this.requestSessionKey));
                topic.subscribe("sessionCredentialsUpdate", lang.hitch(this, this.sessionCredentialsUpdate));

                topic.subscribe("getSessionUserGroups", lang.hitch(this, this.getSessionUserGroups));
                topic.subscribe("getSessionUserInfo", lang.hitch(this, this.getSessionUserInfo));
                topic.subscribe("getSessionUsername", lang.hitch(this, this.getSessionUsername));
                topic.subscribe("getSessionUserKey", lang.hitch(this, this.getSessionUserKey));

                topic.subscribe("getSessionStatus", lang.hitch(this, this.getSessionStatus));
                topic.subscribe("getSessionWSSConnection", lang.hitch(this, this.getSessionWSSConnection));
                topic.subscribe("getSessionWorkspaces", lang.hitch(this, this.getSessionWorkspaces));
                topic.subscribe("getSessionsForUser", lang.hitch(this, this.getSessionsForUser));

                topic.subscribe("setSessionDisconnected", lang.hitch(this, this.setSessionDisconnected));

                topic.subscribe("receiveSessionMessage", lang.hitch(this, this.receiveSessionMessage));
                topic.subscribe("receiveSessionManagerMessage", lang.hitch(this, this.receiveSessionManagerMessage));
                topic.subscribe("receiveWorkspaceMessage", lang.hitch(this, this.receiveWorkspaceMessage));

                topic.subscribe("addInstanceToSession", lang.hitch(this, this.addInstanceToSession));

            },
            receiveSessionMessage: function (sessionMessage, messageReplyCallback) {

                if (sessionMessage.sessionRequest && sessionMessage.sessionKey) {

                if (sessionMessage.sessionRequest && sessionMessage.sessionRequest.sessionUnloadRequest && sessionMessage.sessionRequest.sessionUnloadRequest.sessionKey) {
                    console.log(sessionMessage.sessionRequest.sessionUnloadRequest);
                    this.unloadSession(sessionMessage.sessionRequest.sessionUnloadRequest.sessionKey);
                    messageReplyCallback({success: "session Unloaded on server!"});

                    }else {
                    this._sessions[sessionMessage.sessionKey].sessionRequest(sessionMessage.sessionRequest, messageReplyCallback);

                }

                } else {
                    console.log("unknown session message");
                }

            },
            receiveSessionManagerMessage: function (sessionManagerMessage) {
                debugger;

                if (sessionManagerMessage.sessionKey && sessionManagerMessage.changeSessionKey) {
                    if (this._sessions[sessionManagerMessage.sessionKey]
                        && this._sessions[sessionManagerMessage.sessionKey]._wssConnection) {
                        this.changeSessionConnection(this._sessions[sessionManagerMessage.sessionKey]._wssConnection, sessionManagerMessage.changeSessionKey);

                    }
                } else if (sessionManagerMessage.sessionKey && sessionManagerMessage.requestAvailableSessions) {
//todo remove this and set up retreievable state object
                    if (this._sessions[sessionManagerMessage.sessionKey] && this._sessions[sessionManagerMessage.sessionKey]._wssConnection) {
                        let sessionsToReturn = {};
                        let allSessions = this._sessions;
                        let currentSession = this._sessions[sessionManagerMessage.sessionKey];
                        let returnConnection = this._sessions[sessionManagerMessage.sessionKey]._wssConnection;
                        let currentSessionUserInfo = currentSession.getUserInfo();

                        for (const sessionKey in allSessions) {

                            let checkSessionUserInfo = allSessions[sessionKey].getUserInfo();
                            if (allSessions[sessionKey]._workspaceManager && checkSessionUserInfo.userKey === currentSessionUserInfo.userKey) {
                                sessionsToReturn[sessionKey] = {
                                    sessionKey: sessionKey,
                                    workspaces: allSessions[sessionKey]._workspaceManager.getWorkspaces(),
                                    interfaces: allSessions[sessionKey].getInstances()
                                }
                            } else {
                            }

                        }

                        topic.publish("sendBalekProtocolMessage", returnConnection, {
                            sessionManagerMessage: {
                                availableSessions: sessionsToReturn
                            }
                        });
                    }
                }
               else
                    {
                    console.log("unknown session Manager message");
                }

            },
            receiveWorkspaceMessage: function (workspaceMessage, messageReplyCallback) {

                if (workspaceMessage.sessionKey && this._sessions[workspaceMessage.sessionKey]) {
                    this._sessions[workspaceMessage.sessionKey]._workspaceManager.receiveWorkspaceMessage(workspaceMessage, messageReplyCallback);
                } else {
                    messageReplyCallback({
                        error: "Server Session Manager: not a valid session key when adding to Workspace",
                        sessionKey: workspaceMessage.sessionKey
                    });
                }

            },
            addInstanceToSession: function (sessionKey, instance) {
                this._sessions[sessionKey]._instances[instance._instanceKey] = instance;
            },
            requestSessionKey: function (wssConnection) {

                if (wssConnection._sessionKey === null) {
                    let sessionKey = this.getUniqueSessionKey();
                    wssConnection._sessionKey = sessionKey;

                    this._sessions[sessionKey] = new sessionManagerSession({
                        _sessionKey: sessionKey,
                        _wssConnection: wssConnection
                    });

                    this._sessions[sessionKey].sendWorkspaces();

                    topic.publish("getMainModuleSettingsWithCallback", lang.hitch(this, function (mainModule) {
                        topic.publish("loadModuleForClient", wssConnection, mainModule, lang.hitch(function (moduleInterface) {
                            if (moduleInterface === null) {
                                //error
                            } else {
                                topic.publish("sendBalekProtocolMessage", wssConnection, moduleInterface);
                            }
                        }));
                    }));
                }

            },
            sessionCredentialsUpdate: function (wssConnection, credentialData, sessionUpdateReply) {

                if (wssConnection._sessionKey && credentialData.username && credentialData.password) {
                    topic.publish("getUserFromDatabase", credentialData.username, lang.hitch(this, function (userInfo) {
                        if (Array.isArray(userInfo) && userInfo.length >= 1) {
                            let matched = false;
                            for (const user of userInfo) {
                                if (credentialData.password === user.password) {
                                    //user Log in Success
                                    //updateSession
                                    let permissionGroups = JSON.parse(String.fromCharCode(...new Uint8Array(user.permission_groups)));
                                    this._sessions[wssConnection._sessionKey].updateSessionStatus({
                                        _sessionStatus: 1,
                                        _username: credentialData.username,
                                        _userKey: user.userKey,
                                        _permissionGroups: permissionGroups
                                    });
                                    matched = true;
                                    sessionUpdateReply({messageData: {message: "worked"}});
                                }
                            }
                            if (matched === false) {
                                sessionUpdateReply({error: {error: "Incorrect Credentials"}});

                            }
                        } else {
                            sessionUpdateReply({error: {error: "No User with that name"}});

                        }
                    }));
                } else {
                    sessionUpdateReply({error: {error: "Not enough Credentials supplied"}});
                }

            },
            unloadSession: function(sessionKey){

                //todo make unload return a promise and use it here
                this._sessions[sessionKey].unload();
                delete  this._sessions[sessionKey];

            },
            changeSessionConnection: function (wssConnection, changeSessionKey) {
                //if sessions have same user allow change
                if (wssConnection._sessionKey && this._sessions[wssConnection._sessionKey.toString()] && this._sessions[changeSessionKey.toString()]) {
                    let oldSessionKey = wssConnection._sessionKey.toString();
                    let oldSession = this._sessions[oldSessionKey];
                    let newSessionKey = changeSessionKey.toString();
                    let newSession = this._sessions[newSessionKey];
                    if (oldSessionKey === newSessionKey) {
                        console.log("can not change session because both keys are the same");
                    } else if (oldSession.userKey === newSession.userKey) {
                        //also check that the session to switch too has unconnected status
                        console.log("Switching instances");
                        if(newSession._wssConnection != null &&
                            newSession._wssConnection.readyState === newSession._wssConnection.OPEN){
                            console.log("Session Already has Connection, Disconnecting");
                            newSession._wssConnection.sessionKey = null;
                            newSession._wssConnection._wssConnection.close();
                        }
                        oldSession._wssConnection = null;
                        wssConnection._sessionKey = newSessionKey;
                        newSession._wssConnection = wssConnection;

                        this.setSessionStatus(newSessionKey, 1);
                        this.setSessionStatus(oldSessionKey, 2);
                        topic.publish("sendBalekProtocolMessage", wssConnection, {
                            sessionManagerMessage: {
                                changeSessionKey: newSessionKey
                            }
                        });

                    }
                } else {
                    console.log("can not change session Connection because of invalid keys")
                }

            },
            setSessionDisconnected: function (sessionKey) {
                if(this._sessions[sessionKey])
                {
                    this._sessions[sessionKey].updateSessionStatus({_sessionStatus: 2});
                }
            },
            getSessionWorkspaces: function (sessionKey, workspacesReturn) {
                this._sessions[sessionKey].getWorkspaces();
            },
            getSessionsForUser: function (username, sessionReturn) {

                let sessionsToReturn = [];
                for (var session in this._sessions) {

                    if (this._sessions[session]._username == username) {
                        sessionsToReturn.push({
                            sessionKey: session,
                            sessionStatus: this._sessions[session]._sessionStatus
                        });
                    }
                }
                sessionReturn(sessionsToReturn);
            },
            setSessionStatus: function (sessionKey, sessionStatus) {
                this._sessions[sessionKey]._sessionStatus = sessionStatus;
            },
            getSessionStatus: function (sessionKey, statusReturn) {
                statusReturn(this._sessions[sessionKey]._sessionStatus);
            },
            getSessionWSSConnection: function (sessionKey, statusReturn) {
                if (this._sessions[sessionKey] && this._sessions[sessionKey]._wssConnection !== null) {
                    statusReturn(this._sessions[sessionKey]._wssConnection);
                } else {
                    statusReturn(null);
                }
            },
            getSessionUserGroups: function (sessionKey, returnUserGroups) {
                returnUserGroups(this._sessions[sessionKey]._permissionGroups);
            },
            getSessionUserInfo: function (sessionKey, returnUserInfo) {
                topic.publish("getUserFromDatabase", this._sessions[sessionKey]._username, lang.hitch(this, function (userInfo) {
                    returnUserInfo(userInfo)
                }));
            },
            getSessionUsername: function (sessionKey, usernameReturn) {
                //todo call function in session object
                usernameReturn(this._sessions[sessionKey]._username);
            },
            getSessionUserKey: function(sessionKey, userKeyReturn){
                userKeyReturn(this._sessions[sessionKey]._userKey);
            },
            getUniqueSessionKey: function () {
                do {
                    var id = crypto.randomBytes(20).toString('hex');
                    if (typeof this._sessions[id] == "undefined") return id;
                } while (true);

            }
        });
    });