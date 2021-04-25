//Navigator Interface Custom Menu Class
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/dom-construct',
        "dojo/dom-class",
        "dojo/dom-style",
        //Balek Interface Includes
        'balek-modules/components/syncedCommander/Interface',
        'balek-modules/components/syncedMap/Interface',
        //Diaplode ui components
        "balek-modules/diaplode/ui/input/getUserInput",
        //Diaplode Navigator Custom Menu Include
        "balek-modules/diaplode/navigator/Interface/menus/customMenu/customMenu"
    ],
    function (declare,
              lang,
              domConstruct,
              domClass,
              domStyle,
              //Balek Interface Includes
              _syncedCommanderInterface,
              syncedMapInterface,
              //Diaplode UI Include
              getUserInput,
              //Diaplode Navigator Custom Menu Include
              customMenu) {

        return declare("diaplodeNavigatorInterfaceCustomMenu", [_syncedCommanderInterface ], {

            baseClass: "diaplodeNavigatorInterfaceCustomMenu",

            _menuMaps: null,

            _customMenus: null,

            _availableMenus: null,
            _menuInterfaces: null,
            _availableMenusWatchHandle: null,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._customMenus = {};
                console.log("Initializing Diaplode Navigator Interface Custom Menu...");

                this._menuMaps = {};
                this._menuInterfaces = {};

            },

            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            onInterfaceStateChange: function (name, oldState, newState) {
                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommands and link them
                this.inherited(arguments);



                if (name.toString() === "availableMenusComponentKey" && this._availableMenus === null) {

                    this._availableMenus = new syncedMapInterface({
                        _instanceKey: this._instanceKey,
                        _componentKey: newState.toString()
                    });

                    this._availableMenusWatchHandle = this._availableMenus.setStateWatcher(lang.hitch(this, this.onAvailableMenusStateChange));

                }
            },
            getMenuCompanion: function(syncedMapComponentKey){
                            let componentKey = syncedMapComponentKey.toString();
                            let menuMap = this._menuMaps[syncedMapComponentKey];
                console.log("XXAA", "FFVV", "getMenuCompanion",this, menuMap, componentKey, syncedMapComponentKey,lang.clone(this._menuMaps), this._menuMaps[syncedMapComponentKey] );

                return  this._menuMaps[componentKey];
            },
            onAvailableMenusStateChange: function(name, oldState, newState){
              //  console.log("XXAA", "onAvailableMenusStateChange", name, oldState, newState);

                if( !this._menuInterfaces[name.toString()]){
                    console.log("XXAA", "onAvailableMenusStateChange", name);

                    let newMenuInterface = new customMenu({_componentKey: name.toString(),
                        _menuInterfaceState: this._interfaceState,
                        _navigatorInterface: this._navigatorInterface,
                        _elementsMenu: this,
                        _sessionKey: this._sessionKey,
                        _instanceKey: this._instanceKey });
                    this._menuInterfaces[name.toString()] = newMenuInterface;
                    console.log("XXAA", "onAvailableMenusStateChange", newMenuInterface);



                }else {
                    console.log("XXAA", "onAvailableMenusStateChange", this._menuInterfaces);
                }
            },
            _onClick: function(){
                console.log("navigator", "on workspaces main widget click");

            },


            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################
            refreshView: function(){
                console.log("QQAA", "refreshView", this._navigatorInterface.isVisible());

                for( const menuInterfaceKey in this._menuInterfaces ) {
                    let menuInterface = this._menuInterfaces[menuInterfaceKey];

                        menuInterface.refreshView();

                }
            },

            //##########################################################################################################
            //Custom Menu Functions Section
            //##########################################################################################################

            //##########################################################################################################
            //Workspace Container Functions Section
            //##########################################################################################################

            toggleShowView: function(){
              //  let currentStateToggle = {"inline-block": "none", "none": "inline-block"};
              //  domStyle.set(this.domNode, {"display": currentStateToggle[domStyle.get(this.domNode, "display")]});
                //todo hide/show all elements menus

                },

            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################

            unload: function () {
                console.log("Destroying menu");
                this.inherited(arguments);
                this.destroy();
            }

        });
    });