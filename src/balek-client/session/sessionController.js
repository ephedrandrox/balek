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

            activeSessionInfo: null, //state object

            constructor: function (args) {

                declare.safeMixin(this, args);

                const ActiveSessionInfo = declare([Stateful], {})
                this.activeSessionInfo = new ActiveSessionInfo()


                this._interfaceCommands = new InterfaceCommands();
                this._interfaceCommands.setCommand("getSessionUserKey", lang.hitch(this, this.getSessionUserKey))
                this._interfaceCommands.setCommand("getUserSessionsList", lang.hitch(this, this.getUserSessionsList))


            },
            _requestUserSessionsList: function(){
                topic.publish("sendBalekProtocolMessageWithReplyCallback", {sessionMessage: {sessionKey: this._session._sessionKey, sessionRequest: {userSessionsListWatch: "userSessionsListWatch", userKey: this._session.getUserKey()}}}, lang.hitch(this,
                    function(returnValue){
                        if(returnValue && returnValue.userSessionsListUpdate
                            && returnValue.userSessionsListUpdate.name
                            && returnValue.userSessionsListUpdate.newState){

                            this.getUserSessionsList().set(returnValue.userSessionsListUpdate.name, returnValue.userSessionsListUpdate.newState)
                            console.log("🟩🟩🔷🔷🔹🔹_requestUserSessionsList Set", returnValue.userSessionsListUpdate.name, returnValue.userSessionsListUpdate.newState)
                        }else{
                            console.log("💠💠💠💠_requestUserSessionsList Set", returnValue)
                            console.log("🟩🟩🔷🔷🔹🔹_requestUserSessionsList❌❌❌❌ - Unexpected Object", returnValue)
                        }
                    }));
            },
            getSessionUserKey(){
                return this._session.getUserKey()
            },
            getUserSessionsList: function(){
                if(this.userSessionsList === null){
                    const UserSessionStateList = declare([Stateful], {});
                    this.userSessionsList = new UserSessionStateList()
                    this._requestUserSessionsList()
                }

                return this.userSessionsList
            },
            setActiveSession: function(session){
                this._session = session
                this.activeSessionInfo.set("sessionKey", session._sessionKey)
            }
        });
    });