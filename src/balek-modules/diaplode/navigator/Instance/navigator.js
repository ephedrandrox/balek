define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'dojo/node!crypto',

        'balek-modules/Instance',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',
        'balek-modules/diaplode/navigator/Database/navigator/menus',


        'balek-modules/diaplode/navigator/Instance/radialMenu'

    ],
    function (declare,
              lang,
              topic,

              crypto,

              baseInstance,
              stateSynced,
              remoteCommander,
              menuDatabaseController,

              radialMenu) {
        return declare("moduleDiaplodeNavigatorInstance", [baseInstance,stateSynced,remoteCommander], {
            _instanceKey: null,
            _Collection: "diaplode",

            _menus: {},

            _menusDatabaseController: {},

            _stateChangeInterfaceCallback: null,

            constructor: function (args) {
                debugger;
                declare.safeMixin(this, args);
                this._menus = {}; //new Menus object for this instance

                this._menusDatabaseController = new menuDatabaseController();

                //set setRemoteCommander commands
                this._commands={
                    "changeName" : lang.hitch(this, this.changeName),
                    "newMenu" : lang.hitch(this, this.newMenu),
                };

                //set state
                this._interfaceState.set("availableMenus", {});
                this._interfaceState.set("activeFocus", true);
                this._interfaceState.set("log", "log Started");


                //todo attache these to the constructor in base class
                this.prepareSyncedState();
                this.setInterfaceCommands();





                console.log("moduleDiaplodeNavigatorInstance starting...");
            },
            changeName: function(newName, remoteCommanderCallback)
            {
                this._interfaceState.set("name", newName);


                this._menusDatabaseController.newMenu(newName).then(lang.hitch(this,function (response){
                    this._interfaceState.set("log", "Item Inserted " + response.ops[0]);
                    remoteCommanderCallback({success: "Name Set"});

                })).catch(lang.hitch(this,function(error) {
                    this._interfaceState.set("log", "ERROR making new menu in database" + error);
                    remoteCommanderCallback({error: "Name Not Set"});

                }));




            },
            newMenu: function(name, remoteCommanderCallback)
            {
                let newMenu = new radialMenu({_instanceKey: this._instanceKey, _menuName: name});
                this._menus[newMenu._componentKey] = newMenu;
                this._interfaceState.set("availableMenus", Object.keys(this._menus));

                remoteCommanderCallback({success: "Created menu and set state"});
            },
            _end: function(){
                return this.inherited(arguments);
            }
        });
    }
);


