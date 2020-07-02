define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/Instance',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote'

    ],
    function (declare,
              lang,
              topic,


              baseInstance,
              stateSynced,
              remoteCommander
            ) {
        return declare("moduleDiaplodeNavigatorInstance", [baseInstance,stateSynced,remoteCommander], {
            _instanceKey: null,
            _sessionKey: null,
            _userKey: null,

            _stateChangeInterfaceCallback: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                if(this._instanceKey !== null && this._sessionKey !== null && this._userKey !== null )
                {

                }
                else{

                    console.log("Do not have all our keys!");
                }



                //set setRemoteCommander commands
                this._commands={
                    "changeName" : lang.hitch(this, this.changeName),
                    "findUser" : lang.hitch(this, this.findUser),
                };

                //set state
                this._interfaceState.set("navigatorSetings", {});
                this._interfaceState.set("activeFocus", true);
                this._interfaceState.set("log", "log Started");

                //todo attache these to the constructor in base class
                this.prepareSyncedState();
                this.setInterfaceCommands();



                console.log("moduleConspironeNavigatorInstance starting...");
            },
            findUser: function(name, remoteCommanderCallback)
            {

                if(remoteCommanderCallback) {
                    remoteCommanderCallback({success: "Created menu and set state"});
                }




            },changeName: function(name, remoteCommanderCallback)
            {

                if(remoteCommanderCallback) {
                    remoteCommanderCallback({success: "Created menu and set state"});
                }




            },
            _end: function(){
                return this.inherited(arguments);
            }
        });
    }
);


