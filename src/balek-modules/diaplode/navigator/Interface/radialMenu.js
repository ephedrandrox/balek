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

            _menuName: "Untitled Interface",
            _menuKey: null,
            _menuState: null,

            _mainCssString: mainCss,
            _menuItems: [],




            constructor: function (args) {

                declare.safeMixin(this, args);


                this._menuItems = new Array();

                let menuState = declare([Stateful], {
                    menuName: null,
                    menuItems: null
                });

                this._menuState = new menuState({
                    menuName: this._menuName,
                    menuItems: new Array()

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
                }
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
                if(stateChangeUpdate.menuState)
                {
                    let menuState = JSON.parse(stateChangeUpdate.menuState);
                    if(menuState.name){
                        this._menuState.set("menuName", menuState.name);
                    }
                    if(menuState.key){
                        this._menuState.set("key", menuState.key);
                    }
                }
            },
            postCreate: function () {

            },
            _onFocus: function () {
                //todo make it do something
            },
            _onClick: function(){
                this.sendInstanceMessage({
                    request: "Change Navigator Menu Name",
                    name: "Clicked",
                    menuKey: this._menuKey,
                }, lang.hitch(this, this._InstanceStateChangeCallback))
            },
            unload: function () {

                this._menuStateWatchHandle.unwatch();
                this._menuStateWatchHandle.remove();

                this.destroy();
            },
            moveTo: function(x,y){
                //make this part of a Movable class that inherits

                domStyle.set(this.domNode, "top", y+"px");
                domStyle.set(this.domNode, "left", x+"px");
            }
            ,
            addMenuItem: function(){
               // let newMenuItem = menuItem({_instanceKey: this._instanceKey});
               // domConstruct.place(newMenuItem.domNode, this.domNode,"first");
               // this._menuItems.push(newMenuItem);
            }
        });
    });