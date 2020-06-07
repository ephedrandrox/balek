define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/on',
        "dojo/dom-attr",
        "dojo/keys",
        "dijit/focus",
        "dojo/ready",
        "dojo/_base/fx",
        "dojox/fx/ext-dojo/complex",

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/diaplode/navigator/resources/html/navigator.html',
        'dojo/text!balek-modules/diaplode/navigator/resources/css/navigator.css',

        'balek-modules/Interface',
        'balek-modules/base/state/synced',

        "balek-modules/diaplode/navigator/Interface/radialMenu"
    ],
    function (declare, lang, topic,  domClass, domConstruct, win, on, domAttr, dojoKeys, dijitFocus, dojoReady, fx, fxComplexExt, _WidgetBase, _TemplatedMixin, template, templateCSS, baseInterface, stateSynced, radialMenu) {

        return declare("moduleDiaplodeNavigatorInterface", [_WidgetBase, _TemplatedMixin, baseInterface, stateSynced], {
            _instanceKey: null,
            templateString: template,
            baseClass: "diaplodeNavigatorInterface",
            _shiftDown: false,
            _availableMenus: {},
            _newMenus: [],

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._availableMenus = {};
                this._newMenus = new Array();



                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

                dojoReady(lang.hitch(this, function () {

                    //request Navigator Instance State Changes be sent to this._InstanceStateChangeCallback
                    this.sendInstanceCallbackMessage({
                        request: "New Navigator",
                    }, lang.hitch(this, this._InstanceStateChangeCallback));

                    //Show Widget
                    this.introAnimation();

                    on(document.body, "keyup", lang.hitch(this, this._onDocumentKeyUp));

                }));

            },
            postCreate: function(){
                topic.publish("addToMainContentLayer", this.domNode);
                dijitFocus.focus(this.domNode);

            },
            introAnimation: function(){
                fx.animateProperty({
                    node:this.domNode,
                    duration:900,

                    properties: {
                        transform: { end: 'translate(-50%, -50%)rotate(0deg)', start:'translate(-50%, -50%)rotate(-100deg)'}
                    }
                }).play();

                fx.animateProperty({
                    node:this._mainImage,
                    duration:300,
                    properties: {
                        width:{ start: 0, end: 500},
                        transform: { end: 'rotate(0deg)', start:'rotate(-100deg)'},
                        opacity: {start: 0, end: 1}
                    }
                }).play();

                fx.animateProperty({
                    node:this.domNode,
                    duration:1200,

                    properties: {
                        opacity: {start: 0, end: 1}
                    }
                }).play();
            },
            arrangeMenus: function(){

                let placementArray = [{x:50,y:10},{x:66,y:30},{x:66,y:70},{x:50,y:90},{x:34,y:70},{x:34,y:30},
                                        {x:42,y:20},{x:58,y:20},{x:66,y:50},{x:58,y:80},{x:42,y:80},{x:33,y:50}  ];
                    console.log(this._interfaceState.get("availableMenus"));
                    let count = 0;
                    for(const menuToArrange in this._availableMenus)
                    {
                        this._availableMenus[menuToArrange].moveTo(placementArray[count].x, placementArray[count].y);
                        count++;

                    }
            },
            updateAvailableMenus: function()
            {
                let availableMenusState = this._interfaceState.get("availableMenus");
                for (const [index, newMenuWidget] of  this._newMenus.entries()) {
                  newWidgetKey = newMenuWidget.getMenuKey();
                  if (availableMenusState[newWidgetKey])
                  {
                      this._newMenus.splice(index, 1);
                      this._availableMenus[newWidgetKey] = newMenuWidget;
                  }
                }
                for (const availableMenuState in availableMenusState ) {

                    if ( !this._availableMenus[availableMenuState]) {
                        //this is when we should make a new menu and update the addmenu function
                        this._availableMenus[availableMenuState]= this.addMenu(availableMenuState);
                    }
                }
            },
            unloadAllMenus:function()
            {
                for (const newMenuWidget of  this._newMenus) {
                   newMenuWidget.unload();

                }
                for (const availableMenuKey in this._availableMenus ) {

                    this._availableMenus[availableMenuKey].unload();
                }
            },
            onInterfaceStateChange: function(name, oldState, newState){
                if (name === "availableMenus"){
                    this.updateAvailableMenus();
                    this.arrangeMenus();
                }
            },
            addMenu: function(menuKey){
                let newMenu = radialMenu({_instanceKey: this._instanceKey, _menuKey: menuKey});
                //add widget to newMenu array that will be searched when available menu state is changed

                if(!menuKey) {
                    this._newMenus.push(newMenu);
                }
                else
                {
                    return newMenu
                }

            },
            removeMenu: function(menuKey){
                //todo, start menu removal with delete key

            },
            loadOrToggleModule: function(moduleID){
                topic.publish("isModuleLoaded", moduleID, function (moduleIsLoaded) {
                    if (moduleIsLoaded) {
                        moduleIsLoaded.toggleShowView();
                    } else {
                        topic.publish("requestModuleLoad", moduleID);
                    }
                });
            },
            _onFocus: function () {
            console.log("Navigator focus");
            },
            onBlur: function(){
                console.log("Navigator unfocus");

            },
            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();
                        if (this._shiftDown) {
                            this.loadOrToggleModule("session/menu");
                        }else
                        {
                            this.addMenu();
                        }
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        if (this._shiftDown) {
                            this.loadOrToggleModule( "admin/system");
                        }else
                        {

                        }
                        break;
                    case dojoKeys.SHIFT:
                        this._shiftDown = false;
                        break;
                }
            },
            _onDocumentKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ESCAPE:
                            this.loadOrToggleModule( "diaplode/navigator");
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
            unload() {
                this.unloadAllMenus();
                console.log("destroying navigator");
                this.inherited(arguments);
                this.destroy();
            }
        });
    });