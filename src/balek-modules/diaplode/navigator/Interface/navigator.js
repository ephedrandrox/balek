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
        'dojo/text!balek-modules/diaplode/navigator/resources/css/navigator.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, dojoKeys, dijitFocus, dojoReady, fx, fxComplexExt, _WidgetBase, _TemplatedMixin, template, templateCSS) {

        return declare("moduleDiaplodeLoginInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "diaplodeNavigatorInterface",
            _shiftDown: false,
            _userData: {},
            constructor: function (args) {

                declare.safeMixin(this, args);

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());


                dojoReady(lang.hitch(this, function () {




                        fx.animateProperty({
                            node:this.domNode,
                            duration:8000,

                            properties: {
                                transform: { end: 'translate(-50%, -50%)rotate(300deg)', start:'translate(-50%, -50%)rotate(0deg)'}
                            }
                        }).play();

                    fx.animateProperty({
                        node:this._mainImage,
                        duration:2000,

                        properties: {
                            width:{ start: 0, end: 500},
                            transform: { end: 'rotate(300deg)', start:'rotate(0deg)'}
                        }
                    }).play();





                }));

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
                        }
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        this.loadOrToggleModule( "admin/system");
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
                this.destroy();
            }
        });
    });