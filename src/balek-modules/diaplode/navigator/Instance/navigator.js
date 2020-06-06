define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'dojo/node!crypto',

        'balek-modules/Instance',
        'balek-modules/base/state/synced',

        'balek-modules/diaplode/navigator/Instance/radialMenu'

    ],
    function (declare, lang, topic, crypto, baseInstance, stateSynced, radialMenu) {
        return declare("moduleDiaplodeNavigatorInstance", [baseInstance,stateSynced], {
            _instanceKey: null,


            _menus: {},

            _stateChangeInterfaceCallback: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._menus = {};




                this._interfaceState.set("availableMenus", {});
                this._interfaceState.set("activeFocus", true);

                this._stateChangeInterfaceCallback({menusState: JSON.stringify(this._interfaceState)});


                console.log("moduleDiaplodeNavigatorInstance starting...");
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
            let originalMenus = this._interfaceState.get("availableMenus");
            originalMenus[key]={name: name, menuKey: key};
            this._interfaceState.set("availableMenus", originalMenus);
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

            },
            _end: function(){
                return this.inherited(arguments);

            }
        });
    }
);


