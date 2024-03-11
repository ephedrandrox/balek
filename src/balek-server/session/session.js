define([ 	'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-server/session/sessionsController/instanceCommands',

        'balek/session/session',
    'balek-server/session/workspaceManager'],
    function (declare, lang, topic, SessionInstanceCommands, balekSessionManagerSession, balekWorkspaceManager ) {

        return declare("balekServerSessionManagerSession", balekSessionManagerSession, {

            _wssConnection: null,
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

                this.updateSessionStatus({name: "Unnamed Session"})
                this._workspaceManager = new  balekWorkspaceManager();
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
                }else if(request.updateSessionName &&
                    typeof request.updateSessionName === "string"){

                    this.updateSessionStatus({name: request.updateSessionName})

                    console.log("Got Name change request", request.updateSessionName);
                }
                else
                {
                    console.log("session request unknown.", request);
                }
            },
            unloadAllInstancesOf(ModuleName){
                let moduleKeys  = this.getModuleKeysFor(ModuleName)

                moduleKeys.forEach(lang.hitch(this, function(moduleKey){
                    this.unloadModuleInstance(moduleKey).then(function(){
                    }).catch(function(Error) {})
                }))
            },
            getModuleKeysFor(ModuleName){
                const allSessionInstances = Object.keys(this._instances)
                let moduleKeys  = []
                allSessionInstances.forEach(lang.hitch(this, function(ModuleKey){
                   let moduleInstance = this._instances[ModuleKey]
                    console.log(moduleInstance)
                    if(moduleInstance && moduleInstance._moduleName == ModuleName)
                    {
                        moduleKeys.push(ModuleKey)
                    }
                }))
               return moduleKeys

            },
            loadModuleInstance: function(moduleName){

                let wssConnection = this._wssConnection

                if(wssConnection)
                {
                    topic.publish("loadModuleForClient", wssConnection, moduleName,
                        function(moduleInterface){
                            debugger;
                            if (moduleInterface === null) {
                                console.log("Error: loadModuleInstance -> loadModuleForClient Could not Load Module")
                            } else {
                                topic.publish("sendBalekProtocolMessage", wssConnection, moduleInterface);
                            }
                        })
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

                //todo delete the states
                this.inherited(arguments);

            }
        });
    });