define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/Instance',
        'balek-server/session/sessionsController/instanceCommands',

        'balek-modules/diaplode/navigator/Instance/navigator',
        'balek-modules/components/syncedCommander/Instance'


    ],
    function (declare, lang, topic, baseInstance,SessionsControllerInstanceCommands, navigator, _syncedCommanderInstance) {
        return declare("moduleDiaplodeNavigatorModuleInstance", _syncedCommanderInstance, {
            _instanceKey: null,
            _sessionKey: null,
            _navigator: null,
            sessionsControllerCommands: null,


            constructor: function (args) {

                declare.safeMixin(this, args);

                this._interfaceState.set("className", "moduleDiaplodeNavigatorModuleInstance");

                this._interfaceState.set("isVisibile",  true);
                let sessionsControllerInstanceCommands = new SessionsControllerInstanceCommands();
                this.sessionsControllerCommands = sessionsControllerInstanceCommands.getCommands();

                let userKey = this.sessionsControllerCommands.getSessionUserKey(this._sessionKey)
                this._navigator = new navigator({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey, _userKey: userKey});
                this._interfaceState.set("navigatorInstanceKeys", {instanceKey: this._instanceKey, componentKey: this._navigator.getComponentKey() });


                // topic.publish("getSessionUserKey", this._sessionKey, lang.hitch(this, function(userKey){
                //    }));

                console.log("moduleDiaplodeRadialNavigatorInstance starting...");


                this._commands={
                    "newMenu" : lang.hitch(this, this.newMenu),
                    "setVisibility": lang.hitch(this, this.setVisibility),
                    "setElementMenuVisibility": lang.hitch(this, this.setElementMenuVisibility),
                    "setWorkspaceMenuVisibility": lang.hitch(this, this.setWorkspaceMenuVisibility),
                    "setContainerMenuVisibility": lang.hitch(this, this.setContainerMenuVisibility),

                };


                //activate syncedCommander commands
                this.setInterfaceCommands();


            },
            newMenu: function(remoteCommandCallback){
                remoteCommandCallback({error: "could not create menu..."})
            },
            setVisibility: function(isVisible, remoteCommandCallback)
            {
                this._interfaceState.set("isVisible",  isVisible);
            },
            setElementMenuVisibility: function(isVisible, remoteCommandCallback){
                this._interfaceState.set("elementMenuIsVisible",  isVisible);

            },
            setWorkspaceMenuVisibility: function(isVisible, remoteCommandCallback){
                this._interfaceState.set("workspaceMenuIsVisible",  isVisible);

            },
            setContainerMenuVisibility: function(isVisible, remoteCommandCallback){
                this._interfaceState.set("containerMenuIsVisible",  isVisible);

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


