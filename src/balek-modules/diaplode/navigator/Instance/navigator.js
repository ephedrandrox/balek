define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'dojo/node!crypto',

        'balek-modules/Instance',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',

        'balek-modules/diaplode/navigator/Instance/radialMenu'

    ],
    function (declare, lang, topic, crypto, baseInstance, stateSynced, remoteCommander, radialMenu) {
        return declare("moduleDiaplodeNavigatorInstance", [baseInstance,stateSynced,remoteCommander], {
            _instanceKey: null,

            _menus: {},

            _stateChangeInterfaceCallback: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._menus = {}; //new Menus object for this instance


                //set commands
                this._commands={
                    "changeName" : lang.hitch(this, this.changeName),
                    "newMenu" : lang.hitch(this, this.newMenu),
                };

                //set state
                this._interfaceState.set("availableMenus", {});
                this._interfaceState.set("activeFocus", true);

                this.prepareSyncedState();

                this.setInterfaceCommands();

                console.log("moduleDiaplodeNavigatorInstance starting...");
            },
            changeName: function(newName, remoteCommanderCallback)
            {
                this._interfaceState.set("name", newName);
                remoteCommanderCallback({success: "Name Set"});
            },
            newMenu: function(name, remoteCommanderCallback)
            {
                let newMenu = new radialMenu({_instanceKey: this._instanceKey, _menuName: name});

                this._menus[newMenu._componentKey] = newMenu;

                let originalMenus = this._interfaceState.get("availableMenus");
                originalMenus[newMenu._componentKey]={name: name, componentKey: newMenu._componentKey};
                this._interfaceState.set("availableMenus", originalMenus);

                remoteCommanderCallback({success: "Created menu and set state"});
            },
            _end: function(){
                return this.inherited(arguments);

            }
        });
    }
);


