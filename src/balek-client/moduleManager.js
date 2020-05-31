define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful'
    ],
    function (declare, lang, topic, Stateful) {

        return declare("balekClientModuleManager", null, {


            _interfaces: null,
            _availableModulesState: null,
            constructor: function (args) {


                declare.safeMixin(this, args);

                let availableModulesState = declare([Stateful], {
                    availableModules: null
                });

                this._availableModulesState = new availableModulesState({
                    availableModules: {}
                });


                this._interfaces = {};
                topic.subscribe("loadModuleInterface", lang.hitch(this, this.loadModuleInterface));
                topic.subscribe("receiveModuleMessage", lang.hitch(this, this.receiveModuleMessage));
                topic.subscribe("requestModuleLoad", lang.hitch(this, this.requestModuleLoad));
                topic.subscribe("isModuleLoaded", lang.hitch(this, this.isModuleLoaded));

                topic.subscribe("receiveModuleManagerMessage", lang.hitch(this, this.receiveModuleManagerMessage));

                topic.subscribe("getAvailableModulesState", lang.hitch(this, this.getAvailableModulesState));
                topic.subscribe("getInterfaceFromInstanceKey", lang.hitch(this, this.getInterfaceFromInstanceKey));

                topic.subscribe("unloadAllInterfaces", lang.hitch(this, this.unloadAllInterfaces));
            },
            _start: function (moduleManagerPromiseResolve, moduleManagerPromiseReject) {
                this.loadModules(lang.hitch(this, function (error) {
                    if (error) {
                        moduleManagerPromiseReject(error);
                    } else {
                        moduleManagerPromiseResolve("Modules Loaded")
                    }
                }));
            },
            getInterfaceFromInstanceKey: function (instanceKey, interfaceReturnCallback) {

                if (this._interfaces[instanceKey]) {
                    interfaceReturnCallback(this._interfaces[instanceKey]);
                }else {
                    interfaceReturnCallback(false);
                }
            },
            loadModuleInterface: function (moduleName, modulePath, moduleInstanceKey, returnCallback) {
                require([modulePath], lang.hitch(this, function (newInterface) {
                    if( this._interfaces[moduleInstanceKey] === undefined)
                    {
                        this._interfaces[moduleInstanceKey] = new newInterface({
                            _instanceKey: moduleInstanceKey,
                            _moduleName: moduleName
                        });
                    }


                    returnCallback(this._interfaces[moduleInstanceKey]);
                }));
            },
            unloadAllInterfaces: function (returnWhenDone) {
                let interfacesToUnload = this._interfaces;
                for (const interfaceKey in interfacesToUnload) {
                    interfacesToUnload[interfaceKey].unload();
                    delete interfacesToUnload[interfaceKey];
                }
                returnWhenDone();
            },
            receiveModuleManagerMessage: function (moduleManagerMessage) {
                if (moduleManagerMessage.availableModulesListRequest) {
                    this._availableModulesState.set("availableModules", moduleManagerMessage.availableModulesListRequest);
                }
            },
            getAvailableModulesState: function (moduleStoreReturn) {
                moduleStoreReturn(this._availableModulesState);
                this.askForAvailableModules();
            },
            askForAvailableModules: function () {
                topic.publish("sendBalekProtocolMessage", {moduleManagerMessage: {listRequest: "available"}});
            },
            receiveModuleMessage(moduleMessage) {
                if (this._interfaces[moduleMessage.instanceKey]) {
                    this._interfaces[moduleMessage.instanceKey].receiveMessage(moduleMessage);
                } else {
                    console.log("Unknown Instance key", moduleMessage);
                }
            },
            requestModuleLoad: function (moduleToLoad) {
                topic.publish("sendBalekProtocolMessage", {moduleMessage: {loadRequest: moduleToLoad}});
            },
            isModuleLoaded: function (moduleName, returnCallback) {
                let moduleIsLoaded = false;
                let interfaces = this._interfaces;

                for (const key in interfaces) {

                    if (interfaces[key]._moduleName == moduleName) {
                        moduleIsLoaded = this._interfaces[key];
                    }
                }

                returnCallback(moduleIsLoaded);
            }
        });
    });