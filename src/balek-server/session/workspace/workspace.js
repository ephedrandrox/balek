define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek/session/workspace/workspace',
    ],
    function (declare, lang, topic, balekWorkspaceManagerWorkspace) {
        return declare("balekServerWorkspaceManagerWorkspace", balekWorkspaceManagerWorkspace, {
            instances: null,
            _workspaceName: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("Initializing Balek Workspace Manager Workspace for Server...");
                this.instances = {};
                this._workspaceName = "Untitled Workspace";
            },
            addToWorkspaceRequestReceived: function (addToWorkspaceRequest, messageReplyCallback) {
                if (addToWorkspaceRequest.instanceKey) {
                    this.instances[addToWorkspaceRequest.instanceKey] = {instanceKey: addToWorkspaceRequest.instanceKey};
                    messageReplyCallback({
                        success: "addedToWorkspace",
                        workspaceKey: addToWorkspaceRequest.workspaceKey,
                        instanceKey: addToWorkspaceRequest.instanceKey
                    });
                } else {
                    messageReplyCallback({
                        error: "No instanceKey Key",
                        workspaceKey: addToWorkspaceRequest.workspaceKey,
                        interfaceKey: addToWorkspaceRequest.instanceKey
                    });
                }
            },
            changeWorkspaceNameReceived: function (workspaceName, messageReplyCallback) {
                if (workspaceName) {
                    this._workspaceName = workspaceName;
                    messageReplyCallback({
                        success: "changeWorkspaceName",
                        workspaceKey: this._workspaceKey,
                        workspaceName: workspaceName
                    });
                } else {
                    messageReplyCallback({
                        error: "No Workspace Name",
                        workspaceKey: this._workspaceKey,
                        workspaceName: workspaceName
                    });
                }
            }
        });
    });