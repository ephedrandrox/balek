define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/diaplode/commander/Instance/console',
        'balek-modules/diaplode/commander/Database/settings',
        'balek-modules/components/syncedCommander/Instance'

    ],
    function (declare, lang, topic,  consoleInstance, settingsDatabase, _syncedCommanderInstance) {
        return declare("moduleDiaplodeCommanderModuleInstance", _syncedCommanderInstance, {
            _instanceKey: null,
            _sessionKey: null,

            _consoleInstance: null,

            _settingsDatabase: null,

            _userSettings:{ showOnLoad: true},  //these will be saved in database if no settings found

            constructor: function (args) {

                declare.safeMixin(this, args);

                //set syncedCommander commands
                this._commands={
                    "saveSettings" : lang.hitch(this, this.saveSettings)
                };
                //activate syncedCommander commands
                this.setInterfaceCommands();

                this._interfaceState.set("className", "moduleDiaplodeCommanderModuleInstance");

                topic.publish("getSessionUserKey", this._sessionKey, lang.hitch(this, function(userKey){

                    this._userKey = userKey;
                    this._settingsDatabase = new settingsDatabase({_instanceKey: this._instanceKey, _userKey: userKey});

                    //todo make a settings database automatic using settings manager
                    this._settingsDatabase.getUserSettings().then(lang.hitch(this, function(userSettings){
                        userSettings.toArray().then(lang.hitch(this, function(userSettingsArray){

                            if(userSettingsArray.length>0 && userSettingsArray[0].userSettings)
                            {
                                this._userSettings = userSettingsArray[0].userSettings;
                            }else
                            {
                                this._settingsDatabase.setUserSettings(this._userSettings);
                            }
                            //Now that settings are loaded or set to default
                            this.loadComponents();

                        }));
                    })).catch(function(error){
                        console.log(error);
                    });

                }));

                console.log("moduleDiaplodeCommanderInstance starting...");

            },
            loadComponents: function(){
                this._consoleInstance = new consoleInstance({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey, _userKey: this._userKey});
                this._interfaceState.set("commanderConsoleInstanceKeys", {instanceKey: this._consoleInstance._instanceKey,
                    sessionKey: this._consoleInstance._sessionKey,
                    userKey: this._consoleInstance._userKey,
                    componentKey: this._consoleInstance._componentKey});

                if(this._userSettings.showOnLoad)
                {
                    this._consoleInstance.undockInterface();
                }
            },
            saveSettings:function(settings, remoteCommanderCallback) {
                remoteCommanderCallback({message: "worked"});
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


