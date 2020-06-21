define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/node!crypto',


        'balek-modules/Instance',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',

        'balek-modules/diaplode/navigator/Database/navigator/menuItems',
        'balek-modules/diaplode/navigator/Instance/menuItem',
    ],
    function (declare,
              lang,
              topic,
              crypto,

              baseInstance,
              stateSynced,
              remoteCommander,

              menuItemsDatabaseController,
              menuItem) {
        return declare("moduleDiaplodeNavigatorRadialMenuInstance", [baseInstance, stateSynced, remoteCommander,], {
            _instanceKey: null,
            _sessionKey: null,
            _userKey: null,

            _menuID: null,
            _menuName: "Untitled Instance",
            _menuItems: {},
            _menuItemsFromDatabase: {},

            _stateChangeInterfaceCallback: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._menuItems = {};
                this._menuItemsFromDatabase = {};



                if(this._instanceKey !== null && this._sessionKey !== null && this._userKey !== null && this._menuID !== null )
                {
                    this._menuItemsDatabaseController = new menuItemsDatabaseController({_instanceKey: this._instanceKey, _userKey: this._userKey, _menuID: this._menuID});

                    this._menuItemsDatabaseController.getMenuItems().then(lang.hitch(this,function (response){
                        response.toArray().then(lang.hitch(this, function(menuItems){

                            for (const menuItem of menuItems){
                                this.loadMenuItem(menuItem.name, menuItem._id.toString() );
                                this._menuItemsFromDatabase[menuItem._id] = menuItem;
                            }
                            this._interfaceState.set("log", "Menus Item received");
                        }));

                    })).catch(lang.hitch(this,function(error) {
                        this._interfaceState.set("log", "ERROR getting menus from database" + error);
                    }));
                }
                else{

                    console.log("Do not have all our keys!");
                }

                

                this._commands={

                    "changeName" : lang.hitch(this, this.changeName),
                    "changeActiveStatus" : lang.hitch(this, this.changeActiveStatus),
                    "newMenuItem" : lang.hitch(this, this.newMenuItem),
                };

                this._interfaceState.set("availableMenuItems", {});
                this._interfaceState.set("name",this._menuName);

                this.prepareSyncedState();
                this.setInterfaceCommands();


                console.log("moduleDiaplodeRadialMenuInstance starting...");
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
            loadMenuItem: function(name, id){

                let newMenuItem = new menuItem({_sessionKey: this._sessionKey,
                    _instanceKey: this._instanceKey,
                    _userKey: this._userKey,
                    _menuItemName: name,
                    _menuID: this._menuID,
                    _menuItemID: id});
                this._menuItems[newMenuItem._componentKey] = newMenuItem;
                this._interfaceState.set("availableMenuItems", Object.keys(this._menuItems));


            },
            newMenuItem: function(name , remoteCommanderCallback){



                this._menuItemsDatabaseController.newMenuItem(name).then(lang.hitch(this,function (response){
                    let menuItemID = response.ops[0]._id.toString();


                    this.loadMenuItem(name, menuItemID);

                    if(remoteCommanderCallback) {
                        remoteCommanderCallback({success: "Created menu Item in database and set state"});
                    }
                    this._interfaceState.set("log", "New Menu Item Added to Database");
                })).catch(lang.hitch(this,function(error) {
                    this._interfaceState.set("log", "ERROR adding menu to database" + error);
                }));








            },
            _end: function () {
                this.inherited(arguments);
            }
        });
    }
);


