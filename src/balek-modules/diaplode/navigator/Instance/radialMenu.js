define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/node!crypto',


        'balek-modules/Instance',
        'balek-modules/base/state/synced',

    'balek-modules/diaplode/navigator/Instance/menuItem'
    ],
    function (declare, lang, topic, crypto, baseInstance, stateSynced, menuItem) {
        return declare("moduleDiaplodeNavigatorRadialMenuInstance", [baseInstance, stateSynced], {
            _instanceKey: null,
            _menuKey: null,
            _menuName: "Untitled Instance",
            _menuItems: {},
            _stateChangeInterfaceCallback: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._menuItems = {};

                this._interfaceState.set("name",this._menuName);
                this._interfaceState.set("menuKey", this._menuKey);

                console.log("moduleDiaplodeRadialMenuInstance starting...");
            },
            onInterfaceStateChange: function(name, oldState, newState){

                if(name === "name")
                {
                    this._menuName = newState;
                }
                let interfaceStateObject = {[String(name)] : newState};
                this._stateChangeInterfaceCallback({interfaceState: JSON.stringify(interfaceStateObject)});
            },
            _end: function () {
                this.inherited(arguments);
            },
            changeName: function(name)
            {
                this._interfaceState.set("name", name);
            },
            changeActiveStatus: function(status){
                debugger;
                this._interfaceState.set("activeStatus", status);
            },
            createMenuItem: function(stateChangeInterfaceCallback){
                console.log("creating new menu Item")
                let key = this.getUniqueMenuItemKey(); //get unique key
                this._menuItems[key] =  new menuItem({_menuKey: this._menuKey, _menuItemKey: key, _stateChangeInterfaceCallback: stateChangeInterfaceCallback});

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


