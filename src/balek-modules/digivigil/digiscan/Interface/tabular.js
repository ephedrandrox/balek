define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/on',
        "dojo/dom-attr",
        'dojo/dom-style',

        "dojo/keys",
        "dijit/focus",
        "dojo/ready",
        'dojo/_base/fx',

        "dijit/InlineEditBox",
        "dijit/form/TextBox",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/digivigil/digiscan/resources/html/tabular.html',
        'dojo/text!balek-modules/digivigil/digiscan/resources/css/tabular.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, template,
              mainCss) {

        return declare("digivigilDigiscanCapturesTabularViewInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "digivigilDigiscanCapturesTabularViewInterface",

            _noteDiv: null,
            _mainCssString: mainCss,

            constructor: function (args) {

                declare.safeMixin(this, args);
                if(this.capturesState )
                {


                }

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());



            },
            postCreate: function () {
                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this.domNode);
                }));

                dijitFocus.focus(this.domNode);


            },
            _onFocus: function () {
                //todo make it do something
            },
            unload: function () {
                this.destroy();
            }


        });
    });