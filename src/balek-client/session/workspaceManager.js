define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'balek/session/workspaceManager',
        'balek-client/session/workspace/workspace'],
    function (declare,
              lang,
              topic,
              Stateful,
              balekWorkspaceManager,
              balekWorkspace) {

        return declare("balekClientWorkspaceManager", balekWorkspaceManager, {

            _workspacesStore: null,
            _workspaces: null,
            _sessionKey: null,
            constructor: function (args) {

                declare.safeMixin(this, args);

                let workspaceStore = declare([Stateful], {
                    workspaces: null,
                    activeWorkspace: null

                });
                this._workspacesStore = new workspaceStore({
                    workspaces: {}
                });
                this._workspaces = {};

                //todo make array of handles
                this.getWorkspacesStoreSubscribeHandle = topic.subscribe("getWorkspacesStore", lang.hitch(this, this.getWorkspacesStore));
                this.addToCurrentWorkspaceSubscribeHandle = topic.subscribe("addToCurrentWorkspace", lang.hitch(this, this.addToCurrentWorkspace));
                this.changeActiveWorkspaceSubscribeHandle = topic.subscribe("changeActiveWorkspace", lang.hitch(this, this.changeActiveWorkspace));
                this.changeWorkspaceNameSubscribeHandle = topic.subscribe("changeWorkspaceName", lang.hitch(this, this.changeWorkspaceName));

                topic.publish("workspaceStoreAvailable", this._workspacesStore);

            },
            changeWorkspaceName: function (workspaceKey, workspaceName, requestCallback) {
                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    workspaceMessage: {
                        sessionKey: this._sessionKey, messageData: {
                            changeWorkspaceName: {
                                workspaceKey: workspaceKey,
                                workspaceName: workspaceName
                            }
                        }
                    }
                }, lang.hitch(this, function (returnMessage) {
                    if (returnMessage.error) {
                        alert(returnMessage.error);
                    } else {
                        this._workspacesStore.set("activeWorkspace", workspaceKey);
                        requestCallback(returnMessage);
                    }
                }));
            },
            changeActiveWorkspace: function (workspaceKey, requestCallback) {
                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    workspaceMessage: {
                        sessionKey: this._sessionKey, messageData: {
                            changeActiveWorkspace: {workspaceKey: workspaceKey}
                        }
                    }
                }, lang.hitch(this, function (returnMessage) {
                    if (returnMessage.error) {
                        alert(returnMessage.error);
                    } else {
                        this._workspacesStore.set("activeWorkspace", workspaceKey);
                        requestCallback(returnMessage);
                    }
                }));

            },
            workspacesUpdate: function (workspacesUpdate) {

                if (workspacesUpdate.updateType === "all") {

                    let workspacesObject = this._workspacesStore.get("workspaces");
                    let workspacesActiveWorkspace = this._workspacesStore.get("activeWorkspace");

                    //need to cycle through and create new workspaces
                    for (const workspaceKey in workspacesUpdate.workspaceData) {
                        if (workspacesObject[workspaceKey] === undefined) {
                            workspacesObject[workspaceKey] = new balekWorkspace({
                                _workspaceKey: workspaceKey,
                                _workspaceName: workspacesUpdate.workspaceData[workspaceKey]._workspaceName
                            });

                            let instances = workspacesUpdate.workspaceData[workspaceKey].instances;
                            for (instanceKey in instances) {
                                workspacesObject[workspaceKey].addToWorkspaceStore(instanceKey);
                            }
                            workspacesActiveWorkspace = workspaceKey;
                        }
                    }

                    if (workspacesUpdate.activeWorkspace) {
                        workspacesActiveWorkspace = workspacesUpdate.activeWorkspace;
                    }

                    this._workspacesStore.set("workspaces", workspacesObject);
                    this._workspacesStore.set("activeWorkspace", workspacesActiveWorkspace);
                } else if (workspacesUpdate.updateType === "new") {
                    let workspacesObject = this._workspacesStore.get("workspaces");
                    workspacesObject[workspacesUpdate.workspaceData.workspaceKey] = new balekWorkspace({
                        _workspaceKey: workspacesUpdate.workspaceData.workspaceKey,
                        _workspaceName: workspacesUpdate.workspaceData.workspaceName
                    });
                    this._workspacesStore.set("workspaces", workspacesObject);
                    this._workspacesStore.set("activeWorkspace", workspacesUpdate.workspaceData.workspaceKey);
                } else {
                    console.log(workspacesUpdate);
                }

            },
            getWorkspacesStore: function (workspacesCallback) {
                workspacesCallback(this._workspacesStore);
            },
            addToCurrentWorkspace: function (instanceInterface) {

                let currentWorkspace = this._workspacesStore.get("activeWorkspace");
                let workspaces = this._workspacesStore.get("workspaces");

                if (currentWorkspace !== null && workspaces[currentWorkspace] !== undefined) {

                    topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                        workspaceMessage: {
                            sessionKey: this._sessionKey, messageData: {
                                addToWorkspace: {
                                    workspaceKey: workspaces[currentWorkspace]._workspaceKey,
                                    instanceKey: instanceInterface._instanceKey
                                }
                            }
                        }
                    }, lang.hitch(this, function (returnMessage) {
                        if (returnMessage.error) {
                            alert(returnMessage.error);
                        } else {
                            this.addToWorkspaceState(instanceInterface._instanceKey, currentWorkspace);
                        }
                    }));

                }
            },
            addToWorkspaceState: function (instanceKey, workspaceKey) {
                let workspaces = this._workspacesStore.get("workspaces");

                if (workspaceKey !== null && workspaces[workspaceKey] !== undefined) {
                    workspaces[workspaceKey].addToWorkspaceStore(instanceKey);
                }

            },
            unload: function () {
                let workspaces = this._workspacesStore.get("workspaces");

                for (const workspaceKey in workspaces) {
                    workspaces[workspaceKey].unload();
                }

                this.changeActiveWorkspaceSubscribeHandle.remove();
                this.changeWorkspaceNameSubscribeHandle.remove();
                this.getWorkspacesStoreSubscribeHandle.remove();
                this.addToCurrentWorkspaceSubscribeHandle.remove();
            }
        });
    });