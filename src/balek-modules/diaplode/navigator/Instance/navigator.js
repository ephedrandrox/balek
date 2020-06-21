define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'dojo/node!crypto',

        'balek-modules/Instance',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',
        'balek-modules/diaplode/navigator/Database/navigator/menus',


        'balek-modules/diaplode/navigator/Instance/radialMenu',

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
            _sessionKey: null,
            _userKey: null,

            _menus: {},

            _menusFromDatabase: {},


            _menusDatabaseController: {},

            _stateChangeInterfaceCallback: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                this._menus = {}; //new Menus object for this instance
                this._menusFromDatabase = {};

                if(this._instanceKey !== null && this._sessionKey !== null && this._userKey !== null )
                {
                    this._menusDatabaseController = new menuDatabaseController({_instanceKey: this._instanceKey, _userKey: this._userKey});

                    this._menusDatabaseController.getUserMenus().then(lang.hitch(this,function (response){
                        response.toArray().then(lang.hitch(this, function(menus){

                            for (const menu of menus){
                                this.loadMenu(menu.name, menu._id.toString());
                                this._menusFromDatabase[menu._id] = menu;
                            }
                            this._interfaceState.set("log", "Menus received");
                        }));

                    })).catch(lang.hitch(this,function(error) {
                        this._interfaceState.set("log", "ERROR getting menus from database" + error);
                    }));
                }
                else{

                    console.log("Do not have all our keys!");
                }


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

                if(remoteCommanderCallback)
                {
                    remoteCommanderCallback({success: "Changed Menu Name"});

                }

            },
            loadMenu: function(name, id){
                let newMenu = new radialMenu({_sessionKey: this._sessionKey,
                    _instanceKey: this._instanceKey,
                    _userKey: this._userKey,
                    _menuName: name,
                    _menuID: id });
                this._menus[newMenu._componentKey] = newMenu;
                this._interfaceState.set("availableMenus", Object.keys(this._menus));
            },
            newMenu: function(name, remoteCommanderCallback)
            {
                this._menusDatabaseController.newMenu(name).then(lang.hitch(this,function (response){
                            let menuID = response.ops[0]._id.toString();


                    this.loadMenu(name, menuID);

                    if(remoteCommanderCallback) {
                        remoteCommanderCallback({success: "Created menu and set state"});
                    }
                        this._interfaceState.set("log", "New Menmu Added to Database");
                    })).catch(lang.hitch(this,function(error) {
                    this._interfaceState.set("log", "ERROR adding menu to database" + error);
                }));



            },
            _end: function(){
                return this.inherited(arguments);
            }
        });
    }
);


