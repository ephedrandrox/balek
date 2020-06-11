define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
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

        'dojo/text!balek-modules/diaplode/navigator/resources/html/radialMenu.html',
        'dojo/text!balek-modules/diaplode/navigator/resources/css/radialMenu.css',

        'balek-modules/Interface',
        'balek-modules/base/state/synced',
        'balek-modules/base/command/remote',



        "balek-modules/diaplode/navigator/Interface/menuItem"

    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx,  _WidgetBase, _TemplatedMixin, template,
              mainCss, baseInterface, stateSynced, remoteCommander, menuItem) {

        return declare("moduleDiaplodeNavigatorInterfaceRadialMenu", [_WidgetBase, _TemplatedMixin, baseInterface, stateSynced, remoteCommander], {
            _instanceKey: null,
            templateString: template,
            baseClass: "diaplodeNavigatorInterfaceRadialMenu",

            _activeStatus: false,
            _menuName: null,

            _xRelativePosition: 0,
            _yRelativePosition: 0,

            _mainCssString: mainCss,

            _menuItems: {},
            _newMenuItems: [],
            _availableMenuItems: [],

            _shiftDown: false,
            _switchingLayers: false,


            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                declare.safeMixin(this, args);
                this._newMenuItems =[];
                this._availableMenuItems = {};
                this._menuItems = {};

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                dojoReady(lang.hitch(this, function () {
                    if(  this._componentKey )
                    {
                        this.askToConnectInterface();
                    }
                }));
            },
            postCreate: function()
            {
                    topic.publish("addToMainContentLayerAlwaysOnTop", this.domNode);
            },

            //##########################################################################################################
            //State Functions Section
            //##########################################################################################################

            setActive: function(activeOrNot){
            this._instanceCommands.changeActiveStatus(activeOrNot);
            },
            setName: function(name)
            {
                this._instanceCommands.changeName(name);
            },
            onInterfaceStateChange:function(name, oldState, newState){

                if (name === "interfaceRemoteCommands") {
                    //Since We are extending with the remoteCommander
                    //We Check for interfaceRemoteCommands and link them
                    this.linkRemoteCommands(newState);
                    this._instanceCommands.changeName("ThisMenuName").then(function (results) {
                        console.log(results);
                    });
                    //ready to show widget;
                    this.introAnimation();

                }
                else if (name === "interfaceRemoteCommandKey") {
                    //Since We are extending with the remoteCommander
                    //We Check for interfaceRemoteCommandKey
                    console.log("Remote COmmander Key!");
                    this._interfaceRemoteCommanderKey = newState;

                }
                else if(name === "activeStatus"){
                    this._activeStatus = newState;
                    if(newState === true && newState !== oldState)
                    {
                        this._switchingLayers = true;
                        topic.publish("addToMainContentLayerAlwaysOnTop", this.domNode, lang.hitch(this, function(){
                            domStyle.set(this.domNode, "filter", "invert()");
                            dijitFocus.focus(this.domNode);
                            this._switchingLayers = false;
                            this.focusAnimation();

                        }));
                    }else if(newState === false && newState !== oldState)
                    {
                        topic.publish("addToMainContentLayerAlwaysOnTop", this.domNode);
                        domStyle.set(this.domNode, "filter", "none");
                        this.blurAnimation();
                    }
                }
                else if (name === "availableMenuItems") {
                    this.updateAvailableMenuItems();
                    this.arrangeMenuItems();
                }
                else {
                    console.log("state unaccounted for....", name, newState);
                }

            },

            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            _onClick: function(){
                this.setName("ThisMenuNameFROMCOMMAND");
                this.setActive();
            },
            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();
                        if (this._shiftDown) {

                        }else
                        {
                            this._instanceCommands.newMenuItem("NewMenuItemName");
                        }
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        if (this._shiftDown) {
                        }else
                        {
                            this.setActive(false);
                        }
                        break;
                    case dojoKeys.SHIFT:
                        this._shiftDown = false;
                        break;
                }
            },
            _onKeyDown: function (keyDownEvent) {
                switch (keyDownEvent.keyCode) {
                    case dojoKeys.SHIFT:
                        this._shiftDown = true;
                        break;
                    case dojoKeys.ESCAPE:
                        keyDownEvent.preventDefault();
                        break;
                }
            },
            _onFocus: function () {
                console.log("focus");
                if(!this._switchingLayers )
                {
                    this.setActive(true);

                }
            },
            _onBlur: function(){

                console.log("unfocus");

                if(!this._switchingLayers )
                {
                    this.setActive(false);
                }
            },

            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################

            moveTo: function(x,y){
                //make this part of a Movable class that inherits
                this._xRelativePosition = x;
                this._yRelativePosition = y;


                domStyle.set(this.domNode, "top", y+"%");
                domStyle.set(this.domNode, "left", x+"%");
            },
            introAnimation: function(){
                fx.animateProperty({
                    node:this.domNode,
                    duration:1200,

                    properties: {
                        opacity: {end: 1},

                    }
                }).play();
            },
            blurAnimation: function(){
                fx.animateProperty({
                    node:this.domNode,
                    duration:900,

                    properties: {
                        transform: { end: 'translate(-50%, -50%)rotate(0deg)', start:'translate(-50%, -50%)rotate(-300deg)'},
                        top:{end: this._yRelativePosition, start: 50, units: "%"},
                        left:{end: this._xRelativePosition, start: 50, units: "%"}
                    }
                }).play();
            },
            focusAnimation: function(){
                fx.animateProperty({
                    node:this.domNode,
                    duration:400,

                    properties: {
                        transform: { end: 'translate(-50%, -50%)rotate(0deg)', start:'translate(-50%, -50%)rotate(-300deg)'},
                        top:{start: this._yRelativePosition, end: 50, units: "%"},
                        left:{start: this._xRelativePosition, end: 50, units: "%"}
                    }
                }).play();

                fx.animateProperty({
                    node:this._mainImage,
                    duration:200,
                    properties: {
                        transform: { end: 'rotate(0deg)', start:'rotate(-100deg)'},
                        opacity: {start: 0, end: 1}
                    }
                }).play();
            },

            //##########################################################################################################
            //Menu Item Functions Section
            //##########################################################################################################

            arrangeMenuItems: function () {
                let placementArray = [
                    {x:50,y:10},{x:66,y:30},{x:66,y:70},
                    {x:50,y:90},{x:34,y:70},{x:34,y:30},
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
                for (const [index, newMenuItemWidget] of  this._newMenuItems.entries()) {
                    let newWidgetKey = newMenuItemWidget.getComponentKey();
                    if (availableMenuItemsState[newWidgetKey]) {
                        this._newMenuItems.splice(index, 1);
                        this._availableMenuItems[newWidgetKey] = newMenuItemWidget;
                    }
                }
                for (const availableMenuItemComponentKey in availableMenuItemsState) {

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