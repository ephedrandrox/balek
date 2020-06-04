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
        'dojo/_base/fx',

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/diaplode/navigator/resources/html/radialMenu.html',
        'dojo/text!balek-modules/diaplode/navigator/resources/css/radialMenu.css',

        "balek-modules/diaplode/navigator/Interface/menuItem"

    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, dojoKeys,
              dijitFocus, dojoReady, fx,  _WidgetBase, _TemplatedMixin, template,
              mainCss, menuItem) {

        return declare("moduleDiaplodeNavigatorInterfaceRadialMenu", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "diaplodeNavigatorInterfaceRadialMenu",

            _mainCssString: mainCss,
            _menuItems: [],


            constructor: function (args) {

                declare.safeMixin(this, args);


                this._menuItems = new Array();

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());


                dojoReady(lang.hitch(this, function () {
                    this.addMenuItem();
                    this.addMenuItem();
                    this.addMenuItem();
                    this.addMenuItem();
                    this.addMenuItem();
                    this.addMenuItem();
                }));

            },
            postCreate: function () {

            },
            _onFocus: function () {
                //todo make it do something
            },
            unload: function () {
                this.destroy();
            },


            addMenuItem: function(){
                let newMenuItem = menuItem({_instanceKey: this._instanceKey});
                domConstruct.place(newMenuItem.domNode, this.domNode,"first");
                this._menuItems.push(newMenuItem);
            }



        });
    });