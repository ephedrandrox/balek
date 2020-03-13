define([ 	'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/node!crypto',


        'balek/session/workspaceManager',
        'balek-server/session/workspace/workspace'],
    function (declare, lang, topic, crypto, balekWorkspaceManager, balekWorkspace ) {

        return declare( "balekServerWorkspaceManager",balekWorkspaceManager, {
            _workspaces: null,
            _activeWorkspace: null,
            constructor: function(args){


                declare.safeMixin(this, args);

                console.log("Initializing Balek Workspace Manager server...");
                this._activeWorkspace = null;
                this._workspaces = {};

                this.getNewWorkspace();
            },

            getNewWorkspace: function(){

                let newWorkspaceKey = this.getUniqueWorkspaceKey();

                this._workspaces[newWorkspaceKey] =new balekWorkspace({_workspaceKey:newWorkspaceKey });

                let workspacesToReturn ={
                    workspaceKey: newWorkspaceKey,
                    workspaceName: this._workspaces[newWorkspaceKey]._workspaceName
                };
                return workspacesToReturn;
            },
            getUniqueWorkspaceKey: function()
            {
                do{
                    var id = crypto.randomBytes(20).toString('hex');
                    if(typeof this._workspaces[id]== "undefined") return id;
                }while(true);

            },
            getWorkspaces: function(){
                let workspacesToReturn ={};
                for (const workspaceKey in this._workspaces)
                {
                    workspacesToReturn[workspaceKey]= {
                        _workspaceKey: workspaceKey,
                        _workspaceName: this._workspaces[workspaceKey]._workspaceName,
                        instances: this._workspaces[workspaceKey].instances
                    }

                }

                return workspacesToReturn;
            },
            getActiveWorkspace: function()
            {
                return this._activeWorkspace;
            },
            receiveWorkspaceMessage: function(workspaceMessage, messageReplyCallback){

                if(workspaceMessage.messageData)
                {
                    if(workspaceMessage.messageData.addToWorkspace){
                        this.addToWorkspaceRequestReceived(workspaceMessage.messageData.addToWorkspace, messageReplyCallback);

                    }else if(workspaceMessage.messageData.changeActiveWorkspace){
                        console.log("changing active Workspace" ,workspaceMessage);

                        this.changeActiveWorkspace(workspaceMessage.messageData.changeActiveWorkspace, messageReplyCallback);

                    }else if(workspaceMessage.messageData.changeWorkspaceName){
                        console.log("changing Workspace Name" ,workspaceMessage);

                        this.changeWorkspaceName(workspaceMessage.messageData.changeWorkspaceName, messageReplyCallback);

                    }else
                    {
                        messageReplyCallback({error: "Did not recognize command"});
                    }
                }

            },
            changeWorkspaceName: function(changeWorkspaceName, messageReplyCallback){
                if(changeWorkspaceName.workspaceKey && this._workspaces[changeWorkspaceName.workspaceKey] && changeWorkspaceName.workspaceName ){

                    this._workspaces[changeWorkspaceName.workspaceKey].changeWorkspaceNameReceived(changeWorkspaceName.workspaceName, messageReplyCallback);
                }else
                {

                    messageReplyCallback({error: "Server Session Workspace Manager: not a valid workspace key when changing Workspace Name" + changeWorkspaceName.workspaceKey,
                        workspaceKey: changeWorkspaceName.workspaceKey, workspaceName:  changeWorkspaceName.workspaceName});
                }

            },
            changeActiveWorkspace: function(changeActiveWorkspaceRequest, messageReplyCallback){
                if(changeActiveWorkspaceRequest.workspaceKey && this._workspaces[changeActiveWorkspaceRequest.workspaceKey]){

                  this._activeWorkspace = changeActiveWorkspaceRequest.workspaceKey;
                    messageReplyCallback({success: "changeActiveWorkspace", workspaceKey: changeActiveWorkspaceRequest.workspaceKey });
                  }else
                {

                    messageReplyCallback({error: "Server Session Workspace Manager: not a valid workspace key when changing active Workspace" + changeActiveWorkspaceRequest.workspaceKey,
                        workspaceKey: changeActiveWorkspaceRequest.workspaceKey});
                }


            },
            addToWorkspaceRequestReceived: function(addToWorkspaceRequest, messageReplyCallback){
                if(addToWorkspaceRequest.workspaceKey && this._workspaces[addToWorkspaceRequest.workspaceKey]){
                    this._workspaces[addToWorkspaceRequest.workspaceKey].addToWorkspaceRequestReceived(addToWorkspaceRequest,messageReplyCallback );
                }else
                {
                    messageReplyCallback({error: "Server Session Workspace Manager: not a valid workspace key when adding to Workspace",
                        workspaceKey: addToWorkspaceRequest.workspaceKey});
                }

            }



        });
    });