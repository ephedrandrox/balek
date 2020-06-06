define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',

        'dojo/node!crypto',

        'balek-modules/Instance',
        'balek-modules/diaplode/navigator/Instance/radialMenu'

    ],
    function (declare, lang, topic, Stateful, crypto, baseInstance, radialMenu) {
        return declare("moduleDiaplodeNavigatorInstance", baseInstance, {
            _instanceKey: null,


            _menus: {},
            _menusState: null,
            _stateChangeInterfaceCallback: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._menus = {};

                let menusState = declare([Stateful], {
                    availableMenus: null
                });

                this._menusState = new menusState({
                    availableMenus: {},
                });

                this._stateChangeInterfaceCallback({menusState: JSON.stringify(this._menusState)});
                this._menusStateWatchHandle = this._menusState.watch(lang.hitch(this, this.onMenusStateChange));


                console.log("moduleDiaplodeNavigatorInstance starting...");
            },
            onMenusStateChange: function(name, oldState, newState){
               let menuStateObject = {[String(name)] : newState};
               this._stateChangeInterfaceCallback({menusState: JSON.stringify(menuStateObject)});
            },
            _end: function () {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    this._menusStateWatchHandle.unwatch();
                    this._menusStateWatchHandle.remove();
                    Resolve({success: "Unloaded Instance"});
                }));
            },
            changeNavigatorMenuName: function (name, menuKey){
                if(this._menus[menuKey])
                {debugger;
                    this._menus[menuKey].changeName(name);
                }
                debugger;
            },
            changeNavigatorMenuActiveStatus: function (status, menuKey){

                if(this._menus[menuKey])
                {debugger;
                    this._menus[menuKey].changeActiveStatus(status);
                }
                debugger;
            },
            createNewNavigatorMenu: function(name, stateChangeInterfaceCallback){
            let key = this.getUniqueMenuKey(); //get unique key
            this._menus[key] = new radialMenu({_menuName: name, _menuKey: key, _stateChangeInterfaceCallback: stateChangeInterfaceCallback});
            let originalMenus = this._menusState.get("availableMenus");
            originalMenus[key]={name: name, _menuKey: key};
            this._menusState.set("availableMenus", originalMenus);
        },
            createNewNavigatorMenuItem: function(menuKey, stateChangeInterfaceCallback){
              if(this._menus[menuKey])
              {
                  this._menus[menuKey].createMenuItem(stateChangeInterfaceCallback);
              }
              else
              {
                  console.log("invalid menu key");
              }

            },
            getUniqueMenuKey: function () {
                do {
                    var id = crypto.randomBytes(20).toString('hex');
                    if (typeof this._menus[id] == "undefined") return id;
                } while (true);

            }
        });
    }
);


