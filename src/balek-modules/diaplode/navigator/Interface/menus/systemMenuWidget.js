define(['dojo/_base/declare',
        'dojo/_base/lang',

'dojo/dom',
        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/on',
        "dojo/dom-attr",
        "dojo/dom-style",
        "dojo/keys",
        "dijit/focus",
        "dojo/ready",
        'dojo/_base/fx',

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/diaplode/navigator/Interface/menus/resources/html/systemMenuWidget.html',
        'dojo/text!balek-modules/diaplode/navigator/Interface/menus/resources/css/systemMenuWidget.css',

        'balek-modules/Interface',





        "balek-modules/diaplode/navigator/Interface/menus/menuItem",

        "balek-modules/diaplode/ui/input/getUserInput"


    ],
    function (declare, lang, dom,
              domConstruct, win, on, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx,  _WidgetBase, _TemplatedMixin, template,
              mainCss, baseInterface,
              menuItem, getUserInput) {

        return declare("moduleDiaplodeNavigatorInterfaceSystemMenuWidget", [_WidgetBase, _TemplatedMixin, baseInterface], {

            templateString: template,
            baseClass: "diaplodeNavigatorInterfaceSystemMenuWidget",




            _mainCssString: mainCss,

            _menuItemWidgets: {},

            _newMenuItems: [],
            _availableMenuItems: {},




            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                declare.safeMixin(this, args);
                this._newMenuItems =[];
                this._availableMenuItems = {};
                this._menuItemWidgets = {};
                console.log("systemMenuWidget");
                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());

//this is bad
                console.log("systemMenuState", "state", this._systemMenu);

                if(this._systemMenu && this._systemMenu._syncedMap && this._systemMenu._syncedMap.setStateWatcher)
                {
                console.log("systemMenuState", "state", this._systemMenu._syncedMap);
                    this._systemMenu._syncedMap.setStateWatcher(lang.hitch(this, this.onSystemMenuStateChange));
                }


            },
            onSystemMenuStateChange: function(name, oldState, newState){
                console.log("system Menu", name, oldState, newState);

                if(oldState === undefined && this._menuItemWidgets[name.toString()] === undefined)
                {
                    let newMenuItem =  menuItem({_itemKey: name.toString(), _userKey: newState._userKey, _menuCompanion: this._systemMenu._menuCompanion, _name: newState.name});

                    this._menuItemWidgets[name.toString()] = newMenuItem;



                }else
                {
                    //check that menuItem needs updated probably here
                }
            },
            postCreate: function()
            {
                console.log("systemMenuWidget postCreate",this._systemMenu );

                if(this._systemMenu && this._systemMenu._menuCompanion && this._systemMenu._menuCompanion.name)
                {
                    this._mainTitle.innerHTML = this._systemMenu._menuCompanion.name;
                }

                this._navigatorWidget.arrangeSystemMenus();


               //


                //topic.publish("addToMainContentLayerAlwaysOnTop", this.domNode);
                //only do this then reset
                //
               // this.makeMovable();
            },


            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            _onClick: function(event){
                //this.setName("ThisMenuNameFROMCOMMAND");
               // this.setActive();

                console.log("systemMenu",event );


                let menuItemKeys =  Object.keys(this._menuItemWidgets);

                console.log("systemMenu",menuItemKeys );

                for(keyIndex in menuItemKeys){

                    let menuItemKey = menuItemKeys[keyIndex];
                    //console.log(menuItemKeys, menuItemKey);

                    domConstruct.place(this._menuItemWidgets[menuItemKey].domNode, this.domNode);

                }

            },

            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################


            //##########################################################################################################
            //Menu Item Functions Section
            //##########################################################################################################

            showMenuItems: function (){

                console.log("showing subs");
                for(const menuItem in this._availableMenuItems)
                {
                    //console.log("showing subs");

                    this._availableMenuItems[menuItem].introAnimation();
                }

            },
            hideMenuItems: function(){
                for(const menuItem in this._availableMenuItems)
                {
                    this._availableMenuItems[menuItem].outroAnimation();
                }
            },

            arrangeMenuItems: function () {
                let placementArray = [
                    {x:500,y:100},{x:660,y:300},{x:660,y:700},
                    {x:500,y:900},{x:340,y:700},{x:340,y:300},
                    {x:42,y:20},{x:58,y:20},{x:66,y:50},
                    {x:58,y:80},{x:42,y:80},{x:33,y:50}  ];
                let count = 0;
                for (const menuToArrange in this._availableMenuItems) {
                    this._availableMenuItems[menuToArrange].moveTo(placementArray[count].x, placementArray[count].y);
                    count++;
                }
            },
            updateAvailableMenuItems: function () {
                let availableMenuItemsState = this._interfaceState.get("availableMenuItems");

                for (const newMenuItemWidgetKey in this._newMenuItems) {
                    let newMenuItemWidget = this._newMenuItems[newMenuItemWidgetKey];
                    let newWidgetKey = newMenuItemWidget.getComponentKey();
                    if (availableMenuItemsState[newWidgetKey]) {
                        this._newMenuItems.splice(index, 1);
                        this._availableMenuItems[newWidgetKey] = newMenuItemWidget;
                    }
                }


                for (const index in availableMenuItemsState ) {
                    let availableMenuItemComponentKey = availableMenuItemsState[index];
                    if (!this._availableMenuItems[availableMenuItemComponentKey]) {
                        //this is when we should make a new menu and update the addmenu function
                        this._availableMenuItems[availableMenuItemComponentKey] = this.addMenuItem(availableMenuItemComponentKey);
                    }
                }
            },
            addMenuItem: function(menuItemComponentKey){
                if (!menuItemComponentKey) {
                    this._newMenus.push(newMenu);
                } else {
                    let newMenuItem = new menuItem({_instanceKey: this._instanceKey, _componentKey: menuItemComponentKey});


                    return newMenuItem;
                }
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