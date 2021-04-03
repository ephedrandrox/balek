define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/array',
'dojo/dom',
        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/on',
        "dojo/dom-attr",
        "dojo/dom-style",
        "dojo/dom-geometry",
        "dojo/window",
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
    function (declare, lang, arrayUtil, dom,
              domConstruct, win, on, domAttr, domStyle, domGeom, dojoWindow, dojoKeys,
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

            _moveTimeout: null,



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

            postCreate: function()
        {
            console.log("systemMenuWidget postCreate",this._systemMenu );

            this.refreshView();
            //


            //topic.publish("addToMainContentLayerAlwaysOnTop", this.domNode);
            //only do this then reset
            //
            // this.makeMovable();
        },
            onSystemMenuStateChange: function(name, oldState, newState){
                console.log("system Menu", name, oldState, newState);

                if(oldState === undefined && this._menuItemWidgets[name.toString()] === undefined)
                {
                    let newMenuItem =  menuItem({_itemKey: name.toString(), _userKey: newState._userKey, _menuCompanion: this._systemMenu._menuCompanion, _name: newState.name});

                    this._menuItemWidgets[name.toString()] = newMenuItem;

                    if(this.domNode)
                    {
                        this.refreshView();
                    }

                }else
                {
                    //check that menuItem needs updated probably here
                    //but each menuitem should be watching their element state
                }

                if( this._menuItemWidgets[name.toString()] !== undefined && newState.name){
                    this._menuItemWidgets[name.toString()].setName(newState.name);
                }
            },
            refreshView: function(){
                if(this._systemMenu && this._systemMenu._menuCompanion && this._systemMenu._menuCompanion.name)
                {
                    this._mainTitle.innerHTML = this._systemMenu._menuCompanion.name;
                    this._mainEmoji.innerHTML = this._systemMenu._menuCompanion.emoji;
                }else {
                    console.log( "SystemMenu error", this, this._systemMenu);
                }

                this._navigatorWidget.arrangeSystemMenus();

                let menuItemKeys =  Object.keys(this._menuItemWidgets);

                console.log("systemMenu",menuItemKeys );

                for(keyIndex in menuItemKeys){

                    let menuItemKey = menuItemKeys[keyIndex];
                    //console.log(menuItemKeys, menuItemKey);
                    domStyle.set(this._menuItemWidgets[menuItemKey].domNode);

                    domConstruct.place(this._menuItemWidgets[menuItemKey].domNode, this._menuItems);

                }
            },

            arrangeWidgets : function(widgets, anchorObject){
                let animations = new Array();

                let windowDimensions = dojoWindow.getBox();

                let anchorOffsets = domGeom.position(anchorObject);

                const animationSpeed = 300;
                const animationRate = 10;

                let anchorBottomOffset = 20 + anchorOffsets.h;

                let lastTop = 0;
                let lastLeft = 0;
                let newTop = 0;
                let widgetWidth = 0;
                let widgetHeight = 0;

                let padding = 10;
                let heightPadding = 40;

                let anchorPosition =  domGeom.position(anchorObject, true);
                let anchorWidthOffset = anchorPosition.w;
                let anchorHeightOffset = anchorPosition.h/2;

                let widthToWork = windowDimensions.w - anchorOffsets.x - anchorWidthOffset;
                let topToWork = windowDimensions.h - heightPadding - anchorOffsets.y-anchorHeightOffset;

                let direction = "SouthEast";


                let transformFunction = {
                    "NorthEast" : function(){

                        newTop = lastTop - padding - widgetHeight;

                        if(lastLeft === 0 )
                        {
                            lastLeft = + anchorWidthOffset;
                        }

                        if (-anchorOffsets.y + heightPadding >= newTop  )
                        {
                            newTop =   - padding - widgetHeight;
                            lastLeft+= widgetWidth + padding;
                        }
                        lastTop = newTop;

                    },
                    "NorthWest" : function(){

                        newTop = lastTop - padding - widgetHeight;

                        //If going West, we need to move a widgets width that way to start
                        if(lastLeft === 0 )
                        {
                            lastLeft = - widgetWidth;
                        }

                        if (-anchorOffsets.y + heightPadding >= newTop  )
                        {

                            newTop = 0 - padding - widgetHeight;
                            lastLeft -= widgetWidth + padding;

                        }
                        lastTop = newTop;

                    },
                    "SouthEast" : function(){
                        newTop = lastTop + padding;

                        if(lastLeft === 0 )
                        {
                            lastLeft = + anchorWidthOffset;
                        }

                        if (topToWork <= (newTop + widgetHeight + padding + anchorBottomOffset ))
                        {
                            newTop = padding;
                            lastLeft+=  widgetWidth + padding;
                        }
                        lastTop = newTop+widgetHeight;

                    },
                    "SouthWest" : function (){
                        newTop = lastTop + padding;

                        //If going West, we need to move a widgets width that way to start
                        if(lastLeft === 0 )
                        {
                            lastLeft = - widgetWidth;
                        }

                        //if we have reached the bottom, go to the top
                        if (topToWork <= (newTop + widgetHeight + padding + anchorBottomOffset ))
                        {
                            newTop = padding;
                            lastLeft= lastLeft-widgetWidth - padding;
                        }
                        lastTop = newTop+widgetHeight;
                    }
                }

                //propigate south
                if(topToWork >= (windowDimensions.h/2)) {
                    if (widthToWork >= (windowDimensions.w / 2)) {
                        direction = "SouthEast";
                    }else{
                        direction = "SouthWest"
                    }
                }
                else
                {

                    if(widthToWork >= (windowDimensions.w/2))
                    {
                        direction = "NorthEast";
                    }else{
                        direction = "NorthWest";
                    }
                }

                let addAnimation = function(domNode, top, left){
                    animations.push(dojo.fx.slideTo({
                        node: domNode,
                        top: top ,
                        left: left ,
                        unit: "px",
                        rate: animationRate,
                        duration: animationSpeed
                    }));
                }

                let directionTransform = transformFunction[direction.toString()];

                arrayUtil.forEach(widgets, function(widget, index){
                    let widgetPosition =  domGeom.position(widget.domNode, true);
                    widgetWidth = widgetPosition.w;
                    widgetHeight = widgetPosition.h;
                    directionTransform();
                    addAnimation(widget.domNode, newTop,  lastLeft + padding);

                });
                return dojo.fx.combine(animations);
            },


            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            _onClick: function(event){
                //this.setName("ThisMenuNameFROMCOMMAND");
               // this.setActive();

                console.log("systemMenu",event );

                let currentStateToggle = {"block": "none", "none": "block"};

                domStyle.set(this._menuItems, {"display": currentStateToggle[domStyle.get(this._menuItems, "display")]});


                if(this.domNode)
                {
                    this.arrangeWidgets(Object.values(this._menuItemWidgets), this.domNode).play();
                }

            },

            _onMove: function(MoveEvent)
            {
                clearTimeout(this._moveTimeout);
                this._moveTimeout = setTimeout(lang.hitch(this, function(){
                    if(this.domNode)
                    {
                        this.arrangeWidgets(Object.values(this._menuItemWidgets), this.domNode).play();
                    }
                }), 20);
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