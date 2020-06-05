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
        'dojo/_base/fx',

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/diaplode/navigator/resources/html/radialMenu.html',
        'dojo/text!balek-modules/diaplode/navigator/resources/css/radialMenu.css',

        "balek-modules/diaplode/navigator/Interface/menuItem"

    ],
    function (declare, lang, topic, Stateful, domClass, domConstruct, win, on, domAttr, dojoKeys,
              dijitFocus, dojoReady, fx,  _WidgetBase, _TemplatedMixin, template,
              mainCss, menuItem) {

        return declare("moduleDiaplodeNavigatorInterfaceRadialMenu", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "diaplodeNavigatorInterfaceRadialMenu",

            _menuName: "Untitled Interface",
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

                    console.log(name,oldState,newState);

            },
            requestNewMenu(name){
                console.log("requesting New Menu");

                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    moduleMessage: {
                        instanceKey: this._instanceKey, messageData: {
                            request: "New Navigator Menu",
                            name: name
                        }
                    }
                }, lang.hitch(this, this._InstanceStateChangeCallback));

            },

            _InstanceStateChangeCallback: function(stateChangeUpdate){
                if(stateChangeUpdate.instanceState)
                {
                    let instanceState = JSON.parse(stateChangeUpdate.instanceState);
                    this._menuState.set("menuName", instanceState.name)
                }
              console.log(stateChangeUpdate);
            },

            postCreate: function () {

            },
            _onFocus: function () {
                //todo make it do something
            },
            unload: function () {

                this._menuStateWatchHandle.unwatch();
                this._menuStateWatchHandle.remove();

                this.destroy();
            },


            addMenuItem: function(){
               // let newMenuItem = menuItem({_instanceKey: this._instanceKey});
               // domConstruct.place(newMenuItem.domNode, this.domNode,"first");
               // this._menuItems.push(newMenuItem);
            }



        });
    });