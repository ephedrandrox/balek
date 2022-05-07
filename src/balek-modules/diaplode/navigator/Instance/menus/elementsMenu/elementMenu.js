define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',


        'balek-modules/components/syncedCommander/Instance',


    ],
    function (declare,
              lang,
              topic,


              _syncedCommanderInstance) {
        return declare("moduleDiaplodeNavigatorElementsMenuElementMenuInstance", [_syncedCommanderInstance], {
            _instanceKey: null,
            _sessionKey: null,
            _userKey: null,
            _componentKey: null,
            _menuName: "no name",

            _syncedMapComponentKey: null,
            _syncedMapInstanceKey: null,

            constructor: function (args) {
                declare.safeMixin(this, args);


                if(this._instanceKey !== null && this._sessionKey !== null && this._userKey !== null && this._componentKey !== null )
                {

                    this._commands={

                        "changeName" : lang.hitch(this, this.changeName),
                        "changeActiveStatus" : lang.hitch(this, this.changeActiveStatus),

                    };

                    this._interfaceState.set("availableMenuItems", {});
                    this._interfaceState.set("name",this._menuName);

                    this._interfaceState.set("syncedMapComponentKey", this._syncedMapComponentKey);
                    this._interfaceState.set("syncedMapInstanceKey", this._syncedMapInstanceKey);


                    this.prepareSyncedState();
                    this.setInterfaceCommands();

                }
                else{

                    console.log("Do not have all our keys!", this._instanceKey, this._sessionKey , this._userKey , this._componentKey );
                }



                console.log("moduleDiaplodeNavigatorElementsMenuElementMenuInstance starting...");
            },
            changeName: function(name, remoteCommandCallback)
            {
                this._interfaceState.set("name", name);
                remoteCommandCallback({success: "Name Set"});
            },
            changeActiveStatus: function(status, remoteCommandCallback){
                this._interfaceState.set("activeStatus", status);
                remoteCommandCallback({success: "Active Status Set"});
            },
            _end: function () {
                this.inherited(arguments);
            }
        });
    }
);


