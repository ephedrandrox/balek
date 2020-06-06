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

        'balek-modules/Interface',

        "balek-modules/diaplode/navigator/Interface/radialMenu"
    ],
    function (declare, lang, topic, Stateful, domClass, domConstruct, win, on, domAttr, dojoKeys, dijitFocus, dojoReady, fx, fxComplexExt, _WidgetBase, _TemplatedMixin, template, templateCSS, baseInterface, radialMenu) {

        return declare("moduleDiaplodeNavigatorInterface", [_WidgetBase, _TemplatedMixin, baseInterface], {
            _instanceKey: null,
            templateString: template,
            baseClass: "diaplodeNavigatorInterface",
            _shiftDown: false,
            _availableMenus: {},
            _newMenus: [],
            _menusState: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._availableMenus = {};
                this._newMenus = new Array();

                let menusState = declare([Stateful], {
                    activeMenus: null,
                    availableMenus: null
                });

                this._menusState = new menusState({
                    activeMenus: {},
                    availableMenus: {},

                });

                this._menusStateWatchHandle = this._menusState.watch( lang.hitch(this, this.menusStateChange));

                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

                dojoReady(lang.hitch(this, function () {

                    //request Navigator Instance State Changes be sent to this._InstanceStateChangeCallback
                    this.sendInstanceCallbackMessage({
                        request: "Diaplode Navigator State",
                    }, lang.hitch(this, this._InstanceStateChangeCallback))

                    //Show Widget
                    this.introAnimation();

                }));

            },
            postCreate: function(){
                topic.publish("addToMainContentLayer", this.domNode);

                dijitFocus.focus(this.domNode);


            },
            _InstanceStateChangeCallback(stateChangeUpdate) {

                if(stateChangeUpdate.menusState)
                {
                    let menusState = JSON.parse(stateChangeUpdate.menusState);
                    console.log(menusState);

                    if(menusState.availableMenus)
                    {
                       this._menusState.set("availableMenus", menusState.availableMenus)
                    }
                }
                console.log(stateChangeUpdate);

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
                    console.log(this._menusState.get("availableMenus"));
                    let count = 0;
                    for(const menuToArrange in this._availableMenus)
                    {
                        this._availableMenus[menuToArrange].moveTo(placementArray[count].x, placementArray[count].y);
                        count++;

                    }
            },
            updateAvailableMenus: function()
            {
                let availableMenusState = this._menusState.get("availableMenus");
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
                        alert("available menu that we haven't gotten a key for yet!")        ;
                    }
                }
            },
            menusStateChange: function(name, oldState, newState){
               if (name === "availableMenus"){
                    this.updateAvailableMenus();
                   this.arrangeMenus();
                }
            },
            addMenu: function(){
                let newMenu = radialMenu({_instanceKey: this._instanceKey});

                //add widget to newMenu array that will be searched when available menu state is changed
                this._newMenus.push(newMenu);
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
                this._menusStateWatchHandle.unwatch();
                this._menusStateWatchHandle.remove();
                this.destroy();
            }
        });
    });