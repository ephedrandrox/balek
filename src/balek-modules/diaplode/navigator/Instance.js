define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/Instance',
        'balek-modules/diaplode/navigator/Instance/navigator',
        'balek-modules/components/syncedCommander/Instance'


    ],
    function (declare, lang, topic, baseInstance, navigator, _syncedCommanderInstance) {
        return declare("moduleDiaplodeNavigatorModuleInstance", _syncedCommanderInstance, {
            _instanceKey: null,
            _sessionKey: null,
            _navigator: null,


            constructor: function (args) {

                declare.safeMixin(this, args);

                this._interfaceState.set("className", "moduleDiaplodeNavigatorModuleInstance");

                this._interfaceState.set("isVisibile",  true);



                topic.publish("getSessionUserKey", this._sessionKey, lang.hitch(this, function(userKey){
                    this._navigator = new navigator({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey, _userKey: userKey});
                    this._interfaceState.set("navigatorInstanceKeys", {instanceKey: this._instanceKey, componentKey: this._navigator.getComponentKey() });
                }));

                console.log("moduleDiaplodeRadialNavigatorInstance starting...");


                this._commands={
                    "newMenu" : lang.hitch(this, this.newMenu),
                    "setVisibility": lang.hitch(this, this.setVisibility),
                    "setElementMenuVisibility": lang.hitch(this, this.setElementMenuVisibility),

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
            _end: function () {
            return new Promise(lang.hitch(this, function(Resolve, Reject){
                console.log("destroying navigator Module Interface ");

                Resolve({success: "Unloaded Instance"});
            }));
            }
        });
    }
);


