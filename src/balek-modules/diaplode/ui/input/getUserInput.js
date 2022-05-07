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

        'dojo/text!balek-modules/diaplode/ui/input/getUserInput/resources/html/getUserInput.html',
        'dojo/text!balek-modules/diaplode/ui/input/getUserInput/resources/css/getUserInput.css',




    ],
    function (declare, lang, topic, Stateful, domClass, domConstruct, win, on, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx,  _WidgetBase, _TemplatedMixin, template,
              mainCss) {

        return declare("diaplodeUIInputGetUserInput", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            _menuKey: null,
            templateString: template,
            baseClass: "diaplodeUIInputGetUserInput",

            question: null,
            initialValue: "",
            inputReplyCallback: null,
            userInputValue: null,

            _mainCssString: mainCss,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                declare.safeMixin(this, args);

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());


            },
            postCreate: function () {
                topic.publish("displayAsDialog", this);

            },
            _onFocus: function(){
                this.userInputValue.focus();
            },
            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();

                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        keyUpEvent.stopPropagation();

                        this.unload();
                        break;

                }
            }, _onKeyDown: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();
                        this.inputReplyCallback(this.userInputValue.value)
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        keyUpEvent.stopPropagation();
                        this.unload();
                        break;

                }
            },

            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################

            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################


            unload: function () {

                this.destroy();
            }


        });
    });