define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/Stateful',
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

    "balek-modules/diaplode/navigator/Interface/radialMenu"
    ],
    function (declare, lang, topic, Stateful, domClass, domConstruct, win, on, domAttr, dojoKeys, dijitFocus, dojoReady, fx, fxComplexExt, _WidgetBase, _TemplatedMixin, template, templateCSS, radialMenu) {

        return declare("moduleDiaplodeNavigatorInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "diaplodeNavigatorInterface",
            _shiftDown: false,
            _menus: [],

            _menusState: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._menus = new Array();

                //add menu state object


                let menusState = declare([Stateful], {
                    activeMenus: null,
                    availableMenus: null
                });

                this._menusState = new menusState({
                    activeMenus: [],
                    availableMenus: [],

                });

                this._menusStateActiveMenusWatchHandle = this._menusState.watch("activeMenus", lang.hitch(this, this.activeMenusStateChange));

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());


                dojoReady(lang.hitch(this, function () {
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



                }));

            },
            activeMenusStateChange: function(name, oldState, newState){
                if (name === "activeMenus") {

                   // this.addMenu();
                }
            },
            addMenu: function(){
                let newMenu = radialMenu({_instanceKey: this._instanceKey});
                domConstruct.place(newMenu.domNode, this.domNode,"first");
                this._menus.push(newMenu);
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
                            this.loadOrToggleModule( "diaplode/navigator");
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
            unload() {
                this._menusStateCurrentMenuWatchHandle.unwatch();
                this._menusStateCurrentMenuWatchHandle.remove();
                this.destroy();
            }
        });
    });