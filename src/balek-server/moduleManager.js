define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/node!crypto'
    ],
    function (declare, lang, topic, crypto) {
        return declare("balekModuleManager", null, {

            _modulesFilePath: "./src/balek-modules/",
            _modulesFileTree: null,
            _modules: {},
            _instances: {},

            constructor: function (args) {

                declare.safeMixin(this, args);

                console.log("Initializing######################### Balek Module Managers for server...");

                topic.subscribe("loadModuleForClient", lang.hitch(this, this.loadModuleForClient));
                topic.subscribe("unloadModuleInstance", lang.hitch(this, this.unloadModuleInstance));
                
                topic.subscribe("getModuleListForUser", lang.hitch(this, this.getModuleListForUser));
                topic.subscribe("getRunningInstances", lang.hitch(this, this.getRunningInstances));

                topic.subscribe("receiveModuleMessage", lang.hitch(this, this.receiveModuleMessage));
                topic.subscribe("receiveModuleManagerMessage", lang.hitch(this, this.receiveModuleManagerMessage));

            },
            _start: function (moduleManagerPromiseResolve, moduleManagerPromiseReject) {

                this.loadModules(lang.hitch(this, function (error) {
                    if (error) {
                        moduleManagerPromiseReject(error);
                    } else {
                        moduleManagerPromiseResolve("Modules Loaded");
                    }
                }));

            },
            receiveModuleManagerMessage: function (moduleManagerMessage, wssConnection) {
                if (moduleManagerMessage.listRequest) {
                    this.getModuleListForUser(wssConnection._sessionKey, function (availableModulesList) {

                        topic.publish("sendBalekProtocolMessage", wssConnection, {moduleManagerMessage: {availableModulesListRequest: availableModulesList}});

                    });
                }
            },
            getModuleListForUser: function (sessionKey, returnModuleList) {
                let moduleList = {};
                topic.publish("getSessionStatus", sessionKey, lang.hitch(this, function (sessionStatus) {

                    topic.publish("getSessionUserGroups", sessionKey, lang.hitch(this, function (sessionUserGroups) {
                        for (var name in this._modules) {
                            let allowedSessions = this._modules[name].allowedSessions();
                            if (allowedSessions == null || (Array.isArray(allowedSessions) && allowedSessions.includes(sessionStatus))) {
                                var allowedGroups = this._modules[name].allowedGroups();
                                if (allowedGroups == null || Array.isArray(sessionUserGroups) && Array.isArray(allowedGroups)) {
                                    if (allowedGroups == null || allowedGroups.some(group => sessionUserGroups.includes(group))) {
                                        moduleList[name.toString()] = {
                                            displayName: this._modules[name]._displayName,
                                            interfacePath: name,
                                            iconPath: this._modules[name]._iconPath
                                        };
                                    }
                                }
                            }
                        }
                        returnModuleList(moduleList);
                    }));

                }));

            },
            receiveModuleMessage: function (moduleMessage, wssConnection, messageCallback) {

                if (moduleMessage.instanceKey ) {
                    if( this._instances[moduleMessage.instanceKey]){
                        this._instances[moduleMessage.instanceKey].receiveMessage(moduleMessage, wssConnection, messageCallback);
                    }else {
                        console.log();

                        messageCallback({error: "Unknown Instance key"});
                    }

                } else if (moduleMessage.loadRequest) {

                    this.loadModuleForClient(wssConnection, moduleMessage.loadRequest, function (moduleInterface) {
                        if (moduleInterface === null) {
                            //error
                        } else {
                            topic.publish("sendBalekProtocolMessage", wssConnection, moduleInterface);
                        }
                    });

                }

            },
            getRunningInstances: function (returnCallback) {

                let instances = {};

                for (var instanceKey in this._instances) {

                    instances[instanceKey] = {
                        moduleName: this._instances[instanceKey]._moduleName,
                        moduleDisplayName: this._modules[this._instances[instanceKey]._moduleName]._displayName,
                        sessionKey: this._instances[instanceKey]._sessionKey,
                    }

                }

                let jsonString = JSON.stringify(instances);

                returnCallback(jsonString);
            },
            getInstanceModuleDisplayName: function (instanceKey) {
                this._modules[this._instances[instanceKey]._moduleName]._displayName
            },
            unloadModuleInstance: function(instanceKey, returnCallback){
                console.log("unloading instance " + instanceKey);

                if(this._instances[instanceKey] !== undefined){
                    this._instances[instanceKey]._end().then( lang.hitch(this, instanceEndResult =>{
                        delete this._instances[instanceKey];
                        returnCallback(true);
                    })).catch( instanceEndError =>{
                        returnCallback(false);
                    });
                }else {
                    returnCallback(false);
                }
            },
            loadModuleForClient: function (wssConnection, moduleName, returnCallback) {

                if (this._modules[moduleName]) {

                    let allowedGroups = this._modules[moduleName].allowedGroups();
                    let allowedSessions = this._modules[moduleName].allowedSessions();

                    topic.publish("getSessionStatus", wssConnection._sessionKey, lang.hitch(this, function (sessionStatus) {

                        if (allowedSessions == null || (Array.isArray(allowedSessions) && allowedSessions.includes(sessionStatus))) {

                            topic.publish("getSessionUserGroups", wssConnection._sessionKey, lang.hitch(this, function (sessionUserGroups) {
                                if (allowedGroups == null || Array.isArray(sessionUserGroups) && Array.isArray(allowedGroups)) {
                                    if (allowedGroups == null || allowedGroups.some(group => sessionUserGroups.includes(group))) {

                                        let instanceKey = this.getUniqueInstanceKey();

                                        this._instances[instanceKey] = this._modules[moduleName].newInstance({
                                            _instanceKey: instanceKey,
                                            _moduleName: moduleName,
                                            _sessionKey: wssConnection._sessionKey
                                        });

                                        topic.publish("addInstanceToSession", wssConnection._sessionKey, this._instances[instanceKey]);

                                        let clientMessage = {
                                            moduleAction: {
                                                action: "Module Loaded",
                                                name: moduleName,
                                                interfacePath: "balek-modules/" + moduleName + "/Interface",
                                                instanceKey: instanceKey
                                            }
                                        };
                                        returnCallback(clientMessage);

                                    } else {
                                        console.log("Module not available to user", moduleName, wssConnection._sessionKey);
                                    }
                                }

                            }));

                        } else {
                            console.log("session status does not allow loading this module", sessionStatus, wssConnection._sessionKey);
                        }

                    }));

                } else {
                    console.log("Module not found", moduleName, wssConnection._sessionKey);
                    returnCallback(null);
                }
            },

            getUniqueInstanceKey: function () {
                do {
                    var id = crypto.randomBytes(20).toString('hex');
                    if (typeof this._instances[id] == "undefined") return id;
                } while (true);
            },
            loadModules: function (returnCallback) {

                topic.publish("returnFileTree", this._modulesFilePath, lang.hitch(this, function (error, moduleFileTree) {
                    if (error) {
                        returnCallback(error);
                    } else {
                        this._modulesFileTree = moduleFileTree;

                        this.checkAndLoadModulesFromTree(this._modulesFileTree, lang.hitch(this, function (error) {
                            if (error) {
                                returnCallback(error)
                            } else {
                                //return null because no error;
                                returnCallback(null);
                            }
                        }));
                    }
                }));

            },
            checkAndLoadModulesFromTree: function (modulesFileTree, returnCallback) {

                for (const file in modulesFileTree) {
                    if (!(file == "__fileStats__" || file == "__filePath__")) {
                        if (modulesFileTree[file].__fileStats__.isDirectory()) {

                            let modulePath = modulesFileTree[file].__filePath__.substr(this._modulesFilePath.length);
                            if (modulesFileTree[file]['Instance.js'] && modulesFileTree[file]['Interface.js'] && modulesFileTree[file]['Module.js']) {
                                console.log(modulePath);
                                //todo try/catch then returnCallback(error) this require
                                require(["balek-modules/" + modulePath + "/Module"], lang.hitch(this, function (newModule) {
                                    this._modules[modulePath] = new newModule();
                                }));
                            }

                            this.checkAndLoadModulesFromTree(modulesFileTree[file], returnCallback);

                        }

                    }

                }
                returnCallback(null);
            }
        });
    });