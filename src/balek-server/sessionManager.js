define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/node!crypto',

        'dojo/Stateful',
        'balek-server/session/sessionsController',

        'balek-server/session/sessionsController/instanceCommands',

        'balek-server/session/session',
        'balek/sessionManager'],
    function (declare, lang, topic, crypto, Stateful, SessionsController, InstanceCommands, sessionManagerSession, balekSessionManager) {
        return declare("balekServerSessionManager", balekSessionManager, {

            _sessions: {},
            _sessionListsByUserKey: {},      //States in the Key of User

            InstanceCommands: null,
            _Controller: null,

            getUserSessionList: function(userKey){
                if(userKey && userKey.toString())
                    if( this._sessionListsByUserKey[userKey.toString()])
                    {
                        return this._sessionListsByUserKey[userKey.toString()]
                    }else {
                        let SessionList = declare([Stateful], {});
                        this._sessionListsByUserKey[userKey.toString()] = new SessionList({})
                        return this._sessionListsByUserKey[userKey.toString()]
                    }
                else {
                    console.log("Error: getUserSessionList invalid userKey", userKey)
                    return false
                }
            },
            constructor: function (args) {
                //todo add ability to remove session
                //todo remove sessions that have only the main module loaded and a disconnected socket

                declare.safeMixin(this, args);

                console.log("Initializing Balek Session Manager for server...");

                this._Controller = new SessionsController({_sessionsManager: this});

                this.InstanceCommands = new InstanceCommands();
                this._sessions = {};



                this.InstanceCommands.setCommand("getUserSessionList", lang.hitch(this, this.getUserSessionList))

                //##########################################################################################################
                //Migrate to SessionsController Section
                //##########################################################################################################


                topic.subscribe("requestSessionKey", lang.hitch(this, this.requestSessionKey));
                this.InstanceCommands.setCommand("requestSessionKey", lang.hitch(this, this.requestSessionKey))
                topic.subscribe("sessionCredentialsUpdate", lang.hitch(this, this.sessionCredentialsUpdate));

                topic.subscribe("getSessionUserGroups", lang.hitch(this, this.getSessionUserGroups));
                topic.subscribe("getSessionUserInfo", lang.hitch(this, this.getSessionUserInfo));
                topic.subscribe("getSessionUsername", lang.hitch(this, this.getSessionUsername));
                topic.subscribe("getSessionUserKey", lang.hitch(this, this.getSessionUserKey));

                topic.subscribe("getSessionStatus", lang.hitch(this, this.getSessionStatus));
                topic.subscribe("getSessionWSSConnection", lang.hitch(this, this.getSessionWSSConnection));
                topic.subscribe("getSessionWorkspaces", lang.hitch(this, this.getSessionWorkspaces));
                topic.subscribe("getSessionsForUser", lang.hitch(this, this.getSessionsForUser));

                topic.subscribe("getSessionsForUserKey", lang.hitch(this, this.getSessionsForUserKey));
                this.InstanceCommands.setCommand("getSessionsForUserKey", lang.hitch(this, this.getSessionsForUserKey))


                topic.subscribe("getSessionByKey", lang.hitch(this, this.getSessionByKey));
                this.InstanceCommands.setCommand("getSessionByKey", lang.hitch(this, this.getSessionByKey))



                topic.subscribe("setSessionDisconnected", lang.hitch(this, this.setSessionDisconnected));

                topic.subscribe("receiveSessionMessage", lang.hitch(this, this.receiveSessionMessage));
                topic.subscribe("receiveSessionManagerMessage", lang.hitch(this, this.receiveSessionManagerMessage));
                topic.subscribe("receiveWorkspaceMessage", lang.hitch(this, this.receiveWorkspaceMessage));

                topic.subscribe("addInstanceToSession", lang.hitch(this, this.addInstanceToSession));
                //##########################################################################################################
                //SessionsController Functions Section END
                //##########################################################################################################


            },
            receiveSessionMessage: function (sessionMessage, messageReplyCallback) {

                //todo replace this with a command manager

                if (sessionMessage.sessionRequest && sessionMessage.sessionKey) {

                if (sessionMessage.sessionRequest && sessionMessage.sessionRequest.sessionUnloadRequest && sessionMessage.sessionRequest.sessionUnloadRequest.sessionKey) {
                   // console.log(sessionMessage.sessionRequest.sessionUnloadRequest);
                    this.unloadSession(sessionMessage.sessionRequest.sessionUnloadRequest.sessionKey).then(function(value){
                        messageReplyCallback({success: "session Unloaded on server!",
                                                successMessage: value});
                    }).catch(function(error){
                        messageReplyCallback({error: "session could not be unloaded!",
                        errorMessage: error});
                    });

                    }else if(sessionMessage.sessionRequest && sessionMessage.sessionRequest.userSessionsListWatch){
                        if(sessionMessage.sessionRequest.userKey && sessionMessage.sessionRequest.userKey.toString()){
                            this._Controller.relayUserSessionsList(sessionMessage.sessionRequest.userKey.toString(), sessionMessage.sessionKey, messageReplyCallback)
                        }else{
                            messageReplyCallback({Error: "No UserKey Provided"})
                        }

                    }else if(this._sessions[sessionMessage.sessionKey]){
                        this._sessions[sessionMessage.sessionKey].sessionRequest(sessionMessage.sessionRequest, messageReplyCallback);
                    }else
                    {
                        console.log("Message for Unknown Session received. SessionKey:"+ sessionMessage.sessionKey, sessionMessage);
                        messageReplyCallback({success: "Message for Unknown Session received. SessionKey:"+ sessionMessage.sessionKey});

                    }

                } else {
                    console.log("unknown session message");
                }

            },
            receiveSessionManagerMessage: function (sessionManagerMessage) {
                console.log("receiveSessionManagerMessage",sessionManagerMessage , this._sessions)

                if (sessionManagerMessage.sessionKey && sessionManagerMessage.changeSessionKey) {
                    if (this._sessions[sessionManagerMessage.sessionKey]
                        && this._sessions[sessionManagerMessage.sessionKey]._wssConnection) {
                        this.changeSessionConnection(this._sessions[sessionManagerMessage.sessionKey]._wssConnection, sessionManagerMessage.changeSessionKey);
                       // this.unloadAllUserSessionsExcept(sessionManagerMessage.changeSessionKey);
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
                } else
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
                //todo make session.addInstance
                let session = this.getSession(sessionKey)
                if(session !== null  ){
                    session.addInstance(instance)
                }
            },
            requestSessionKey: function (wssConnection) {
                if (wssConnection._sessionKey === null) {
                    let sessionKey = this.getUniqueSessionKey();
                    wssConnection._sessionKey = sessionKey;
                    this._sessions[sessionKey] = new sessionManagerSession({
                        _sessionKey: sessionKey,
                        _wssConnection: wssConnection
                    });

                   // this._sessions[sessionKey].sendWorkspaces();

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
                                    // console.log("🟥🟧🟨🟩🟦🟪updateSessionStatus!",this._sessions,  credentialData.username,
                                    //    user.userKey,
                                    //     permissionGroups);

                                    this._sessions[wssConnection._sessionKey].updateSessionStatus({
                                        sessionStatus: 1,
                                        userName: credentialData.username,
                                        userKey: user.userKey,
                                        permissionGroups: permissionGroups
                                    });
                                    matched = true;
                                    // console.log("🟥🟧🟨🟩🟦🟪updateSessionStatus!",this._sessions,  credentialData.username,
                                    //     user.userKey,
                                    //     permissionGroups);

                                    let userSessionList =  this.getUserSessionList(user.userKey)
                                    console.log("sessions state:", userSessionList);

                                    if(userSessionList){
                                        userSessionList.set(String(wssConnection._sessionKey), String(wssConnection._sessionKey))
                                    }
                                    console.log("sessions state:", userSessionList);


                                    sessionUpdateReply({messageData: {message: "worked"}});
                                }
                            }
                            if (matched === false) {
                                sessionUpdateReply({error: {error: "Incorrect Credentials"}});

                            }
                        } else {
                            sessionUpdateReply({error: {error: "No User with that namex", userInfo: userInfo}});

                        }
                    }));
                } else {
                    sessionUpdateReply({error: {error: "Not enough Credentials supplied"}});
                }

            },
            unloadSession: function(sessionKey){

                //todo put this in a try/catch and use reject
                //Reject currently isn't in the logic
console.log("unloadSessionunloadSessionunloadSessionunloadSessionunloadSession🟥🟥🟥🟥🔸🔹🔴")
                //todo check that the session that is being unloaded belongs to the user that is asking for it to be unloaded
                //And that the session being switched to also is allowed
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                  try{
                      let sessionToUnload = this._sessions[sessionKey];
                      let sessionUserKey = sessionToUnload.getUserKey()
                      let resolveMessage = "normal";

                      let unloadAndResolve = lang.hitch(this, function(){
                          //todo, this should be a promise being returned from unload
                          sessionToUnload.unload();

                          let userSessionList =  this.getUserSessionList(sessionUserKey)
                          console.log("sessions state:", userSessionList);

                          if(userSessionList){
                              userSessionList.set(String(sessionKey), undefined)
                          }
                          console.log("sessions state:", userSessionList);


                          delete  this._sessions[sessionKey];
                          Resolve(resolveMessage);
                      });

                      if(this._sessions[sessionKey])
                      {

                          //if the session being unloaded is connected we need to do something
                          if(sessionToUnload._wssConnection != null && sessionToUnload._wssConnection._wssConnection != null &&
                              sessionToUnload._wssConnection.isConnected())
                          {
                              let foundAnotherSession = false;
                              this.getSessionsForUserKey(sessionToUnload.getUserKey(), lang.hitch(this, function(otherUserSessions){
                                  //if there are sessions, pick first one and make sure it isn't the one we are unloading

                                  otherUserSessions.forEach(lang.hitch(this, function(otherSession){
                                      debugger;
                                      if( foundAnotherSession === false && sessionToUnload._sessionKey !== otherSession._sessionKey &&
                                          otherSession._wssConnection === null || (otherSession._wssConnection && !otherSession._wssConnection.isConnected())){
                                          this.changeSessionConnection(sessionToUnload._wssConnection, otherSession._sessionKey);
                                          resolveMessage = "Session Removed, switched to session:" + otherSession.sessionKey;
                                          foundAnotherSession = true;
                                      }
                                  }));
                                  //if there are no sessions just disconnect
                                  if(foundAnotherSession === false)
                                  {
                                      resolveMessage = "Active Session being Removed, closing connection:" + sessionToUnload._sessionKey;
                                      //resolving here because user will be disconnected
                                      unloadAndResolve();
                                      sessionToUnload._wssConnection.close(resolveMessage, 3000);

                                  }else
                                  {
                                      //time to resolve removing after switching
                                      unloadAndResolve();
                                  }

                              }));
                          }else
                          {
                              unloadAndResolve();
                          }
                      }else
                      {
                          Reject("No session with that key was found:"+sessionKey);
                      }

                  }
                  catch(error)
                  {
                    Reject(error);
                  }
                }));



            },
            changeSessionConnection: function (wssConnection, changeSessionKey) {
                //if sessions have same user allow change
                console.log("changeSessionConnection wssConnection, changeSessionKey",wssConnection, changeSessionKey, this._sessions[wssConnection._sessionKey.toString()] && this._sessions[changeSessionKey.toString()],this._sessions)
                if (wssConnection && wssConnection._sessionKey && this._sessions[wssConnection._sessionKey.toString()] && this._sessions[changeSessionKey.toString()]) {
                    let oldSessionKey = wssConnection._sessionKey.toString();
                    let oldSession = this._sessions[oldSessionKey];
                    let newSessionKey = changeSessionKey.toString();
                    let newSession = this._sessions[newSessionKey];
                    if (oldSessionKey === newSessionKey) {
                        console.log("can not change session because both keys are the same");
                    } else if (oldSession.getUserKey() === newSession.getUserKey()) {
                        //also check that the session to switch too has unconnected status
                        console.log("Switching instances");
                        if(newSession._wssConnection != null &&
                            newSession._wssConnection.isConnected()){
                            console.log("Session Already has Connection, Disconnecting");
                            newSession._wssConnection._sessionKey = null;
                            newSession._wssConnection.close();
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
            unloadAllUserSessionsExcept: function(sessionKeyToKeep){
                let sessionUserKey = this._sessions[sessionKeyToKeep].getUserKey();
                this.getSessionsForUserKey(sessionUserKey, lang.hitch(this, function(sessionsForUser){
                    sessionsForUser.forEach(lang.hitch(this, function(session){
                        if(sessionKeyToKeep !== session._sessionKey)
                        {
                            this.unloadSession(session._sessionKey);
                        }
                    }));

                }));

            },
            setSessionDisconnected: function (sessionKey) {
                if(this._sessions[sessionKey] && this._sessions[sessionKey].updateSessionStatus)
                {
                    this._sessions[sessionKey].updateSessionStatus({sessionStatus: 2});
                }
            },


            //todo delete this after state update
            getSessionWorkspaces: function (sessionKey, workspacesReturn) {
                this._sessions[sessionKey].getWorkspaces();
            },
            getSession: function(sessionKey){
                if(this._sessions[sessionKey]){
                    return this._sessions[sessionKey]
                }else{
                    return null
                }
            },
            getSessionByKey: function(sessionKey, returnCallback = null){
                if(typeof returnCallback === 'function'){
                    returnCallback(this._sessions[sessionKey])
                }else{
                    return this._sessions[sessionKey]
                }
            },

            getSessionsForUser: function (username, sessionReturn) {

                let sessionsToReturn = [];
                for (var session in this._sessions) {

                    if (this._sessions[session].getUserName() == username) {
                        sessionsToReturn.push({
                            sessionKey: session,
                            sessionStatus: this._sessions[session].getStatus()
                        });
                    }
                }
                sessionReturn(sessionsToReturn);
            },
            getSessionsForUserKey: function (userKey, sessionReturn = null) {

                let sessionsToReturn = [];
                for (var session in this._sessions) {

                    if (this._sessions[session].getUserKey() == userKey) {
                        sessionsToReturn.push(this._sessions[session]);
                    }
                }
                if(typeof sessionReturn === 'function'){
                    sessionReturn(sessionsToReturn);
                }else{
                    return sessionsToReturn
                }
            },
            setSessionStatus: function (sessionKey, sessionStatus) {
                this._sessions[sessionKey].updateSessionStatus({sessionStatus: sessionStatus});
            },
            getSessionStatus: function (sessionKey, statusReturn) {
                statusReturn(this._sessions[sessionKey].getStatus());
            },
            getSessionWSSConnection: function (sessionKey, statusReturn) {
                if (this._sessions[sessionKey] && this._sessions[sessionKey]._wssConnection !== null) {
                    statusReturn(this._sessions[sessionKey]._wssConnection);
                } else {
                    statusReturn(null);
                }
            },
            getSessionUserGroups: function (sessionKey, returnUserGroups) {
                returnUserGroups(this._sessions[sessionKey].getPermissionGroups());
            },
            getSessionUserInfo: function (sessionKey, returnUserInfo) {
                //todo use state
                topic.publish("getUserFromDatabase", this._sessions[sessionKey].getUserName(), lang.hitch(this, function (userInfo) {
                    returnUserInfo(userInfo)
                }));
            },
            getSessionUsername: function (sessionKey, usernameReturn) {
                //todo call function in session object
                usernameReturn(this._sessions[sessionKey].getUsername());
            },
            getSessionUserKey: function(sessionKey, userKeyReturn){
                userKeyReturn(this._sessions[sessionKey].getUserKey());
            },
            getUniqueSessionKey: function () {
                do {
                    var id = crypto.randomBytes(20).toString('hex');
                    if (typeof this._sessions[id] == "undefined") return id;
                } while (true);

            }
        });
    });