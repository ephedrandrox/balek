define([ 	'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek/session/session',
    'balek-server/session/workspaceManager'],
    function (declare, lang, topic, balekSessionManagerSession, balekWorkspaceManager ) {

        return declare("balekServerSessionManagerSession", balekSessionManagerSession, {

            _sessionKey: null,

            _permissionGroups: null,
            _username: null,
            _userKey: null,
            _workspaceManager: null,
            _instances: null,

            constructor: function(args){


                declare.safeMixin(this, args);
                this._instances = {};
                console.log("Initializing Balek Session Manager session for server...");


                topic.publish("sendBalekProtocolMessage", this._wssConnection, {sessionAction: {sessionKey: this._sessionKey, action: "Session Status Changed", sessionStatus:  this._sessionStatus}});


                this._workspaceManager = new  balekWorkspaceManager();




            },
            updateSessionStatus:function(args){
                declare.safeMixin(this, args);

                topic.publish("sendBalekProtocolMessage", this._wssConnection, {sessionAction: {sessionKey: this._sessionKey, action: "Session Status Changed", sessionStatus:  this._sessionStatus, username: this._username, permissionGroups: this._permissionGroups}});

            },
            sessionRequest: function(request, messageReplyCallback)
            {
                if(request.workspaceRequest && request.workspaceRequest.requestType === "new")
                {
                   this.getNewWorkspace();
                }else if(request.interfaceLoadRequest && request.interfaceLoadRequest.requestType === "all"){

                    messageReplyCallback( this.getInterfaceLoadObject());
                }else if(request.moduleUnloadRequest && request.moduleUnloadRequest.sessionModuleInstanceKey !== undefined){

                    this.unloadModuleInstance(request.moduleUnloadRequest.sessionModuleInstanceKey).then(unloadResult =>{
                        messageReplyCallback(unloadResult);
                    }).catch(errorResult =>{
                        messageReplyCallback(errorResult);
                    });

                }
                else
                {

                    console.log("session request unkown.");
                }

            },
            unloadModuleInstance: function(sessionModuleInstanceKey){
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                    this._workspaceManager.unloadModuleInstance(sessionModuleInstanceKey);

                    delete  this._instances[sessionModuleInstanceKey];

                    topic.publish("unloadModuleInstance", sessionModuleInstanceKey, lang.hitch(this, unloaded =>{
                        console.log("unloaded: " + unloaded);
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
            getNewWorkspace: function(){

                this.sendWorkspacesUpdate("new", this._workspaceManager.getNewWorkspace());
            },
            sendWorkspaces: function(){

                this.sendWorkspacesUpdate("all",  this._workspaceManager.getWorkspaces());

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
            getUserInfo: function()
            {
                //todo should use this in session manager to check and cache results from db
                return {    username: this._username,
                            userKey: this._userKey
                            }
            },
            getInstances: function(){
                let instancesToRetrun = {};

                    for(const instanceKey in this._instances)
                    {
                        instancesToRetrun[instanceKey] = {instanceKey:instanceKey,
                            moduleName: this._instances[instanceKey]._moduleName,
                            displayName: this._instances[instanceKey]._displayName}

                    }

                    return instancesToRetrun;
            },
            sendWorkspacesUpdate: function(updateType, workspacesData){

                topic.publish("sendBalekProtocolMessage", this._wssConnection, {
                    sessionMessage: {
                        sessionKey: this._sessionKey,
                        workspacesUpdate: {
                                updateType: updateType,
                                workspaceData : workspacesData
                            }
                    }
                });
            },


        });
    });