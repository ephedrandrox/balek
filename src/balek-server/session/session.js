define([ 	'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-server/session/sessionsController/instanceCommands',

        'balek/session/session',
    'balek-server/session/workspaceManager'],
    function (declare, lang, topic, SessionInstanceCommands, balekSessionManagerSession, balekWorkspaceManager ) {

        return declare("balekServerSessionManagerSession", balekSessionManagerSession, {

            _sessionKey: null,

            _sessionStateWatchHandle: null,
            _availableSessionStates: {},
            _availableSessionStateWatchHandles: {},


            _sessionInstanceCommands: null,

            _workspaceManager: null,
            _instances: null,

            constructor: function(args){
                //todo audit/comment this file

                declare.safeMixin(this, args);
                this._instances = {};
                console.log("Initializing Balek Session Manager session for server...");

                let sessionInstanceCommands = new SessionInstanceCommands()
                this._sessionInstanceCommands = sessionInstanceCommands.getCommands()

                topic.publish("sendBalekProtocolMessage", this._wssConnection, {sessionAction: {sessionKey: this._sessionKey, action: "New Session"}});

                this._workspaceManager = new  balekWorkspaceManager();

              //  this._availableSessionStates = {};
              //  this._availableSessionStateWatchHandles = {};
                // this._sessionStateWatchHandle = this._syncedState.watch(lang.hitch(this, this.onStateChange));
            },
            updateSessionStatus:function(args){
                //this is what we call to update session statue
                //Then we update the state from here
                //check args, grab user state, update session state
                //declare.safeMixin(this, args);
                //debugger;
                for(const name in args)
                {
                    this._syncedState.set(name, args[name]);
                }

            },
            sessionRequest: function(request, messageReplyCallback)
            {

                if(request.workspaceRequest && request.workspaceRequest.requestType === "new")
                {//todo remove this workspace request
                  // this.getNewWorkspace();
                }else if(request.workspaceManagerRequest )
                {
                    this._workspaceManager.sessionRequest(request.workspaceManagerRequest, messageReplyCallback);
                }else if(request.interfaceLoadRequest && request.interfaceLoadRequest.requestType === "all"){
                    messageReplyCallback( this.getInterfaceLoadObject());
                }else if(request.interfaceConnectSyncedStateRequest){
                    this.setNewInterfaceCallback(messageReplyCallback);
                }else if(request.moduleUnloadRequest && request.moduleUnloadRequest.sessionModuleInstanceKey !== undefined){
                    this.unloadModuleInstance(request.moduleUnloadRequest.sessionModuleInstanceKey).then(unloadResult =>{
                        messageReplyCallback(unloadResult);
                    }).catch(errorResult =>{
                        messageReplyCallback(errorResult);
                    });
                }
                else
                {
                    console.log("session request uknown.");
                }
            },
            unloadModuleInstance: function(sessionModuleInstanceKey){
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                    this._workspaceManager.unloadModuleInstance(sessionModuleInstanceKey);

                    delete  this._instances[sessionModuleInstanceKey];

                    topic.publish("unloadModuleInstance", sessionModuleInstanceKey, lang.hitch(this, unloaded =>{
                        //console.log("unloaded: " + unloaded);
                        if(unloaded){
                             Resolve({status: "Success"});
                        }
                        else
                        {
                            Reject({error: "Could Not Unload Module Instance " + sessionModuleInstanceKey});
                        }
                    }));


                }));
            },
            addInstance: function( instanceToAdd)
            {
                this._instances[instanceToAdd._instanceKey] = instanceToAdd;
            },
            getInstances: function(){
                let instancesToReturn = {};
                for(const instanceKey in this._instances)
                {
                    instancesToReturn[instanceKey] = {instanceKey:instanceKey,
                        moduleName: this._instances[instanceKey]._moduleName,
                        displayName: this._instances[instanceKey]._displayName}
                }

                return instancesToReturn;
            },

            getInterfaceLoadObject: function(){

                let interfaceData = {};
                for(const instanceKey in this._instances){

                    interfaceData[instanceKey] = {instanceKey:instanceKey,
                    moduleName: this._instances[instanceKey]._moduleName} ;
                }


                let workspaceData ={
                    updateType: "all",
                    activeWorkspace: this._workspaceManager.getActiveWorkspace(),
                    workspaceData: this._workspaceManager.getWorkspaces()
                };
               return {
                    sessionMessage: {
                        sessionKey: this._sessionKey,
                        interfaceLoadRequestReply: {
                            updateType: "all",
                            interfaceData : interfaceData,
                            workspaceData : workspaceData,
                            backgroundComponent: "",
                        }
                    }
                };
            },
            unload: function(){
                //unload all instances
                for(const instanceKey in this._instances) {
                    this.unloadModuleInstance(instanceKey).then(function(value){
                    //todo make sure that the connection is removed
                        console.log(value);
                }).catch(function(error){

                        console.log(error);
                    });

                }
                for( const watchHandle in this._availableSessionStateWatchHandles){

                    this._availableSessionStateWatchHandles[watchHandle].unwatch();
                    this._availableSessionStateWatchHandles[watchHandle].remove();
                }

                //this._sessionStateWatchHandle.unwatch();
                //this._sessionStateWatchHandle.remove();
                //todo delete the states
                this.inherited(arguments);

            }
            // onStateChange: function(name, oldState,newState)
            // {
            //     if(name === "userKey"){
            //         topic.publish("getSessionsForUserKey", newState, lang.hitch(this, function(userSessions){
            //            // console.log("User Sessions");
            //             let availableSessions = {};
            //             userSessions.forEach(lang.hitch(this, function(userSession){
            //                 //console.log(userSession._sessionKey);
            //                 if(userSession._sessionKey!= this._sessionKey)
            //                 {
            //                     userSession.addAvailableSession(this);
            //                     availableSessions[userSession._sessionKey] = userSession.getStatus();
            //                     this.watchAvailableSessionState(userSession);
            //                 }
            //             }));
            //             this.getState().set("availableSessions", availableSessions);
            //         }));
            //
            //     }
            // },
            // addAvailableSession: function(availableSession)
            // {
            //     let availableSessions = this.getState().get("availableSessions");
            //     availableSessions[availableSession._sessionKey] = availableSession.getStatus();
            //     this.watchAvailableSessionState(availableSession);
            //     this.getState().set("availableSessions", availableSessions);
            //
            // },
            // onAvailableStateChange: function(availableSessionKey, name, oldState, newState){
            //     //hitched this and available session Key in watch call
            //     console.log(name, newState);
            //
            //     if(name === "unloaded" || name === "sessionStatus")
            //     {
            //         let availableSessions = this.getState().get("availableSessions");
            //         if( name === "unloaded")
            //         {
            //             console.log("unloaded");
            //             delete availableSessions[availableSessionKey]
            //
            //         }else if(name === "sessionStatus")
            //         {
            //             console.log("sessionStatus");
            //             availableSessions[availableSessionKey] = newState;
            //
            //         }
            //         this.getState().set("availableSessions", availableSessions);
            //     }
            //
            //
            // },
            // watchAvailableSessionState: function(availableSession){
            //     if(!this._availableSessionStates[availableSession._sessionKey])
            //     {
            //         this._availableSessionStates[availableSession._sessionKey] = availableSession.getState();
            //         this._availableSessionStateWatchHandles[availableSession._sessionKey] = this._availableSessionStates[availableSession._sessionKey]
            //             .watch(lang.hitch(this, this.onAvailableStateChange, availableSession._sessionKey));
            //     }
            // },
            /* getNewWorkspace: function(){
               //todo delte this after workspace state update
               this.sendWorkspacesUpdate("new", this._workspaceManager.getNewWorkspace());
           },
           sendWorkspaces: function(){
               //todo delete this after workspace state update
               this.sendWorkspacesUpdate("all",  this._workspaceManager.getWorkspaces());

           },

           */
            /*
           sendWorkspacesUpdate: function(updateType, workspacesData){
                   //todo move this to workspaces or delete after state update
               topic.publish("sendBalekProtocolMessage", this._wssConnection, {
                   sessionMessage: {
                       sessionKey: this._sessionKey,
                       workspacesUpdate: {
                               updateType: updateType,
                               workspaceData : workspacesData
                           }
                   }
               });
           },*/
        });
    });