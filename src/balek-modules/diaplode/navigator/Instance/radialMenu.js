define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
        'dojo/node!crypto',


        'balek-modules/Instance',
    'balek-modules/diaplode/navigator/Instance/menuItem'
    ],
    function (declare, lang, topic, Stateful, crypto, baseInstance, menuItem) {
        return declare("moduleDiaplodeNavigatorRadialMenuInstance", baseInstance, {
            _instanceKey: null,
            _menuKey: null,
            _menuName: "Untitled Instance",
            _menuState: null,
            _menuItems: {},
            _stateChangeInterfaceCallback: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._menuItems = {};
                let menuState = declare([Stateful], {
                    name: null,
                    key: null,
                    activeStatus: false,
                    menuItems: null,
                });

                this._menuState = new menuState({
                    name: this._menuName,
                    key: this._menuKey,
                    menuItems: new Array(),
                });

                this._stateChangeInterfaceCallback({menuState: JSON.stringify(this._menuState)});
                this._menuStateWatchHandle = this._menuState.watch(lang.hitch(this, this.onMenuStateChange));


                console.log("moduleDiaplodeRadialMenuInstance starting...");
            },
            onMenuStateChange: function(name, oldState, newState){

                if(name === "name")
                {
                    this._menuName = newState;
                }
                let menuStateObject = {[String(name)] : newState};
                this._stateChangeInterfaceCallback({menuState: JSON.stringify(menuStateObject)});
            },
            _end: function () {
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    this._menuStateWatchHandle.unwatch();
                    this._menuStateWatchHandle.remove();
                    Resolve({success: "Unloaded Instance"});
                }));
            },
            changeName: function(name)
            {
                this._menuState.set("name", name);
            },
            changeActiveStatus: function(status){
                debugger;
                this._menuState.set("activeStatus", status);
            },
            createMenuItem: function(stateChangeInterfaceCallback){
                console.log("creating new menu Item")
                let key = this.getUniqueMenuItemKey(); //get unique key
                this._menuItems[key] =  new menuItem({_menuKey: this._menuKey, _menuItemKey: key, _stateChangeInterfaceCallback: stateChangeInterfaceCallback});

               // this._menuState.set("menuItems", originalMenuItems);
            },
            getUniqueMenuItemKey: function () {
                do {
                    var id = crypto.randomBytes(20).toString('hex');
                    if (typeof this._menuItems[id] == "undefined") return id;
                } while (true);

            }
        });
    }
);


