define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/topic',

        'dojo/Stateful',

        'balek-server/session/sessionsController/instanceCommands'
    ],
    function (declare, lang, topic, Stateful,InstanceCommands
    ) {
        return declare("balekSessionsController", null, {
            _sessionsManager: null,

            statusAsState: null,
            _instanceCommands: null,

            _SessionsList: null,
            _userSessionsLists: null,

            _sessionListWatchers: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                if(!this._sessionsManager){
                    console.log("balekSessionsController NOT starting...");

                }else {
                    console.log("balekSessionsController  starting...");

                    this._SessionsList = declare([Stateful], {});
                    this._userSessionsLists = {};

                    this._sessionListWatchers = {}

                    let StatusState = declare([Stateful], {});
                    this.statusAsState = new StatusState({});
                    this.statusAsState.set("Status", "Starting")


                    this._instanceCommands = new InstanceCommands();


                     this._instanceCommands.setCommand("getAvailableSessionsList", lang.hitch(this, this.getAvailableSessionsList))
                    // this._instanceCommands.setCommand("updateUsername", lang.hitch(this, this.updateUsername))
                    // this._instanceCommands.setCommand("updateUserIcon", lang.hitch(this, this.updateUserIcon))

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

                console.log("✅✅✅",userKey, sessionKey, messageReplyCallback)

                let userSessionsListState =  this.getAvailableSessionsList(userKey)
                let stateEntries = Object.entries(userSessionsListState)
                for(KeyValIndex in stateEntries)
                {
                    let objectKey = stateEntries[KeyValIndex][0]
                    let object = userSessionsListState.get(objectKey)

                    if(typeof object !== 'function' ){
                        console.log("✅✅✅✅✅✅",objectKey, object)
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
                let watchHandle = userSessionsListState.watch(lang.hitch(this, function(name, oldState, newState){
                    console.log("✅✅✅ watchHandle ✅✅✅",userKey, sessionKey, messageReplyCallback)
                    console.log("✅✅✅✅✅✅",name, newState)

                        let result =  messageReplyCallback({userSessionsListUpdate: {name: name , newState: newState}})

                    if(result.Error)
                    {    console.log("✅✅✅ messageReplyCallback Result Error ❌❌",userKey, sessionKey, result.Error)

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
               // this._sessionListWatchers[userKey] = watchHandle

                let sessionWatchers =  this.getSessionListWatchers(sessionKey)

                if(sessionWatchers[userKey]){
                    sessionWatchers[userKey].unwatch()
                    sessionWatchers[userKey].remove()
                }
                sessionWatchers[userKey] = watchHandle

            },
            stopWatching(userKey, sessionKey){
                //todo Make this work and call from command when Interface is done watching
            },
            //##########################################################################################################
            //Relay Available Sessions State End
            //##########################################################################################################
            //Instance Commands
            getAvailableSessionsList: function(userKey){
                return this._sessionsManager.getUserSessionList(userKey)
            }
        });
    }
);
