define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
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

        "balek-modules/diaplode/navigator/Interface/menuItem"

    ],
    function (declare, lang, topic, Stateful, domClass, domConstruct, win, on, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx,  _WidgetBase, _TemplatedMixin, template,
              mainCss, baseInterface, menuItem) {

        return declare("moduleDiaplodeNavigatorInterfaceRadialMenu", [_WidgetBase, _TemplatedMixin, baseInterface], {
            _instanceKey: null,
            templateString: template,
            baseClass: "diaplodeNavigatorInterfaceRadialMenu",

            _activeStatus: false,
            _menuName: " ",
            _menuKey: null,
            _menuState: null,

            _xRelativePosition: 0,
            _yRelativePosition: 0,

            _mainCssString: mainCss,
            _menuItems: {},
            _newMenuItems: [],

            _shiftDown: false,

            _switchingLayers: false,


            constructor: function (args) {

                declare.safeMixin(this, args);


                this._newMenuItems = new Array();

                this._menuItems = {};

                let menuState = declare([Stateful], {
                    menuName: null,
                    menuItems: null,
                    activeStatus: false
                });

                this._menuState = new menuState({
                    menuName: this._menuName,
                    menuItems: new Array(),
                    activeStatus: this._activeStatus
                });

                this._menuStateWatchHandle = this._menuState.watch(lang.hitch(this, this.menuStateChange));

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());

                dojoReady(lang.hitch(this, function () {

                    this.requestNewMenu(this._menuName);

                }));
            },
            menuStateChange:function(name, oldState, newState){

                    if(name === "menuName"){
                        this._mainTitle.innerHTML = newState;
                    }

                if(name === "key"){
                    this._menuKey = newState;
                    this.introAnimation();
                }
                if(name === "activeStatus"){
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
                    topic.publish("addToMainContentLayerFirstBelowTop", this.domNode);
                    domStyle.set(this.domNode, "filter", "none");
                    this.blurAnimation();

                }
            }
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
                    duration:900,

                    properties: {
                        transform: { end: 'translate(-50%, -50%)rotate(0deg)', start:'translate(-50%, -50%)rotate(-300deg)'},
                        top:{start: this._yRelativePosition, end: 50, units: "%"},
                        left:{start: this._xRelativePosition, end: 50, units: "%"}
                    }
                }).play();

                fx.animateProperty({
                    node:this._mainImage,
                    duration:300,
                    properties: {
                        transform: { end: 'rotate(0deg)', start:'rotate(-100deg)'},
                        opacity: {start: 0, end: 1}
                    }
                }).play();
            },
            requestNewMenu(name){
                console.log("requesting New Menu");

                this.sendInstanceCallbackMessage({
                    request: "New Navigator Menu",
                    name: name
                }, lang.hitch(this, this._InstanceStateChangeCallback));
            },
            getMenuKey: function(){
                return this._menuState.get("key");
            },
            _InstanceStateChangeCallback: function(stateChangeUpdate){
                console.log(stateChangeUpdate);
                if(stateChangeUpdate.menuState)
                {
                    let menuState = JSON.parse(stateChangeUpdate.menuState);
                    if(menuState.name){
                        this._menuState.set("menuName", menuState.name);
                    }
                    if(menuState.key){
                        this._menuState.set("key", menuState.key);
                    }
                    if(menuState.activeStatus !== undefined){
                        this._menuState.set("activeStatus", menuState.activeStatus);
                    }
                }
            },
            postCreate: function () {
                topic.publish("addToMainContentLayerFirstBelowTop", this.domNode);


            },
            _onFocus: function () {
                console.log("focus");
            },
            _onBlur: function(){

                console.log("unfocus");

                if(!this._switchingLayers )
                {
                    this.sendInstanceMessage({
                        request: "Change Navigator Menu Name",
                        name: "Not Active",
                        menuKey: this._menuKey,
                    });
                    this.sendInstanceMessage({
                        request: "Change Navigator Menu Active Status",
                        status: false,
                        menuKey: this._menuKey,
                    });
                }
            },
            _onClick: function(){

                this.sendInstanceMessage({
                    request: "Change Navigator Menu Name",
                    name: "Active",
                    menuKey: this._menuKey,
                });
                this.sendInstanceMessage({
                    request: "Change Navigator Menu Active Status",
                    status: true,
                    menuKey: this._menuKey,
                });



            },_onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();
                        if (this._shiftDown) {

                        }else
                        {
                            this.addMenuItem();
                        }
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        if (this._shiftDown) {
                        }else
                        {
                            this.sendInstanceMessage({
                                request: "Change Navigator Menu Name",
                                name: "Not Active",
                                menuKey: this._menuKey,
                            });
                            this.sendInstanceMessage({
                                request: "Change Navigator Menu Active Status",
                                status: false,
                                menuKey: this._menuKey,
                            });
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
            unload: function () {

                this._menuStateWatchHandle.unwatch();
                this._menuStateWatchHandle.remove();

                this.destroy();
            },
            moveTo: function(x,y){
                //make this part of a Movable class that inherits
                this._xRelativePosition = x;
                this._yRelativePosition = y;


                domStyle.set(this.domNode, "top", y+"%");
                domStyle.set(this.domNode, "left", x+"%");
            }
            ,
            addMenuItem: function(){
                let newMenuItem = menuItem({_instanceKey: this._instanceKey, _menuKey: this._menuKey});


                //add widget to newMenu array that will be searched when available menu state is changed
                this._newMenuItems.push(newMenuItem);
               // this._menuItems.push(newMenuItem);
            }
        });
    });