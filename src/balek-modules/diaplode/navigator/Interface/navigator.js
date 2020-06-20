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
        'balek-modules/base/command/remote',


        "balek-modules/diaplode/navigator/Interface/radialMenu",

        "balek-modules/diaplode/ui/input/getUserInput",

    ],
    function (declare,
              lang,
              topic,

              domClass,
              domConstruct,
              win,
              on,
              domAttr,
              dojoKeys,
              dijitFocus,
              dojoReady,
              fx,
              fxComplexExt,
              _WidgetBase,
              _TemplatedMixin,
              template,
              templateCSS,
              baseInterface,
              stateSynced,
              remoteCommander,
              radialMenu,
              getUserInput) {

        return declare("moduleDiaplodeNavigatorInterface", [_WidgetBase, _TemplatedMixin, baseInterface, stateSynced, remoteCommander], {
            _instanceKey: null,
            templateString: template,
            baseClass: "diaplodeNavigatorInterface",
            _shiftDown: false,
            _availableMenus: {},
            _newMenus: [],
            _mainLogDiv: null,

            _DBCollection: "Diaplode",


            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._availableMenus = {};
                this._newMenus = [];

                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

                dojoReady(lang.hitch(this, function () {

                    if (this._componentKey) {
                        this.askToConnectInterface();
                    }

                    on(document.body, "keyup", lang.hitch(this, this._onDocumentKeyUp));

                }));


            },
            postCreate: function () {
                topic.publish("addToMainContentLayer", this.domNode);
                dijitFocus.focus(this.domNode);

            },


            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            onInterfaceStateChange: function (name, oldState, newState) {
                console.log(name, newState);
                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommands and link them
                if (name === "interfaceRemoteCommands") {
                    this.linkRemoteCommands(newState);
                   // this._instanceCommands.changeName("ThisNavigatorName").then(function (results) {
                   //     console.log(results);
                   // });
                    // ready to show widget now that we have our
                    // interface linked and received our remote commands;
                    this.introAnimation();

                }

                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommandKey
                if (name === "interfaceRemoteCommandKey") {
                    console.log("Remote COmmander Key!");
                    this._interfaceRemoteCommanderKey = newState;

                }

                if (name === "availableMenus") {
                    this.updateAvailableMenus();
                    this.arrangeMenus();
                }

                if (name === "log") {
                    console.log("adding to log", newState);


                    this._mainLogDiv.innerHTML += "<br/>" + newState;
                }



            }
            ,
            _onFocus: function () {
                console.log("Navigator focus");
            },
            onBlur: function () {
                console.log("Navigator unfocus");

            },
            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();
                        if (this._shiftDown) {
                            this.loadOrToggleModule("session/menu");
                        } else {
                            let getNameForMenu = new getUserInput({question: "Choose a Menu Name", inputReplyCallback: lang.hitch(this, function(newMenuName){
                                    console.log("Requesting new menu", newMenuName);
                                    this._instanceCommands.newMenu(newMenuName).then(function (results) {
                                        console.log(results);
                                     });
                                    getNameForMenu.unload();
                                }) });


                        }
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        if (this._shiftDown) {
                            this.loadOrToggleModule("admin/system");
                        } else {

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
                        this.loadOrToggleModule("diaplode/navigator");
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

            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################

            introAnimation: function () {
                fx.animateProperty({
                    node: this.domNode,
                    duration: 900,

                    properties: {
                        transform: {
                            end: 'translate(-50%, -50%)rotate(0deg)',
                            start: 'translate(-50%, -50%)rotate(-100deg)'
                        }
                    }
                }).play();

                fx.animateProperty({
                    node: this._mainImage,
                    duration: 300,
                    properties: {
                        width: {start: 0, end: 500},
                        transform: {end: 'rotate(0deg)', start: 'rotate(-100deg)'},
                        opacity: {start: 0, end: 1}
                    }
                }).play();

                fx.animateProperty({
                    node: this.domNode,
                    duration: 1200,

                    properties: {
                        opacity: {start: 0, end: 1}
                    }
                }).play();
            },
            arrangeMenus: function () {
                let placementArray = [
                    {x: 50, y: 10}, {x: 66, y: 30}, {x: 66, y: 70},
                    {x: 50, y: 90}, {x: 34, y: 70}, {x: 34, y: 30},
                    {x: 42, y: 20}, {x: 58, y: 20}, {x: 66, y: 50},
                    {x: 58, y: 80}, {x: 42, y: 80}, {x: 33, y: 50}];
                let count = 0;
                for (const menuToArrange in this._availableMenus) {
                    this._availableMenus[menuToArrange].moveTo(placementArray[count].x, placementArray[count].y);
                    count++;
                }
            },

            //##########################################################################################################
            //Menu Functions Section
            //##########################################################################################################

            updateAvailableMenus: function () {
                let availableMenusState = this._interfaceState.get("availableMenus");
                for (const [index, newMenuWidget] of  this._newMenus.entries()) {
                    let newWidgetKey = newMenuWidget.getComponentKey();
                    if (availableMenusState[newWidgetKey]) {
                        this._newMenus.splice(index, 1);
                        this._availableMenus[newWidgetKey] = newMenuWidget;
                    }
                }
                for (const availableMenuComponentKey of Object.values(availableMenusState) ) {
                    if (!this._availableMenus[availableMenuComponentKey]) {
                        //this is when we should make a new menu and update the addmenu function
                        this._availableMenus[availableMenuComponentKey] = this.addMenu(availableMenuComponentKey);

                    }
                }
            },
            unloadAllMenus: function () {
                for (const newMenuWidget of  this._newMenus) {
                    newMenuWidget.unload();

                }
                for (const availableMenuKey in this._availableMenus) {

                    this._availableMenus[availableMenuKey].unload();
                }
            },
            addMenu: function (availableMenuComponentKey) {
                let newMenu = radialMenu({_instanceKey: this._instanceKey, _componentKey: availableMenuComponentKey});
                //add widget to newMenu array that will be searched when available menu state is changed

                if (!availableMenuComponentKey) {
                    this._newMenus.push(newMenu);
                } else {
                    return newMenu
                }

            },
            removeMenu: function (menuKey) {
                //todo, start menu removal with delete key

            },

            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################

            loadOrToggleModule: function (moduleID) {
                topic.publish("isModuleLoaded", moduleID, function (moduleIsLoaded) {
                    if (moduleIsLoaded) {
                        moduleIsLoaded.toggleShowView();
                    } else {
                        topic.publish("requestModuleLoad", moduleID);
                    }
                });
            },
            unload() {
                this.unloadAllMenus();
                console.log("destroying navigator");
                this.inherited(arguments);
                this.destroy();
            }
        });
    });