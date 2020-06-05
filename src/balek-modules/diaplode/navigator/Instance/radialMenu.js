define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',

        'balek-modules/Instance',
    ],
    function (declare, lang, topic, Stateful, baseInstance) {
        return declare("moduleDiaplodeNavigatorRadialMenuInstance", baseInstance, {
            _instanceKey: null,
            _menuName: "Untitled",
            _menuState: null,
            _stateChangeInterfaceCallback: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                let menuState = declare([Stateful], {
                    name: null,
                    menuItems: null,
                });

                this._menuState = new menuState({
                    name: this._menuName,
                    menuItems: new Array(),
                });

                this._stateChangeInterfaceCallback({instanceState: JSON.stringify(this._menuState)});
                this._menuStateWatchHandle = this._menuState.watch(lang.hitch(this, this.onMenuStateChange));


                this._menuState.set("name", "New Name");
                console.log("moduleDiaplodeRadialMenuInstance starting...");
            },
            onMenuStateChange: function(){
                this._stateChangeInterfaceCallback({instanceState: JSON.stringify(this._menuState)});
            },
            _end: function () {
                //overwrite this and reject to keep module instance from being unloaded
                //Until all resources can be released.
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    this._menuStateWatchHandle.unwatch();
                    this._menuStateWatchHandle.remove();
                    Resolve({success: "Unloaded Instance"});
                }));
            },
            createNewMenuItem: function(name){
                let originalMenuItems = this._menuState.get("menuItems");
                originalMenuItems.push({name: name});
                this._menuState.set("menuItems", originalMenuItems);
            }
        });
    }
);


