define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/node!crypto',


        'balek-modules/Instance',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',


        'balek-modules/diaplode/navigator/Instance/menuItem'
    ],
    function (declare, lang, topic, crypto, baseInstance, stateSynced, remoteCommander, menuItem) {
        return declare("moduleDiaplodeNavigatorRadialMenuInstance", [baseInstance, stateSynced, remoteCommander], {
            _instanceKey: null,
            _menuName: "Untitled Instance",
            _menuItems: {},
            _stateChangeInterfaceCallback: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._menuItems = {};
                this._commands={

                    "changeName" : lang.hitch(this, this.changeName),
                    "changeActiveStatus" : lang.hitch(this, this.changeActiveStatus),
                    "newMenuItem" : lang.hitch(this, this.newMenuItem),
                };



                this.prepareSyncedState();
                this.setInterfaceCommands();

                this._interfaceState.set("availableMenuItems", {});


                this._interfaceState.set("name",this._menuName);


                console.log("moduleDiaplodeRadialMenuInstance starting...");
            },
            _end: function () {
                this.inherited(arguments);
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
            newMenuItem: function(name , remoteCommandCallback){
                console.log("creating new menu Item");
                let newMenuItem = new menuItem({_instanceKey: this._instanceKey, _menuItemName: name});
                this._menuItems[newMenuItem._componentKey] =  newMenuItem;
                let keyarray = Object.keys(this._menuItems);
                debugger;
                this._interfaceState.set("availableMenuItems", keyarray);

                remoteCommandCallback({success: "New Menu Item Created"});


            }
        });
    }
);


