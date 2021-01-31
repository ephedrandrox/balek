define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/on',
        "dojo/aspect",
        "dojo/dom-attr",
        "dojo/dom-style",
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


        "balek-modules/diaplode/navigator/Interface/radialMenu",//todo remove
        "balek-modules/diaplode/navigator/Interface/menus/systemMenuWidget",//todo remove

        "balek-modules/diaplode/navigator/Interface/menus/systemMenu",

        "balek-modules/diaplode/ui/input/getUserInput",

        "balek-modules/diaplode/ui/containers/movable",  //todo remove

        "balek-modules/diaplode/navigator/Interface/menus/workspacesMenu/navigatorMainWidget",



        'balek-modules/components/syncedCommander/Interface'
    ],
    function (declare,
              lang,
              topic,

              domClass,
              domConstruct,
              win,
              on,
              aspect,
              domAttr,
              domStyle,
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
              radialMenu,
              systemMenuWidget,
              systemMenu,
              getUserInput,
              diaplodeMovableContainer,
              workspacesMenu,
              _syncedCommanderInterface) {

        return declare("moduleDiaplodeNavigatorInterface", [_WidgetBase, _TemplatedMixin,  _syncedCommanderInterface, diaplodeMovableContainer], {
            _instanceKey: null,
            templateString: template,
            baseClass: "diaplodeNavigatorInterface",
            _shiftDown: false,
            _availableMenus: {},
            _newMenus: [],
            _mainLogDiv: null,


            _navigatorSystemMenuWidgets: null,
            _navigatorSystemMenusState: null,
            _navigatorSystemMenusStateWatchHandle: null,

            _systemMenus: null,




             _workspacesMenu: null,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._navigatorSystemMenuWidgets = {};
                this._navigatorWorkspaceMenuWidgets = {};
                this._availableMenus = {};
                this._newMenus = [];


                this._systemMenus = {};


                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

                dojoReady(lang.hitch(this, function () {


                   // on(document.body, "keyup", lang.hitch(this, this._onDocumentKeyUp));



                }));




            },
            onNavigatorSystemMenusStateChange: function(name, oldState, newState){
                console.log("system Menu", name, oldState, newState);
                let menuName = name.toString()
                let systemMenu = newState;
                if(this._navigatorSystemMenuWidgets[menuName] === undefined)
                {
                    debugger;

                    let systemMenu = this._navigatorSystemMenusState.get(menuName);
                    this.requestSystemMenuInstance(menuName);


                    debugger;
                    console.log("system Menu", menuName, Object.keys(this._navigatorSystemMenusState));
                    console.log("system Menu", menuName, this._navigatorSystemMenusState.get(menuName));

                    this.arrangeSystemMenus();
                }
            },

            loadAndWatchNavigatorSystemMenus: function(){
               // debugger;

                let menuNames =Object.keys(this._navigatorSystemMenusState);
               // debugger;

                for(menuNameIndex in menuNames)
                {
                   // debugger;
                    let menuName = menuNames[menuNameIndex];

                    if(this._navigatorSystemMenuWidgets[menuName] === undefined)
                    {
                    //    debugger;

                        let systemMenu = this._navigatorSystemMenusState.get(menuName);


                       // this._navigatorSystemMenuWidgets[menuName] = new systemMenuWidget({_systemMenu: systemMenu, _navigatorWidget: this});
                        this.requestSystemMenuInstance(menuName);


                       // debugger;
                      //  console.log("system Menu", menuName, Object.keys(this._navigatorSystemMenusState));
                       // console.log("system Menu", menuName, this._navigatorSystemMenusState.get(menuName));
                    }



                }
                this._navigatorSystemMenusStateWatchHandle = this._navigatorSystemMenusState.watch( lang.hitch(this, this.onNavigatorSystemMenusStateChange));


            },
            requestSystemMenuInstance: function(menuName){

                console.log("navigator", this._instanceCommands )
                this._instanceCommands.requestSystemMenuInstance(menuName).then(function (results) {
                    console.log("navigator" , results);
                });

            },


            postCreate: function () {

                topic.publish("addToMainContentLayer", this.domNode);
                dijitFocus.focus(this.domNode);

                this.makeMovable();

                this.introAnimation();

                this._workspaceMenu = new workspacesMenu({_targetNode: this._mainWorkspacesDiv});

                if(this._workspaceMenu.domNode){
                    console.log("navigator", "no aspect after", this.domNode,this._mainWorkspacesDiv, this._workspaceMenu.domNode );
                    domConstruct.place(this._workspaceMenu.domNode, this._mainWorkspacesDiv);
                }else {
                    aspect.after(this._workspaceMenu, "postCreate", lang.hitch(this, function(){
                        domConstruct.place(this._workspaceMenu.domNode, this._mainWorkspacesDiv);
                    }));
                }


            },


            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onRemoteCommandsInitiated: function(){
                console.log("navigator" , this._instanceCommands);
                this.loadAndWatchNavigatorSystemMenus();

            },

            onInterfaceStateChange: function (name, oldState, newState) {
                console.log("navigator" , name, newState);
                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommands and link them

                this.inherited(arguments);


                if (name === "availableMenus") {
                    this.updateAvailableMenus();
                    this.arrangeMenus();
                }

                if (name === "availableSystemMenus") {
                    console.log("navigator", "availableSystemMenus", newState);

                    this.updateAvailableSystemMenus();

                }

                if (name === "log") {
                  //  console.log("adding to log", newState);


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
                    case dojoKeys.TAB:
                       // keyDownEvent.preventDefault();
                        break;

                }
            },
            onAddMenuClicked: function (event){
                console.log(event);
                let getNameForMenu = new getUserInput({question: "Choose a Menu Name", inputReplyCallback: lang.hitch(this, function(newMenuName){
                        console.log("Requesting new menu", newMenuName);
                        this._instanceCommands.newMenu(newMenuName).then(function (results) {
                            console.log(results);
                        });
                        getNameForMenu.unload();
                    }) });

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
            arrangeSystemMenus: function(){
                console.log("navigator", "Rearrangin System menus")

                let placementArray = [
                    {x: 50, y: 10}, {x: 66, y: 30}, {x: 66, y: 70},
                    {x: 50, y: 90}, {x: 34, y: 70}, {x: 34, y: 30},
                    {x: 42, y: 20}, {x: 58, y: 20}, {x: 66, y: 50},
                    {x: 58, y: 80}, {x: 42, y: 80}, {x: 33, y: 50}];
                let count = 0;
                for (const menuToArrange in this._navigatorSystemMenuWidgets) {
                    console.log("navigator", "Rearrangin System menus",  this._navigatorSystemMenuWidgets[menuToArrange]);
                    //this._navigatorSystemMenuWidgets[menuToArrange].moveTo(placementArray[count].x+30,    placementArray[count].y+300);
                    count++;
                }
            },

            //##########################################################################################################
            //Menu Functions Section
            //##########################################################################################################

            updateAvailableMenus: function () {
                let availableMenusState = this._interfaceState.get("availableMenus");

                    for (const newMenuWidgetKey in this._newMenus) {
                        let newMenuWidget = this._newMenus[newMenuWidgetKey];
                        let newWidgetKey = newMenuWidget.getComponentKey();
                        if (availableMenusState[newWidgetKey]) {
                            this._newMenus.splice(index, 1);
                            this._availableMenus[newWidgetKey] = newMenuWidget;
                        }
                    }

                for (const index in availableMenusState ) {
                    let availableMenuComponentKey = availableMenusState[index];
                    if (!this._availableMenus[availableMenuComponentKey]) {
                        //this is when we should make a new menu and update the addmenu function
                        this._availableMenus[availableMenuComponentKey] = this.addMenu(availableMenuComponentKey);

                    }
                }

            },
            updateAvailableSystemMenus: function () {
                console.log("navigator", "updateAvailableSystemMenus");

                let availableSystemMenusState = this._interfaceState.get("availableSystemMenus");

                console.log("navigator", "updateAvailableSystemMenus", availableSystemMenusState);

                for (const index in availableSystemMenusState ) {
                    let availableSystemMenuComponentKey = availableSystemMenusState[index];
                    if (!this._navigatorSystemMenuWidgets[availableSystemMenuComponentKey]) {
                        console.log("navigator", "_navigatorSystemMenuWidgets", availableSystemMenuComponentKey);
                        console.log("navigator", "_navigatorSystemMenuWidgets", this._navigatorSystemMenuWidgets);

                        this._navigatorSystemMenuWidgets[availableSystemMenuComponentKey] = new systemMenu({
                            _sessionKey: this._sessionKey,
                            _instanceKey: this._instanceKey,
                            _componentKey: availableSystemMenuComponentKey,
                            _navigatorWidget: this,
                            _navigatorSystemMenusState: this._navigatorSystemMenusState
                        });
                    }
                }

            },

            unloadAllMenus: function () {

                 for ( let i = 0; i < this._newMenus.length; i++) {
                                let newMenuWidget = this._newMenus[i];
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
            toggleShowView: function(){
                let currentStateToggle = {"block": "none", "none": "block"};
                domStyle.set(this.domNode, {"display": currentStateToggle[domStyle.get(this.domNode, "display")]});

                for (const menuToToggle in this._navigatorSystemMenuWidgets) {
                    this._navigatorSystemMenuWidgets[menuToToggle].toggleShowView();
                }

            },
            hide: function(){
                domStyle.set(this.domNode, {"display": "none"});

                for (const menuToToggle in this._navigatorSystemMenuWidgets) {
                    this._navigatorSystemMenuWidgets[menuToToggle].hide();
                }

            },
            show: function(){
                domStyle.set(this.domNode, {"display": "block"});

                for (const menuToToggle in this._navigatorSystemMenuWidgets) {
                    this._navigatorSystemMenuWidgets[menuToToggle].show();
                }

            },
            unload() {
                   this._navigatorSystemMenusStateWatchHandle.unwatch();
                   this._navigatorSystemMenusStateWatchHandle.remove();

                this.unloadAllMenus();
                console.log("destroying navigator");
                this.inherited(arguments);
                this.destroy();
            }
        });
    });