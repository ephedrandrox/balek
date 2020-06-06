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

        'dojo/text!balek-modules/diaplode/navigator/resources/html/menuItem.html',
        'dojo/text!balek-modules/diaplode/navigator/resources/css/menuItem.css',

        'balek-modules/Interface',

        'balek-modules/base/state/synced'

    ],
    function (declare, lang, topic, Stateful, domClass, domConstruct, win, on, domAttr, dojoKeys,
              dijitFocus, dojoReady, fx,  _WidgetBase, _TemplatedMixin, template,
              mainCss, baseInterface, stateSynced) {

        return declare("moduleDiaplodeNavigatorInterfaceMenuItem", [_WidgetBase, _TemplatedMixin, baseInterface, stateSynced], {
            _instanceKey: null,
            _menuKey: null,
            templateString: template,
            baseClass: "diaplodeNavigatorInterfaceMenuItem",

            _mainCssString: mainCss,

            constructor: function (args) {

                declare.safeMixin(this, args);

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                dojoReady(lang.hitch(this, function () {
                    this.sendInstanceCallbackMessage({
                        request: "New Navigator Menu Item",
                        menuKey: this._menuKey
                    }, lang.hitch(this, this._InstanceStateChangeCallback))


                }));

            },
            onInterfaceStateChange: function(name, oldState, newState){
               console.log("menu Item State change", name, newState);

               if(name === "menuItemKey")
               {
                   //show menu item
               }
            },

            postCreate: function () {
                topic.publish("addToMainContentLayer", this.domNode);
            },
            _onFocus: function () {
                //todo make it do something
            },
            unload: function () {
                this.inherited(arguments);

                this.destroy();
            }


        });
    });