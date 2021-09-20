//Navigator Interface Elements Menu Element Menu Class
//todo Clean this up and move arrangeWidgets to layout in ui
define([
        //Dojo Includes
        'dojo/_base/declare',
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
        'dojo/text!balek-modules/diaplode/navigator/Interface/menus/elementsMenu/resources/html/elementMenu.html',
        'dojo/text!balek-modules/diaplode/navigator/Interface/menus/elementsMenu/resources/css/elementMenu.css',
        //Balek Interface Includes
        "balek-modules/diaplode/navigator/Interface/menus/elementsMenu/menuItem",
        //Balek Interface Includes
        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',
        'balek-modules/components/syncedMap/Interface',
        'balek-modules/diaplode/ui/layout/layout'

    ],
    function (declare, lang, arrayUtil, dom,
              domConstruct, win, on, domAttr, domStyle, domGeom, dojoWindow, dojoKeys,
              dijitFocus, dojoReady, fx,  _WidgetBase, _TemplatedMixin, template,
              mainCss,
              menuItem,
              _syncedCommanderInterface,
              _balekWorkspaceContainerContainable, syncedMapInterface,
              diaplodeLayout) {

        return declare("moduleDiaplodeNavigatorInterfaceElementsMenuElementMenuWidget", [_WidgetBase, _TemplatedMixin,
            _syncedCommanderInterface,  _balekWorkspaceContainerContainable], {

            templateString: template,
            baseClass: "diaplodeNavigatorInterfaceElementMenuWidget",


            _mainCssString: mainCss,

            _menuItemWidgets: {},

            _newMenuItems: [],
            _availableMenuItems: {},

            _moveTimeout: null,

            _menuInterfaceState: null,
            _menuInterfaceStateWatchHandle: null,

            _navigatorOverlayState: null,
            _navigatorOverlayStateWatchHandle: null,

            _menuMap: null,
            _diaplodeLayout: null,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                declare.safeMixin(this, args);
                this._newMenuItems =[];
                this._availableMenuItems = {};
                this._menuItemWidgets = {};
                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());

                this._diaplodeLayout = new diaplodeLayout();

                if(this._systemMenu && this._systemMenu._syncedMap && this._systemMenu._syncedMap.setStateWatcher)
                {
                    this._systemMenu._syncedMap.setStateWatcher(lang.hitch(this, this.onSystemMenuStateChange));
                }


                if(this._menuInterfaceState)
                {
                    this._menuInterfaceStateWatchHandle = this._menuInterfaceState.watch(lang.hitch(this, this.onMenuInterfaceStateChange));
                }


                if(this._navigatorOverlayState !== null){
                    this._navigatorOverlayStateWatchHandle = this._navigatorOverlayState.watch(lang.hitch(this, this.onNavigatorOverlayStateChange));
                }



            },
            postCreate: function()
            {
                console.log("XXAA", "postCreate", this._systemMenu);

                this.putInWorkspaceOverlayContainer();

                this.refreshView();

            },
            startup: function(){

                this.refreshView();
            },
            //##########################################################################################################
            //Get/Set Functions Section
            //##########################################################################################################
            getMenuCompanion(){
                let menuMapComponentKey = this._interfaceState.get("syncedMapComponentKey").toString();
                let menuCompanion = this._elementsMenu.getMenuCompanion(menuMapComponentKey);
                return menuCompanion;
            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onNavigatorOverlayStateChange: function(name, oldState, newState){
                console.log("QQQQ", name, oldState, newState);

                if(name.toString() === "isVisible")
                {
this.refreshView();
                }

                if(name.toString() === "elementMenuIsVisible")
                {
                    this.refreshView();
                }

            },
            onContainerMove: function(MoveEvent)
            {

                    this._onMove(MoveEvent);

            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommands and link them
                this.inherited(arguments);

                if((name.toString() === "syncedMapComponentKey" && this._interfaceState.get("syncedMapInstanceKey")) ||
                    (name.toString() === "syncedMapInstanceKey"  && this._interfaceState.get("syncedMapComponentKey"))  && this._menuMap === null){
                    let syncedMapComponentKey = this._interfaceState.get("syncedMapComponentKey")
                    let syncedMapInstanceKey =  this._interfaceState.get("syncedMapInstanceKey")
                    this._menuMap = new syncedMapInterface({
                        _componentKey: syncedMapComponentKey,
                        _instanceKey: syncedMapInstanceKey
                    });


                    this._menuMapWatchHandle = this._menuMap.setStateWatcher(lang.hitch(this, this.onMenuMapChange));
                }

            },
            onMenuMapChange: function(name, oldState, newState){
                this.onSystemMenuStateChange(name, oldState, newState);
            },

            _onClick: function(){
                console.log("navigator", "on element menu  click");

            },
            onMenuInterfaceStateChange: function(name, oldState, newState){
                if (name.toString() === "activeStatus") {
                    this.refreshView();
                }
            },
            onSystemMenuStateChange: function(name, oldState, newState){

                if(oldState === undefined && this._menuItemWidgets[name.toString()] === undefined)
                {

                    let loopUntil =  function(){


                        let menuCompanion = this.getMenuCompanion();
                        if(menuCompanion !== undefined){
                            this._systemMenu = menuCompanion;
                            let newMenuItem =  menuItem({_itemKey: name.toString(),
                                _userKey: newState._userKey,
                                _menuCompanion: menuCompanion.menuCompanion, _name: newState.name});

                            this._menuItemWidgets[name.toString()] = newMenuItem;
                            if(this.domNode)
                            {
                                this.refreshView();
                            }
                        }else {
                           // console.log("QQQQ", "FFVV", "onSystemMenuStateChange", "no menucompanion");
                            setTimeout(lang.hitch(this, loopUntil), 500);
                        }

                    };
                    lang.hitch(this, loopUntil)();

                }else
                {
                    //check that menuItem needs updated probably here
                    //but each menuitem should be watching their element state
                }

                if( this._menuItemWidgets[name.toString()] !== undefined && newState.name){
                    this._menuItemWidgets[name.toString()].setName(newState.name);
                }
            },
            isMenuActive: function(){
                let menuActive = false;

                if( this._menuInterfaceState)
                {
                    menuActive = this._menuInterfaceState.get("activeStatus");
                }
                if(menuActive === "Active")
                {
                    return true;
                }else
                {
                    return false;
                }
            },
            showMenu: function()
            {
                domStyle.set(this._menuItems, {"display": "block"});
            },
            hideMenu: function()
            {
                domStyle.set(this._menuItems, {"display": "none"});
            },
            refreshView: function(){
                console.log("XXAA", "FFVV", "refreshView", this._systemMenu);

                let navigatorVisibility = this._navigatorOverlayState.get("isVisible");
                let elementMenuVisibility = this._navigatorOverlayState.get("elementMenuIsVisible");


                if(navigatorVisibility && elementMenuVisibility) {
                    this.show();
                }else
                {
                    this.hide();
                }

                if(this._systemMenu && this._systemMenu.menuCompanion && this._systemMenu.menuCompanion.name)
                {
                    this._mainTitle.innerHTML = this._systemMenu.menuCompanion.name;
                    this._mainEmoji.innerHTML = this._systemMenu.menuCompanion.emoji;
                }else {
                    console.log( "SystemMenu error", this, this._systemMenu);
                }

                if(this.isMenuActive())
                {
                    this.showMenu();
                }else {
                    this.hideMenu();
                }

                if(this.domNode && this._menuItemWidgets)
                {
                    this.arrangeWidgets(Object.values(this._menuItemWidgets), this.domNode);//.play();
                }

                let menuItemKeys =  Object.keys(this._menuItemWidgets);

                console.log("systemMenu",menuItemKeys );

                for(keyIndex in menuItemKeys){

                    let menuItemKey = menuItemKeys[keyIndex];
                    //console.log(menuItemKeys, menuItemKey);
                    domStyle.set(this._menuItemWidgets[menuItemKey].domNode);

                    domConstruct.place(this._menuItemWidgets[menuItemKey].domNode, this._menuItems);

                }
            },
            arrangeWidgets : function(widgets, anchorObject) {
               let layoutAnimation = this._diaplodeLayout.getAnimationArrangeWidgetsGridDynamic(widgets,anchorObject);
               if(layoutAnimation && layoutAnimation.play)
               {
                   layoutAnimation.play();
               }
            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            _onDblClick: function(event){
                //this.setName("ThisMenuNameFROMCOMMAND");
                // this.setActive();

                console.log("systemMenu",event );

                let currentStateToggle = {"block": "none", "none": "block"};
                let currentStateCallbackToggle = {"block": "Active", "none": "InActive"};

                let newStateDisplay = currentStateToggle[domStyle.get(this._menuItems, "display")];


                domStyle.set(this._menuItems, {"display": newStateDisplay});

                this._instanceCommands.changeActiveStatus(currentStateCallbackToggle[newStateDisplay]);
                if(this.domNode)
                {
                    this.arrangeWidgets(Object.values(this._menuItemWidgets), this.domNode);//.play();
                }

            },

            _onMove: function(MoveEvent)
            {
                clearTimeout(this._moveTimeout);
                this._moveTimeout = setTimeout(lang.hitch(this, function(){
                    if(this.domNode)
                    {
                        this.arrangeWidgets(Object.values(this._menuItemWidgets), this.domNode);
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
            //UI Functions Section
            //##########################################################################################################
            refreshWidget: function(){
                console.log("navigator", "on workspaces main widget refresh");

                console.log("navigator", "refreshing from menu", this.domNode);
                if(this.domNode){
                    this.domNode.innerHTML = "";

                    let newWorkspaceButton = domConstruct.create("div");
                    newWorkspaceButton.setAttribute("title", "New Workspace");
                    newWorkspaceButton.setAttribute("id", "addWorkspaceCommand");

                    newWorkspaceButton.innerHTML = "New ❖"
                    domClass.add(newWorkspaceButton, "diaplodeNavigatorInterfaceWorkspacesMenuNavigatorMainWidgetAddCommandDiv");

                    on(newWorkspaceButton, 'click', lang.hitch(this, function (evt) {
                        console.log("navigator", "new workspace clicked");

                        evt.stopPropagation();
                        this.onAddWorkspaceClicked();
                    }));

                    domConstruct.place(newWorkspaceButton, this.domNode);

                    for( const workspaceKey in this._navigatorWorkspaceMenuWidgets )
                    {
                        let workspaceState = this._navigatorWorkspaceMenuWidgets[workspaceKey];

                        let newWorkspaceInfo = domConstruct.create("div");

                        newWorkspaceInfo.innerHTML = "❖ - " + workspaceState.workspaceName;

                        newWorkspaceInfo.setAttribute("title", "Switch to " +workspaceState.workspaceName + " workspace \n(Opt + Click) to rename");

                        domClass.add(newWorkspaceInfo, "diaplodeNavigatorInterfaceWorkspacesMenuNavigatorMainWidgetWorkspaceNameDiv");


                        if(this.isActiveWorkspace && this.isActiveWorkspace(workspaceKey)){
                            domClass.add(newWorkspaceInfo, "diaplodeNavigatorInterfaceWorkspacesMenuNavigatorMainWidgetWorkspaceNameDivActive");
                        }else {
                            domClass.remove(newWorkspaceInfo, "diaplodeNavigatorInterfaceWorkspacesMenuNavigatorMainWidgetWorkspaceNameDivActive");
                        }


                        on(newWorkspaceInfo, 'click', lang.hitch(this, this.onWorkspaceMenuClick , workspaceKey,  this.workspaceManagerCommands.changeActiveWorkspace));

                        domConstruct.place(newWorkspaceInfo, this.domNode);

                        // this._mainWorkspacesDiv.innerHTML += workspaceState.workspaceName + "<br>";
                    }
                }

            },

            //##########################################################################################################
            //Workspace Container Functions Section
            //##########################################################################################################

            getDomNode: function()
            {
                return this.domNode;
            },

            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################

            unload: function () {
                console.log("Destroying menu");

                this._menuInterfaceStateWatchHandle.unwatch();
                this._menuInterfaceStateWatchHandle.remove();

                this.inherited(arguments);



                this.destroy();
            }

        });
    });