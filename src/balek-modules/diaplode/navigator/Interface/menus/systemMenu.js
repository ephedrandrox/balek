define([ 	'dojo/_base/declare',
        "dojo/_base/lang",

        "dojo/dom-style",

        "balek-modules/diaplode/navigator/Interface/menus/systemMenuWidget",

        //Balek Interface Includes
        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable'

    ],
    function (declare, lang,
              domStyle,
              systemMenuWidget,
              //Balek Interface Includes
              _syncedCommanderInterface,
              _balekWorkspaceContainerContainable ) {

        return declare( "diaplodeNavigatorInterfaceSystemMenu",[_syncedCommanderInterface], {
            _syncedMap: null,
            _menuCompanion: null,
            _navigatorSystemMenusState: null,

            constructor: function (args) {


                declare.safeMixin(this, args);
                console.log("Initializing Diaplode Navigator Interface System Menu...");



                console.log("navigator" , this._componentKey);

                if(this._navigatorSystemMenusState === null)
                {
                    console.log("Menu Could not be initialized");
                }else {
                   // console.log("creating System Menu", this._syncedMap , this._menuCompanion);
                   // this._syncedMap.setStateWatcher(lang.hitch(this, this.syncedMapItemStateChange));
                }

            },
            loadWidget: function(){
                let systemMenuName = this._interfaceState.get("name");
                let systemMap = this._navigatorSystemMenusState.get(systemMenuName);

                this._systemMenuWidget = new systemMenuWidget({_systemMenu: systemMap, _navigatorWidget: this._navigatorWidget});

            },
            onInterfaceStateChange: function (name, oldState, newState) {
                console.log("navigator onInterfaceStateChange" , name, newState);
                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommands and link them

                this.inherited(arguments);

                if (name.toString() === "name") {
                    console.log("navigator" , "got name, getting syncedmap");
this.loadWidget();
                }



            },
            syncedMapItemStateChange: function(itemKey, oldState, newState)
            {
                //console.log("item", itemKey, oldState, newState);
            },
            loadItem: function(itemKey){
             //   console.log("Load item", itemKey);
                if(this._menuCompanion && this._menuCompanion.load)
                {
                    this._menuCompanion.load(itemKey).then().catch();
                }
            },
            getDomNode: function()
            {
                return this._systemMenuWidget.domNode;
            },
            moveTo: function(t, l){
                console.log("navigator moveTo" , t, l);
                console.log("navigator moveTo" , this._systemMenuWidget);

                if(this._systemMenuWidget && this._systemMenuWidget.domNode){
                    domStyle.set(this._systemMenuWidget.domNode, "top", t+"px");
                    domStyle.set(this._systemMenuWidget.domNode, "left", l+"px");
                }

            }

        });
    });