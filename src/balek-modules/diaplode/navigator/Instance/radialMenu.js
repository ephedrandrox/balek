define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',

        'balek-modules/Instance',
    ],
    function (declare, lang, topic, Stateful, baseInstance) {
        return declare("moduleDiaplodeNavigatorRadialMenuInstance", baseInstance, {
            _instanceKey: null,
            _menuKey: null,
            _menuName: "Untitled Instance",
            _menuState: null,
            _stateChangeInterfaceCallback: null,

            constructor: function (args) {
                declare.safeMixin(this, args);


                let menuState = declare([Stateful], {
                    name: null,
                    key: null,
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
            createNewMenuItem: function(name){
                let originalMenuItems = this._menuState.get("menuItems");
                originalMenuItems.push({name: name});
                this._menuState.set("menuItems", originalMenuItems);
            }
        });
    }
);


