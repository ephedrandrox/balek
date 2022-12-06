define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        //Diaplode Instance Includes
        'balek-modules/diaplode/commander/Instance/terminal',
        'balek-modules/diaplode/commander/Instance/console',
        'balek-modules/diaplode/commander/Database/settings',
        'balek-modules/components/syncedCommander/Instance',
        'balek-server/session/sessionsController/instanceCommands'


    ],
    function (declare, lang, topic, terminalInstance, consoleInstance, settingsDatabase, _syncedCommanderInstance, SessionsControllerInstanceCommands) {
        return declare("moduleDiaplodeCommanderModuleInstance", _syncedCommanderInstance, {
            _instanceKey: null,
            _sessionKey: null,

            _terminalInstances: [],
            _consoleInstance: null,

            _settingsDatabase: null,

            _userSettings:{ consoleDockedOnLoad: true},  //these will be saved in database if no settings found
            sessionsControllerCommands: null,
            constructor: function (args) {

                declare.safeMixin(this, args);

                let sessionsControllerInstanceCommands = new SessionsControllerInstanceCommands();
                this.sessionsControllerCommands = sessionsControllerInstanceCommands.getCommands();

                this._terminalInstances = [];
                //set syncedCommander commands
                this._commands={
                    "saveSettings" : lang.hitch(this, this.saveSettings),
                    "newTerminal" : lang.hitch(this, this.newTerminal)

                };
                //activate syncedCommander commands
                this.setInterfaceCommands();

                this._interfaceState.set("className", "moduleDiaplodeCommanderModuleInstance");

                    let userKey = this.sessionsControllerCommands.getSessionUserKey(this._sessionKey)

                    this._userKey = userKey;
                    this._settingsDatabase = new settingsDatabase({_instanceKey: this._instanceKey, _userKey: userKey});
                    console.log("moduleDiaplodeCommanderInstance starting...1");

                    //todo make a settings database automatic using settings manager
                    this._settingsDatabase.getUserSettings().then(lang.hitch(this, function(userSettingsArray){
                        console.log("moduleDiaplodeCommanderInstance starting...2");

                            if(userSettingsArray.length>0 && userSettingsArray[0].userSettings)
                            {                    console.log("moduleDiaplodeCommanderInstance starting...3");

                                this._userSettings = userSettingsArray[0].userSettings;
                            }else
                            {                    console.log("moduleDiaplodeCommanderInstance starting...4");

                                this._settingsDatabase.setUserSettings(this._userSettings);
                            }
                            //Now that settings are loaded or set to default
                        console.log("moduleDiaplodeCommanderInstance loadComponents...4");

                        this.loadComponents();
                        console.log("moduleDiaplodeCommanderInstance loadComponents...4");


                    })).catch(function(error){
                        console.log(error);
                    });


                console.log("moduleDiaplodeCommanderInstance starting...5");

            },
            loadComponents: function(){
                this._consoleInstance = new consoleInstance({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey, _userKey: this._userKey});
                this._interfaceState.set("commanderConsoleInstanceKeys", {instanceKey: this._consoleInstance._instanceKey,
                    sessionKey: this._consoleInstance._sessionKey,
                    userKey: this._consoleInstance._userKey,
                    componentKey: this._consoleInstance._componentKey});

                if(this._userSettings.consoleDockedOnLoad)
                {
                    this._consoleInstance.dockInterface();
                }else {
                    this._consoleInstance.undockInterface();
                }
            },
            saveSettings:function(settings, remoteCommanderCallback) {
                console.log("moduleDiaplodeCommanderInstance saveSettings...4");

                if(settings.consoleDockedOnLoad === true || settings.consoleDockedOnLoad === false)
                {
                    this._userSettings.consoleDockedOnLoad = settings.consoleDockedOnLoad;
                }
                this._settingsDatabase.setUserSettings(this._userSettings).then(function(Result){
                    remoteCommanderCallback({message: "worked"});
                }).catch(function(errorResult){
                    remoteCommanderCallback({error: errorResult});
                });
            },
            newTerminal: function(remoteCommandCallback){
                console.log("moduleDiaplodeCommanderInstance newTerminal...4");

                remoteCommandCallback({success: "creating new Terminal Instance..."})
                let newTerminalInstance = new terminalInstance({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey, _userKey: this._userKey});
                this._terminalInstances.push( newTerminalInstance );
                this._interfaceState.set("commanderTerminalInstanceKeys"+this._terminalInstances.length, {instanceKey: newTerminalInstance._instanceKey,
                    sessionKey: newTerminalInstance._sessionKey,
                    userKey: newTerminalInstance._userKey,
                    componentKey: newTerminalInstance._componentKey});
            },
            _end: function () {
                    return new Promise(lang.hitch(this, function(Resolve, Reject){
                        console.log("destroying navigator Module Interface ");
                        Resolve({success: "Unloaded Instance"});
                    }));
            }
        });
    }
);


