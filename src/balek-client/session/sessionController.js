//##########################################################################################################
//Interface User Manager
//##########################################################################################################


define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/Stateful",
        "balek-client/session/sessionController/interfaceCommands",

    ],
    function (declare, lang, topic, Stateful, InterfaceCommands) {

        return declare("sessionController", null, {

            _interfaceCommands: null,


            userSessionsList: null,

            userSessionStates: null,

            activeSessionInfo: null, //state object

            constructor: function (args) {

                declare.safeMixin(this, args);

                const ActiveSessionInfo = declare([Stateful], {})
                this.activeSessionInfo = new ActiveSessionInfo()

                this.userSessionStates = {}

                this._interfaceCommands = new InterfaceCommands();
                this._interfaceCommands.setCommand("getSessionUserKey", lang.hitch(this, this.getSessionUserKey))
                this._interfaceCommands.setCommand("getSessionState", lang.hitch(this, this.getSessionState))
                this._interfaceCommands.setCommand("getUserSessionsList", lang.hitch(this, this.getUserSessionsList))
                this._interfaceCommands.setCommand("requestSessionChange", lang.hitch(this, this.requestSessionChange))

                this._interfaceCommands.setCommand("requestSessionNameChange", lang.hitch(this, this.requestSessionNameChange))



            },
            //##########################################################################################################
            //Interface Commands
            //##########################################################################################################
            getSessionUserKey(){
                //Get session user key
                return this._session.getUserKey()
            },
            getSessionState(sessionKey = null){
                // summary:
                //      If no session Key is specified, Returns State of the current loaded session
                if(sessionKey == null){
                    return this._session.getSessionState()
                }
                else{
                    if(!this.userSessionStates[sessionKey])
                    {
                        let SessionState = declare([Stateful], {});
                        this.userSessionStates[sessionKey] = new   SessionState()
                        this._requestUserSessionInfo(sessionKey)
                    }
                    return this.userSessionStates[sessionKey]
                }
            },
            getUserSessionsList: function(){
                if(this.userSessionsList === null){
                    const UserSessionStateList = declare([Stateful], {});
                    this.userSessionsList = new UserSessionStateList()
                    this._requestUserSessionsList()
                }
                return this.userSessionsList
            },
            //Requests to Instance
            requestSessionChange(changeSessionKey, unloadAllOthers = false){
                //  summary:
                //          Used to switch the Current connection to the requested Session Key
                //          If Successful, the current session will be disassociated from the
                //          Connection
                //
                //  tags:
                //          Sessions Controller Interface Commands
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    topic.publish("sendBalekProtocolMessage", {
                        sessionManagerMessage: {
                            sessionKey: this._session._sessionKey,
                            changeSessionKey: changeSessionKey,
                            unloadAllOthers: unloadAllOthers
                        }
                    });
                    Resolve({SUCCESS: "Didn't request callback but request was sent"})
                }));
            },
            requestSessionNameChange(changeSessionKey, newName = ""){
                //  summary:
                //          Used to rename a session owned by user
                //
                //  tags:
                //          Sessions Controller Interface Commands
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    topic.publish("sendBalekProtocolMessage", {
                        sessionManagerMessage: {
                            sessionKey: changeSessionKey,
                            changeSessionName: newName
                        }
                    });
                    Resolve({SUCCESS: "Didn't request callback but request was sent"})
                }));
            },
            //##########################################################################################################
            //Manager Commands
            //##########################################################################################################
            setActiveSession: function(session){
                this._session = session
                this.activeSessionInfo.set("sessionKey", session._sessionKey)
            },
            //##########################################################################################################
            //Private Functions
            //##########################################################################################################
            _requestUserSessionsList: function(){
                // summary:
                // Private function to request state changes in the user session list from the server.
                // This state is then set in a local Stateful Object that is shared through the Client Session Controller
                topic.publish("sendBalekProtocolMessageWithReplyCallback", {sessionMessage:
                        {sessionKey: this._session._sessionKey, sessionRequest:
                                {userSessionsListWatch: "userSessionsListWatch", userKey: this._session.getUserKey()}}},
                    lang.hitch(this,
                    function(returnValue){
                        if(returnValue && returnValue.userSessionsListUpdate
                            && returnValue.userSessionsListUpdate.name){
                            this.getUserSessionsList().set(returnValue.userSessionsListUpdate.name,
                                returnValue.userSessionsListUpdate.newState)

                        }else{
                           console.log("🟩🟩🔷🔷🔹🔹_requestUserSessionsList❌❌❌❌ - Unexpected Object", returnValue)
                        }
                    }));
            },
            _requestUserSessionInfo: function(sessionKey){
                // summary:
                //	This function is called by Client Session Controller to request state changes
                //  from the specified session from the server. This state is then set in a local
                //  Stateful Object that is shared through the Client Session Controller
                  topic.publish("sendBalekProtocolMessageWithReplyCallback", {sessionMessage:
                            {sessionKey: this._session._sessionKey, sessionRequest:
                                    {userSessionInfoWatch: "userSessionInfoWatch", userKey: this._session.getUserKey(),
                                    sessionKeyToWatch: sessionKey}}},
                    lang.hitch(this,
                        function(returnValue){
                            if(returnValue && returnValue.userSessionInfoUpdate
                                && returnValue.userSessionInfoUpdate.name){
                                 this.getSessionState(sessionKey).set(returnValue.userSessionInfoUpdate.name,
                                    returnValue.userSessionInfoUpdate.newState)
                            }else{
                                console.log("🟩🟩🔷🔷🔹🔹_requestUserSessionsList❌❌❌❌ - Unexpected Object - Should not see this!", returnValue)
                            }
                        }));
            }
        });
    });