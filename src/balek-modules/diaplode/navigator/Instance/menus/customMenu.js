//todo bring database into and refactor user/system menus into this
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',


        'balek-modules/components/syncedCommander/Instance',
        'balek-modules/components/syncedMap/Instance',
        'balek-modules/diaplode/navigator/Instance/menus/customMenu/customMenu'


    ],
    function (declare,
              lang,
              topic,


              _syncedCommanderInstance,
              syncedMapInstance,
              customMenu
    ) {
        return declare("moduleDiaplodeNavigatorCustomMenuInstance", [_syncedCommanderInstance], {
            _instanceKey: null,
            _sessionKey: null,
            _userKey: null,
            _componentKey: null,

            _availableMenus: null,

            _menuNames: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._menuNames = {};
                //todo remove after adding Custom type id

                if(this._instanceKey !== null && this._sessionKey !== null && this._userKey !== null && this._componentKey !== null )
                {

                    this._commands={

                        "setDocked" : lang.hitch(this, this.setDocked),
                        "newMenu" : lang.hitch(this, this.newMenu)
                    };

                    this._interfaceState.set("componentModule", "Navigator Custom Menu");


                    this.prepareSyncedState();
                    this.setInterfaceCommands();




                }
                else{

                    console.log("Do not have all our keys!", this._instanceKey, this._sessionKey , this._userKey , this._componentKey );
                }

                this._availableMenus  = new syncedMapInstance({_instanceKey: this._instanceKey});


                this._interfaceState.set("availableMenusComponentKey", this._availableMenus.getComponentKey());

                console.log("moduleDiaplodeCustomMenuInstance starting...");
            },
            setDocked: function(status, remoteCommandCallback){

            },
            newMenu:function(status, remoteCommandCallback){

                if(status._syncedMapComponentKey &&  status._syncedMapInstanceKey &&status._menuName){

                    if(!this._menuNames[status._menuName]){
                        let newMenu = customMenu({ _syncedMapComponentKey: status._syncedMapComponentKey,
                            _syncedMapInstanceKey: status._syncedMapInstanceKey,
                            _sessionKey: this._sessionKey,
                            _instanceKey: this._instanceKey,
                            _userKey: this._userKey,
                            _menuName: status._menuName });
                        this._menuNames[status._menuName] = true;
                        remoteCommandCallback({success: {componentKey: newMenu.getComponentKey(), menuName: status._menuName}});

                        this._availableMenus.add(newMenu.getComponentKey(), newMenu);

                    }else
                    {
                        remoteCommandCallback({error: "Already created Menu with this type", sent: status._menuName});

                    }

                }else {
                    remoteCommandCallback({error: "No _syncedMapComponentKey", sent: status});

                }

            },
            _end: function () {
                this.inherited(arguments);
            }
        });
    }
);


