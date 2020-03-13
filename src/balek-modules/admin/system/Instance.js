define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        "dojo/node!os",
        'balek-modules/Instance'],
    function (declare, lang, topic, nodeOS, baseInstance) {

        return declare("moduleAdminSystemInstance", baseInstance, {
            _systemData: {},

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleAdminSystemInstance starting...");
            },
            receiveMessage: function (moduleMessage, wssConnection) {
                //todo remove messages in module and implement data using state
                if (moduleMessage.instanceKey == this._instanceKey) {
                    if (moduleMessage.messageData) {
                        if (moduleMessage.messageData.request) {
                            switch (moduleMessage.messageData.request) {
                                case "systemData":
                                    topic.publish("sendBalekProtocolMessage", wssConnection, {
                                        moduleMessage: {
                                            instanceKey: this._instanceKey,
                                            messageData: {systemData: this.getSystemData()}
                                        }
                                    });
                                    break;
                                case "runningInstances":
                                    topic.publish("getRunningInstances", lang.hitch(this, function (runningInstances) {
                                        topic.publish("sendBalekProtocolMessage", wssConnection, {
                                            moduleMessage: {
                                                instanceKey: this._instanceKey,
                                                messageData: {runningInstances: runningInstances}
                                            }
                                        });
                                    }));
                                    break;
                                case "moduleList":
                                    topic.publish("getModuleListForUser", wssConnection._sessionKey, lang.hitch(this, function (moduleList) {
                                        topic.publish("sendBalekProtocolMessage", wssConnection, {
                                            moduleMessage: {
                                                instanceKey: this._instanceKey,
                                                messageData: {moduleList: moduleList}
                                            }
                                        });
                                    }));
                                    break;
                            }
                        }
                    }
                } else {
                    console.log("received Module message with incorrect instanceKey", moduleMessage.instanceKey, this._instanceKey)
                }
            },
            reloadData: function () {
                this._systemData.architecture = nodeOS.arch();
                this._systemData.cpus = nodeOS.cpus();
                this._systemData.memory = {};
                this._systemData.memory.total = nodeOS.totalmem();
                this._systemData.memory.free = nodeOS.freemem();
                this._systemData.homeDirectory = nodeOS.homedir();
                this._systemData.hostname = nodeOS.hostname();
                this._systemData.loadAverage = nodeOS.loadavg();
                this._systemData.networkInterfaces = nodeOS.networkInterfaces();
                this._systemData.platform = nodeOS.platform();
                this._systemData.release = nodeOS.release();
                this._systemData.type = nodeOS.type();
                this._systemData.uptime = nodeOS.uptime();
            },
            getSystemData: function () {
                this.reloadData();
                return this._systemData;
            }
        });
    }
);