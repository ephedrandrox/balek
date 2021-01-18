define(['dojo/_base/declare',
        'dojo/_base/lang',

        'balek-modules/Interface',

        'dojo/topic',
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/_base/window",

        'dojo/Stateful',


        'balek-modules/diaplode/navigator/interfaceCommands',

        'balek-modules/diaplode/navigator/Interface/navigator',
        'balek-modules/diaplode/navigator/Interface/menus/systemMenu',


    ],
    function (declare,
              lang,
              baseInterface,
              topic,
              domConstruct,
              domStyle,
              win,
              Stateful,
              navigatorInterfaceCommands,
              navigatorMainWidget,
              navigatorSystemMenu) {

        return declare("moduleDiaplodeNavigatorModuleInterface", baseInterface, {
            _instanceKey: null,
            _navigatorMainWidget: null,

            _navigatorSystemMenusState: null, //make this stateful

            constructor: function (args) {
                declare.safeMixin(this, args);
                this._navigatorSystemMenusState = {}; //make state that is watchable

                let navigatorSystemMenusState = declare([Stateful], {
                });

                this._navigatorSystemMenusState = new navigatorSystemMenusState({

                });

               // this._navigatorSystemMenusStateWatchHandle = this._navigatorSystemMenus.watch( lang.hitch(this, this.onNavigatorSystemMenusStateChange));


                this._commandsForOtherInterfaces = new navigatorInterfaceCommands();
                this._commandsForOtherInterfaces.setCommand("addSystemMenuList", lang.hitch(this, this.addSystemMenuList))
                this._commandsForOtherInterfaces.setNavigatorReady();

                this.sendInstanceCallbackMessage({
                    request: "Navigator Component Key",
                }, lang.hitch(this, function (requestResults) {
                    console.log("got command return results");

                    this._navigatorMainWidget = new navigatorMainWidget({
                        _instanceKey: this._instanceKey,
                        _componentKey: requestResults.componentKey,
                        _navigatorSystemMenusState: this._navigatorSystemMenusState
                    });


                }));
            },
            addSystemMenuList:function( syncedMap, menuCompanion){

               // lang.hitch(this, this.availableTaskStateChange);


                if(menuCompanion.name && this._navigatorSystemMenusState.get(menuCompanion.name.toString()) === undefined)
                {
                    this._navigatorSystemMenusState.set(menuCompanion.name.toString(),navigatorSystemMenu({_syncedMap: syncedMap, _menuCompanion: menuCompanion}) ) ;
                }

                //todo create object that stores synced Maps with their state watchers
                //syncedMap.setStateWatcher(lang.hitch(objectManager, objectManager.availableTaskStateChange));

            },
            receiveMessage: function (moduleMessage) {
                console.log("You shouldn't be seeing this", moduleMessage);
            },
            toggleShowView: function () {
                let currentStateToggle = {"block": "none", "none": "block"};
               // console.log(domStyle.get(this._navigatorMainWidget.domNode, "display"));
                domStyle.set(this._navigatorMainWidget.domNode, {"display": currentStateToggle[domStyle.get(this._navigatorMainWidget.domNode, "display")]});
            },
            unload: function () {
             //   this._navigatorSystemMenusStateWatchHandle.unwatch();
             //   this._navigatorSystemMenusStateWatchHandle.remove();


                this._navigatorMainWidget.unload();
            }
        });
    }
);



