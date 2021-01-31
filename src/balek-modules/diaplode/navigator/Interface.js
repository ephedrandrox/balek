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


//Balek Interface Extensions
        'balek-modules/components/syncedCommander/Interface'

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
              navigatorSystemMenu,
              _syncedCommanderInterface) {

        return declare("moduleDiaplodeNavigatorModuleInterface", _syncedCommanderInterface, {
            _instanceKey: null,
            _navigatorMainWidget: null,


            _navigatorSystemMenusState: null,


            _isVisible: true,


            constructor: function (args) {
                declare.safeMixin(this, args);
                this._navigatorSystemMenusState = {}; //make state that is watchable

                let navigatorSystemMenusState = declare([Stateful], {
                });

                this._navigatorSystemMenusState = new navigatorSystemMenusState({

                });


                // this._navigatorSystemMenusStateWatchHandle = this._navigatorSystemMenus.watch( lang.hitch(this, this.onNavigatorSystemMenusStateChange));
              //  console.log("navigator", this);

                this._commandsForOtherInterfaces = new navigatorInterfaceCommands();
                this._commandsForOtherInterfaces.setCommand("addSystemMenuList", lang.hitch(this, this.addSystemMenuList));
                this._commandsForOtherInterfaces.setCommand("toggleShowView", lang.hitch(this, this.toggleShowView))
                this._commandsForOtherInterfaces.setNavigatorReady();


            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to be here so remoteCommander works
                this.inherited(arguments);
                console.log("navigator", name, oldState, newState);
                if (name === "navigatorInstanceKeys") {
                    if(this._navigatorMainWidget === null)
                    {
                        this._navigatorMainWidget = new navigatorMainWidget({
                            _instanceKey: this._instanceKey,
                            _componentKey: newState.componentKey,
                            _navigatorSystemMenusState: this._navigatorSystemMenusState
                        });
                    }

                }

                if(name === "isVisible"){
                    console.log(oldState, newState);
                    this._isVisible = newState;
                    this.refreshView();
                }

            },
            addSystemMenuList:function( syncedMap, menuCompanion){
                //This function is
               // lang.hitch(this, this.availableTaskStateChange);


                if(menuCompanion.name && this._navigatorSystemMenusState.get(menuCompanion.name.toString()) === undefined)
                {
                    this._navigatorSystemMenusState.set(menuCompanion.name.toString(),navigatorSystemMenu({_instanceKey: this._instanceKey, _syncedMap: syncedMap, _menuCompanion: menuCompanion}) ) ;
                }

                //todo create object that stores synced Maps with their state watchers
                //syncedMap.setStateWatcher(lang.hitch(objectManager, objectManager.availableTaskStateChange));

            },
            receiveMessage: function (moduleMessage) {
                console.log("You shouldn't be seeing this", moduleMessage);
            },
            refreshView: function(){
                if(this._isVisible)
                {
                    this._navigatorMainWidget.show();

                }else
                {
                    this._navigatorMainWidget.hide();
                }
            },
            toggleShowView: function () {
                let isVisible = this._isVisible;
                this._isVisible = !isVisible;

                this.refreshView();

                this._instanceCommands.setVisibility(this._isVisible);
            },
            unload: function () {
             //   this._navigatorSystemMenusStateWatchHandle.unwatch();
             //   this._navigatorSystemMenusStateWatchHandle.remove();


                this._navigatorMainWidget.unload();
            }
        });
    }
);



