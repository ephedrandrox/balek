define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",
        'balek-modules/admin/system/Interface/systemInfo',
        'balek-modules/admin/system/Interface/moduleInfo',
        'balek-modules/Interface'
    ],
    function (declare,
              lang,
              topic,
              domConstruct,
              domStyle,
              win,
              systemInfo,
              moduleInfo,
              baseInterface) {
        return declare("moduleAdminSystemInterface", baseInterface, {
            _systemInfo: null,
            _moduleInfo: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                topic.publish("sendBalekProtocolMessage", {
                    moduleMessage: {
                        instanceKey: this._instanceKey,
                        messageData: {request: "systemData"}
                    }
                });
                topic.publish("sendBalekProtocolMessage", {
                    moduleMessage: {
                        instanceKey: this._instanceKey,
                        messageData: {request: "moduleList"}
                    }
                });
                topic.publish("sendBalekProtocolMessage", {
                    moduleMessage: {
                        instanceKey: this._instanceKey,
                        messageData: {request: "runningInstances"}
                    }
                });
                this._moduleInfo = new moduleInfo();
                topic.publish("addToCurrentWorkspace", this);
            },
            receiveMessage: function (moduleMessage) {
                if (moduleMessage.instanceKey == this._instanceKey) {
                    if (moduleMessage.messageData) {
                        if (moduleMessage.messageData.systemData) {
                            this.updateSystemData(moduleMessage.messageData.systemData);
                        }
                        if (moduleMessage.messageData.runningInstances) {
                            this.updateRunningInstances(JSON.parse(moduleMessage.messageData.runningInstances));
                        }
                        if (moduleMessage.messageData.moduleList) {
                            this.updateModuleList(moduleMessage.messageData.moduleList);
                        }
                    }
                }
            },
            updateSystemData: function (systemData) {
                if (this._systemInfo == null) {
                    this._systemInfo = new systemInfo({_instanceKey: this._instanceKey, _systemData: systemData});
                    topic.publish("addToBackgroundLayer", this._systemInfo.domNode);
                } else {
                    this._systemInfo.setData(systemData);
                }
            },
            updateModuleList: function (moduleList) {
                this._moduleInfo.updateModuleList(moduleList);
            },
            updateRunningInstances: function (runningInstances) {
                this._moduleInfo.updateRunningInstances(runningInstances);
            },
            toggleShowView: function () {
                let currentStateToggle = {"visible": "hidden", "hidden": "visible"};
                domStyle.set(this._moduleInfo.domNode, {"visibility": currentStateToggle[domStyle.get(this._moduleInfo.domNode, "visibility")]});
                domStyle.set(this._systemInfo.domNode, {"visibility": currentStateToggle[domStyle.get(this._systemInfo.domNode, "visibility")]});
            },
            getWorkspaceDomNode: function () {
                return this._moduleInfo.domNode;
            },
            unload: function () {
                this._systemInfo.unload();
                this._moduleInfo.unload();
            }
        });
    }
);
