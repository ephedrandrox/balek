//todo move and clean up this to custom menus
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'dojo/node!crypto',


        'balek-modules/diaplode/navigator/Database/navigator/menus',


        //   'balek-modules/diaplode/navigator/Instance/radialMenu',//todo remove
        //  'balek-modules/diaplode/navigator/Instance/menus/systemMenu',
        'balek-modules/diaplode/navigator/Instance/menus/workspaceMenu',
        'balek-modules/diaplode/navigator/Instance/menus/containerMenu',
        'balek-modules/diaplode/navigator/Instance/menus/elementMenu',
        'balek-modules/diaplode/navigator/Instance/menus/customMenu',


        'balek-modules/components/syncedCommander/Instance'

    ],
    function (declare,
              lang,
              topic,
              crypto,
              menuDatabaseController,
              //  radialMenu,
              //   systemMenu,
              workspaceMenu,
              containerMenu,
              elementMenu,
              customMenu,
              _syncedCommanderInstance) {
        return declare("moduleDiaplodeNavigatorInstance", _syncedCommanderInstance, {
            _instanceKey: null,
            _sessionKey: null,
            _userKey: null,

            _systemMenuNames: {},
            _systemMenus: {},

            _workspaceMenu: null,
            _containerMenu: null,
            _elementMenu: null,
            _customMenu: null,


            _menus: {}, //todo remove


            _menusFromDatabase: {}, //todo change to user menus


            _menusDatabaseController: {},

            _stateChangeInterfaceCallback: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._menus = {}; //new Menus object for this instance


                this._systemMenus = {};
                this._systemMenuNames = {};

                this._menusFromDatabase = {};
                if (this._instanceKey !== null && this._sessionKey !== null && this._userKey !== null) {
                    this._menusDatabaseController = new menuDatabaseController({
                        _instanceKey: this._instanceKey,
                        _userKey: this._userKey
                    });
                    this._menusDatabaseController.getUserMenus().then(lang.hitch(this, function (response) {

                        response.toArray().then(lang.hitch(this, function (menus) {

                            for (const index in menus) {
                                let menu = menus[index];
                                this.loadMenu(menu.name, menu._id.toString());
                                this._menusFromDatabase[menu._id] = menu;
                            }

                            this._interfaceState.set("log", "Menus received");
                        }));

                    })).catch(lang.hitch(this, function (error) {
                        this._interfaceState.set("log", "ERROR getting menus from database" + error);
                    }));
                } else {

                    console.log("Do not have all our keys!");
                }


                //set setRemoteCommander commands
                this._commands = {
                    "changeName": lang.hitch(this, this.changeName),
                    "newMenu": lang.hitch(this, this.newMenu),
                    //   "requestSystemMenuInstance" : lang.hitch(this, this.requestSystemMenuInstance)
                };

                //set state
                this._interfaceState.set("availableMenus", {});
                this._interfaceState.set("activeFocus", true);
                this._interfaceState.set("log", "log Started");


                //todo use this pattern to create syncedMap that creates interfaces automatically
                this._workspaceMenu = new workspaceMenu({
                    _sessionKey: this._sessionKey, _instanceKey: this._instanceKey,
                    _userKey: this._userKey
                });

                this._interfaceState.set("workspaceMenuKey", this._workspaceMenu.getComponentKey());

                this._containerMenu = new containerMenu({
                    _sessionKey: this._sessionKey, _instanceKey: this._instanceKey,
                    _userKey: this._userKey
                });

                this._interfaceState.set("containerMenuKey", this._containerMenu.getComponentKey());

                this._elementMenu = new elementMenu({
                    _sessionKey: this._sessionKey, _instanceKey: this._instanceKey,
                    _userKey: this._userKey
                });

                this._interfaceState.set("elementMenuKey", this._elementMenu.getComponentKey());


                this._customMenu = new customMenu({
                    _sessionKey: this._sessionKey, _instanceKey: this._instanceKey,
                    _userKey: this._userKey
                });

                this._interfaceState.set("customMenuKey", this._customMenu.getComponentKey());


                //todo attache these to the constructor in base class
            //    this.prepareSyncedState();
              //  this.setInterfaceCommands();

                console.log("moduleDiaplodeNavigatorInstance starting...");
            },
            changeName: function (newName, remoteCommanderCallback) {

                this._interfaceState.set("name", newName);

                if (remoteCommanderCallback) {
                    remoteCommanderCallback({success: "Changed Menu Name"});

                }

            },
            loadMenu: function (name, id) {
                let newMenu = new radialMenu({
                    _sessionKey: this._sessionKey,
                    _instanceKey: this._instanceKey,
                    _userKey: this._userKey,
                    _menuName: name,
                    _menuID: id
                });
                this._menus[newMenu._componentKey] = newMenu;
                this._interfaceState.set("availableMenus", Object.keys(this._menus));
            },
            newMenu: function (name, remoteCommanderCallback) {
                this._menusDatabaseController.newMenu(name).then(lang.hitch(this, function (response) {
                    let menuID = response.ops[0]._id.toString();


                    this.loadMenu(name, menuID);

                    if (remoteCommanderCallback) {
                        remoteCommanderCallback({success: "Created menu and set state"});
                    }
                    this._interfaceState.set("log", "New Menmu Added to Database");
                })).catch(lang.hitch(this, function (error) {
                    this._interfaceState.set("log", "ERROR adding menu to database" + error);
                }));


            },
            requestSystemMenuInstance: function (name, remoteCommanderCallback) {

                let systemMenuName = name.toString();
                if (this._systemMenuNames[systemMenuName] === undefined) {
                    let newSystemMenuInstance = new systemMenu({
                        _sessionKey: this._sessionKey, _instanceKey: this._instanceKey,
                        _userKey: this._userKey,
                        _menuName: systemMenuName
                    });

                    this._systemMenus[newSystemMenuInstance.getComponentKey()] = newSystemMenuInstance;
                    this._systemMenuNames[systemMenuName] = newSystemMenuInstance;
                    this._interfaceState.set("availableSystemMenus", Object.keys(this._systemMenus));


                    remoteCommanderCallback({
                        "success": "new System menu Instance creates",
                        "componentKey": newSystemMenuInstance.getComponentKey()
                    });

                } else {
                    remoteCommanderCallback({
                        "error": "System Menu Name already taken",
                        "systemMenuName": systemMenuName
                    });

                }

            },
            _end: function () {
                return this.inherited(arguments);
            }
        });
    }
);


