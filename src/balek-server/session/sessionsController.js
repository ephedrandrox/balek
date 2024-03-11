define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/topic',

        'dojo/Stateful',

        'balek-server/session/sessionsController/instanceCommands'
    ],
    function (declare, lang, topic,
              Stateful,
              InstanceCommands
    ) {
        return declare("balekSessionsController", null, {
            _sessionsManager: null,

            statusAsState: null,
            _instanceCommands: null,

            _SessionsList: null,
            _userSessionsLists: null,

            _sessionListWatchers: null,
            _sessionInfoWatchers: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                if(!this._sessionsManager){
                    console.log("balekSessionsController NOT starting...");

                }else {
                    console.log("balekSessionsController  starting...");

                    this._SessionsList = declare([Stateful], {});
                    this._userSessionsLists = {};

                    this._sessionListWatchers = {}
                    this._sessionInfoWatchers = {}


                    let StatusState = declare([Stateful], {});
                    this.statusAsState = new StatusState({});
                    this.statusAsState.set("Status", "Starting")


                    this._instanceCommands = new InstanceCommands();
                    this._instanceCommands.setCommand("getAvailableSessionsList", lang.hitch(this, this.getAvailableSessionsList))
                    this._instanceCommands.setCommand("getSessionUserKey", lang.hitch(this, this.getSessionUserKey))
                    this._instanceCommands.setCommand("getSessionByKey", lang.hitch(this, this.getSessionByKey))


                }
            },
            //Interface Commands:

            //##########################################################################################################
            //Relay Available Sessions List State
            //##########################################################################################################
            relayUserSessionsList: function(userKey, sessionKey, messageReplyCallback){
                //######################################################################################################
                //Relay Available Sessions List
                //######################################################################################################
                // summary:
                //          This method is called when the interface requests the available
                //          sessions list. The interface is informed of state and updates through
                //          the messageReplyCallback
                //
                // tags:
                //          private


                let userSessionsListState =  this.getAvailableSessionsList(userKey)
                let stateEntries = Object.entries(userSessionsListState)
                for(KeyValIndex in stateEntries)
                {
                    let objectKey = stateEntries[KeyValIndex][0]
                    let object = userSessionsListState.get(objectKey)

                    if(typeof object !== 'function' ){
                        let result = messageReplyCallback({userSessionsListUpdate: {name: objectKey,
                                        newState: object}})
                        if(result.Error)
                        {
                            console.log("✅✅✅ messageReplyCallback state load loop ❌❌",userKey, sessionKey, result.Error)
                        }
                    }else {
                        console.log("Skipping 🛑🛑🔵🔵🔵🔵🔵🔵", objectKey, userSessionsListState[objectKey], Object.entries(userSessionsListState))
                    }
                }
                let watchHandle = userSessionsListState.watch(lang.hitch(this, function(name, oldState, newState = null){
                        let result =  messageReplyCallback({userSessionsListUpdate: {name: name , newState: newState}})
                    if(result.Error)
                    {
                        watchHandle.unwatch()
                        watchHandle.remove()
                    }
                }))
                console.log("✅✅✅",userKey, sessionKey, messageReplyCallback)
                this.putSessionListWatcher(userKey, sessionKey, watchHandle)
            },
            getSessionListWatchers(sessionKey)
            {
                if(!this._sessionListWatchers[sessionKey]){
                    this._sessionListWatchers[sessionKey] = {}
                }
                return this._sessionListWatchers[sessionKey]
            },
            putSessionListWatcher(userKey, sessionKey, watchHandle){
                let sessionWatchers =  this.getSessionListWatchers(sessionKey)

                if(sessionWatchers[userKey]){
                    sessionWatchers[userKey].unwatch()
                    sessionWatchers[userKey].remove()
                }
                sessionWatchers[userKey] = watchHandle
            },
            stopRelayingUserSessionsList(userKey, sessionKey){
                //todo Make this work and call from command when Interface is done watching
            },
            //##########################################################################################################
            //Relay Session Info State
            //##########################################################################################################
            relayUserSessionInfo: function(userKey, sessionKey, sessionToWatch, messageReplyCallback){
                //######################################################################################################
                //Relay Session Info State
                //######################################################################################################
                // summary:
                //          This method is called when the interface requests a session info state
                //          The interface is informed of state and updates through the
                //          messageReplyCallback
                //
                // tags:
                //          private

                let sessionInfoState = this.getUserSessionInfo(sessionToWatch)

                //todo credentials check that the session belongs to user and session and connection
                if(sessionInfoState){
                    let stateEntries = Object.entries(sessionInfoState)
                    for(KeyValIndex in stateEntries)
                    {
                        let objectKey = stateEntries[KeyValIndex][0]
                        let object = sessionInfoState.get(objectKey)
                        if(typeof object !== 'function' ){
                            let result = messageReplyCallback({userSessionInfoUpdate: {name: objectKey,
                                    newState: object}})
                            if(result.Error)
                            {
                                console.log("✅✅✅ messageReplyCallback state load loop relayUserSessionInfo ❌❌",userKey, sessionKey, result.Error)
                            }
                        }
                    }
                    let watchHandle = sessionInfoState.watch(lang.hitch(this, function(name, oldState, newState = null){
                        let result =  messageReplyCallback({userSessionInfoUpdate: {name: name , newState: newState}})
                        if(result.Error)
                        {
                            watchHandle.unwatch()
                            watchHandle.remove()
                        }
                    }))
                    this.putSessionInfoWatcher(userKey, sessionKey,watchHandle)
                }else{
                    let result = messageReplyCallback({Error: "Not a valaid session key"})
                    if(result.Error)
                    {
                        console.log("✅✅✅ messageReplyCallback state load loop relayUserSessionInfo ❌❌",userKey, sessionKey, result.Error)
                    }
                }
            },
            getSessionInfoWatchers(sessionKey)
            {
                if(!this._sessionInfoWatchers[sessionKey]){
                    this._sessionInfoWatchers[sessionKey] = {}
                }
                return this._sessionInfoWatchers[sessionKey]
            },
            putSessionInfoWatcher(sessionKey, sessionKeyBeingWatched, watchHandle){
                //Session Info State watchers are organized by session then session being watched

                let sessionWatchers =  this.getSessionInfoWatchers(sessionKey)
                if(sessionWatchers[sessionKeyBeingWatched]){
                    sessionWatchers[sessionKeyBeingWatched].unwatch()
                    sessionWatchers[sessionKeyBeingWatched].remove()
                }
                sessionWatchers[sessionKeyBeingWatched] = watchHandle
            },
            stopRelayingSessionInfo(userKey, sessionKey){
                //todo Make this work and call from command when Interface is done watching
            },
            //##########################################################################################################
            //Instance Commands
            //##########################################################################################################
            getUserSessionInfo: function(sessionKey){
                // summary:
                //          Returns the session info as state
                //          called by controller and by instances
                // tags:
                //          session controller instance command
                let session = this.getSession(sessionKey)
                let sessionInfoState = null
                if(session){
                    sessionInfoState = session.getState()
                }
                return sessionInfoState
            },
            getAvailableSessionsList: function(userKey){
                // summary:
                //          Returns the user session list as state
                //
                // tags:
                //          session controller instance command
                return this.getUserSessionList(userKey)
            },
            getSessionUserKey: function(sessionKey){
                // summary:
                //          Returns the userKey associated with the sessionKey
                //
                // tags:
                //          session controller instance command
                let session = this.getSession(sessionKey)
                let userKey = null
                if(session !== null)
                {
                    userKey = session.getUserKey()
                }
                return userKey
            },
            getSessionByKey: function(sessionKey, returnCallback = null){
                // summary:
                //          Returns the session object associated with the sessionKey
                //
                // tags:
                //          session controller instance command
                if(typeof returnCallback === 'function'){
                    returnCallback(this.getSession(sessionKey))
                }else{
                    return this.getSession(sessionKey)
                }
            },
            //##########################################################################################################
            // Migrate from SessionManager as private controller functions
            //##########################################################################################################
            getSession: function(sessionKey){
                return this._sessionsManager.getSession(sessionKey)
            },
            getUserSessionList: function(userKey){
                return this._sessionsManager.getUserSessionList(userKey)
            },
            getAvailableSessions: function(sessionKey){
                let session =  this.getSession(sessionKey)
                let userKey = session.getUserKey()
                let sessionList = this.getUserSessionList(userKey)
                return sessionList
            },
            sendAvailableSessions: function(sessionKey, messageCallback){
              let sessionList = this.getAvailableSessions(sessionKey)
                messageCallback({availableSessions: sessionList})

            }

        });
    }
);