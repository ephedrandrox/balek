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


            constructor: function (args) {
                //todo add ability to remove session
                //todo remove sessions that have only the main module loaded and a disconnected socket

                declare.safeMixin(this, args);

                console.log("Initializing Balek Session Manager for server...");

                this._Controller = new SessionsController({_sessionsManager: this});

                this.InstanceCommands = new InstanceCommands();
                this._sessions = {};




                //todo make manager commands shared object
                topic.subscribe("requestNewSession", lang.hitch(this, this.requestNewSession));
                topic.subscribe("setSessionDisconnected", lang.hitch(this, this.setSessionDisconnected));
                topic.subscribe("receiveSessionMessage", lang.hitch(this, this.receiveSessionMessage));
                topic.subscribe("receiveSessionManagerMessage", lang.hitch(this, this.receiveSessionManagerMessage));
                topic.subscribe("receiveWorkspaceMessage", lang.hitch(this, this.receiveWorkspaceMessage));



                //refactoring - refactor with module manager  waiting
                topic.subscribe("getSessionUserGroups", lang.hitch(this, this.getSessionUserGroups));
                topic.subscribe("getSessionStatus", lang.hitch(this, this.getSessionStatus));
                topic.subscribe("addInstanceToSession", lang.hitch(this, this.addInstanceToSession));


                //##########################################################################################################
                //Migrate to SessionsController Section
                //##########################################################################################################
                //   topic.subscribe("getSessionWorkspaces", lang.hitch(this, this.getSessionWorkspaces));
                //    topic.subscribe("getSessionsForUserKey", lang.hitch(this, this.getSessionsForUserKey));
                //   this.InstanceCommands.setCommand("getSessionsForUserKey", lang.hitch(this, this.getSessionsForUserKey))
                // topic.subscribe("getSessionByKey", lang.hitch(this, this.getSessionByKey));
                //topic.subscribe("getSessionWSSConnection", lang.hitch(this, this.getSessionWSSConnection));
                // topic.subscribe("getSessionsForUser", lang.hitch(this, this.getSessionsForUser));
                // topic.subscribe("getSessionUsername", lang.hitch(this, this.getSessionUsername));
                // topic.subscribe("getSessionUserInfo", lang.hitch(this, this.getSessionUserInfo));
                //    topic.subscribe("getSessionUserKey", lang.hitch(this, this.getSessionUserKey));
                //moving to controller
                topic.subscribe("sessionCredentialsUpdate", lang.hitch(this, this.sessionCredentialsUpdate));
                this.InstanceCommands.setCommand("getUserSessionList", lang.hitch(this, this.getUserSessionList))

                //##########################################################################################################
                //SessionsController Functions Section END
                //##########################################################################################################


            },
            //##########################################################################################################
            //Balek Protocol Receive Functions
            //##########################################################################################################
            receiveSessionMessage: function (sessionMessage, messageReplyCallback) {
                //todo replace this with a command manager
                if (sessionMessage.sessionRequest && sessionMessage.sessionKey) {
                    //Session Unload/Close Request received
                    //todo move to sessionManager message
                    if (sessionMessage.sessionRequest && sessionMessage.sessionRequest.sessionUnloadRequest
                        && sessionMessage.sessionRequest.sessionUnloadRequest.sessionKey) {
                       // console.log(sessionMessage.sessionRequest.sessionUnloadRequest);
                        this.unloadSession(sessionMessage.sessionRequest.sessionUnloadRequest.sessionKey).then(function(value){
                            messageReplyCallback({success: "session Unloaded on server!",
                                                    successMessage: value});
                        }).catch(function(error){
                            messageReplyCallback({error: "session could not be unloaded!",
                            errorMessage: error});
                        });
                        //Session User's Sessions List Request
                        //todo move to sessionManager message
                    }else if(sessionMessage.sessionRequest && sessionMessage.sessionRequest.userSessionsListWatch){
                        if(sessionMessage.sessionRequest.userKey && sessionMessage.sessionRequest.userKey.toString()){
                            this._Controller.relayUserSessionsList(sessionMessage.sessionRequest.userKey.toString(), sessionMessage.sessionKey, messageReplyCallback)
                        }else{
                            messageReplyCallback({Error: "No UserKey Provided"})
                        }
                    }else if(this._sessions[sessionMessage.sessionKey]){
                        //Send request to session with matching session Key
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
                        if (sessionManagerMessage.unloadAllOthers && sessionManagerMessage.unloadAllOthers === true){
                            this.unloadAllUserSessionsExcept(sessionManagerMessage.changeSessionKey);
                        }
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


            //##########################################################################################################
            //Private Session Management Functions
            //##########################################################################################################
            addInstanceToSession: function (sessionKey, instance) {
                //todo make session.addInstance
                let session = this.getSession(sessionKey)
                if(session !== null  ){
                    session.addInstance(instance)
                }
            },

            unloadSession: function(sessionKey){
                // summary:
                //          Returns a Promise to Unload a Session by sessionKey
                // description:
                //          Disconnects the session connected if connected and updates the
                //          userSessionList State for the associated user
                //
                // tags:
                //          private session management unload
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                  try{
                      let sessionToUnload = this._sessions[sessionKey];
                      let sessionUserKey = sessionToUnload.getUserKey()
                      if(sessionToUnload)
                      {
                          //if the session being unloaded is connected we need to do something
                          if(sessionToUnload._wssConnection != null && sessionToUnload._wssConnection._wssConnection != null &&
                              sessionToUnload._wssConnection.isConnected())
                          {
                              //Disconnect but tell them it's happening
                              sessionToUnload._wssConnection.close("Active Session being Removed, closing connection:", 3000);
                          }
                          //Request the session unload itself
                          sessionToUnload.unload();
                          //get the user session state list
                          let userSessionList =  this.getUserSessionList(sessionUserKey)
                          if(userSessionList){
                              //set the sessionKey to undefined in the list
                              userSessionList.set(String(sessionKey), undefined)
                          }
                          //delete the session from the sessions object
                          delete  this._sessions[sessionKey];
                          Resolve({Success: "No catches before session unload complete"});
                      }else
                      {
                          Reject({Error: "No session with that key was found",
                              sessionKey:sessionKey});
                      }
                  }
                  catch(error)
                  {
                    Reject({Error: "Session Manager unloadSession() Catch:", catchError: error});
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
                let userSessions = this.getUserSessionList(sessionUserKey)
                let sessionEntries = Object.entries(userSessions)
                for(sessionKeyIndex in sessionEntries)
                {
                    let sessionKey = sessionEntries[sessionKeyIndex][0]
                    sessionKey = userSessions.get(sessionKey)
                    if(sessionKey ){
                        if(sessionKeyToKeep !== sessionKey && this._sessions[sessionKey])
                        {
                            console.log("✅✅✅unloadAllUserSessionsExcept unloading sessionKey✅✅✅",sessionKey)
                            this.unloadSession(sessionKey);
                        }
                    }
                }
            },

            getSession: function(sessionKey){
                if(this._sessions[sessionKey]){
                    return this._sessions[sessionKey]
                }else{
                    return null
                }
            },
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
            getUniqueSessionKey: function () {
                do {
                    let id = crypto.randomBytes(20).toString('hex');
                    if (typeof this._sessions[id] == "undefined") return id;
                } while (true);

            },
            setSessionDisconnected: function (sessionKey) {
                if(this._sessions[sessionKey] && this._sessions[sessionKey].updateSessionStatus)
                {
                    this._sessions[sessionKey].updateSessionStatus({sessionStatus: 2});
                }
            },
            setSessionStatus: function (sessionKey, sessionStatus) {
                this._sessions[sessionKey].updateSessionStatus({sessionStatus: sessionStatus});
            },
            //##########################################################################################################
            //Move To Controller:
            //##########################################################################################################
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
            requestNewSession: function (wssConnection) {
                if (wssConnection._sessionKey === null) {
                    let sessionKey = this.getUniqueSessionKey();
                    wssConnection._sessionKey = sessionKey;
                    this._sessions[sessionKey] = new sessionManagerSession({
                        _sessionKey: sessionKey,
                        _wssConnection: wssConnection
                    });
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
            //##########################################################################################################
            //Refactoring
            //##########################################################################################################

            getSessionStatus: function (sessionKey, statusReturn) {
                //todo Refactor Module Manager FIrst
                statusReturn(this._sessions[sessionKey].getStatus());
            },

            getSessionUserGroups: function (sessionKey, returnUserGroups) {
                //todo Refactor Module Manager First
                returnUserGroups(this._sessions[sessionKey].getPermissionGroups());
            }



            //##########################################################################################################
            //Removing
            //##########################################################################################################
            // getSessionUserKey: function(sessionKey, userKeyReturn){
            //     userKeyReturn(this._sessions[sessionKey].getUserKey());
            // }

            // getSessionUserInfo: function (sessionKey, returnUserInfo) {
            //     //todo use state
            //     topic.publish("getUserFromDatabase", this._sessions[sessionKey].getUserName(), lang.hitch(this, function (userInfo) {
            //         returnUserInfo(userInfo)
            //     }));
            // },getSessionUserInfo: function (sessionKey, returnUserInfo) {
            //     //todo use state
            //     topic.publish("getUserFromDatabase", this._sessions[sessionKey].getUserName(), lang.hitch(this, function (userInfo) {
            //         returnUserInfo(userInfo)
            //     }));
            // },
            // getSessionUsername: function (sessionKey, usernameReturn) {
            //     //todo call function in session object
            //     usernameReturn(this._sessions[sessionKey].getUsername());
            // },
            // getSessionWSSConnection: function (sessionKey, statusReturn) {
            //     if (this._sessions[sessionKey] && this._sessions[sessionKey]._wssConnection !== null) {
            //         statusReturn(this._sessions[sessionKey]._wssConnection);
            //     } else {
            //         statusReturn(null);
            //     }
            // },
            //todo delete this after state update
            // getSessionWorkspaces: function (sessionKey, workspacesReturn) {
            //     this._sessions[sessionKey].getWorkspaces();
            // },

            // getSessionsForUser: function (username, sessionReturn) {
            //
            //     let sessionsToReturn = [];
            //     for (var session in this._sessions) {
            //
            //         if (this._sessions[session].getUserName() == username) {
            //             sessionsToReturn.push({
            //                 sessionKey: session,
            //                 sessionStatus: this._sessions[session].getStatus()
            //             });
            //         }
            //     }
            //     sessionReturn(sessionsToReturn);
            // },


            // getSessionsForUserKey: function (userKey, sessionReturn = null) {
            //
            //     let sessionsToReturn = [];
            //     for (var session in this._sessions) {
            //
            //         if (this._sessions[session].getUserKey() == userKey) {
            //             sessionsToReturn.push(this._sessions[session]);
            //         }
            //     }
            //     if(typeof sessionReturn === 'function'){
            //         sessionReturn(sessionsToReturn);
            //     }else{
            //         return sessionsToReturn
            //     }
            // },
        });
    });