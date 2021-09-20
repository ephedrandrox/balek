define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        //Balek Instance Includes
        'balek-modules/components/syncedCommander/Instance',

    ],
    function (declare,
              lang,
              topic,


              _syncedCommanderInstance) {
        return declare("moduleDiaplodeNavigatorContainerMenuInstance", [_syncedCommanderInstance], {
            _instanceKey: null,
            _sessionKey: null,
            _userKey: null,
            _componentKey: null,


            constructor: function (args) {
                declare.safeMixin(this, args);


                if(this._instanceKey !== null && this._sessionKey !== null && this._userKey !== null && this._componentKey !== null )
                {

                    this._commands={
                        "setDocked" : lang.hitch(this, this.setDocked),
                    };

                    this._interfaceState.set("componentModule", "Navigator Container Menu");

                    this.prepareSyncedState();
                    this.setInterfaceCommands();

                }
                else{

                    console.log("Do not have all our keys!", this._instanceKey, this._sessionKey , this._userKey , this._componentKey );
                }


                console.log("moduleDiaplodeContainerMenuInstance starting...");
            },
            setDocked: function(status, remoteCommandCallback){
                remoteCommandCallback({success: "Got setDocked Command"});
            },
            _end: function () {
                this.inherited(arguments);
            }
        });
    }
);


