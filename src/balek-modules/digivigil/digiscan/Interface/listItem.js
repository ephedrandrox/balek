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

        'dojo/text!balek-modules/digivigil/digiscan/resources/html/listItem.html',
        'dojo/text!balek-modules/digivigil/digiscan/resources/css/listItem.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, template,
              mainCss) {

        return declare("digivigilDigiscanCaptureViewInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "digivigilDigiscanCaptureViewInterface",

            _noteDiv: null,
            _mainCssString: mainCss,

            constructor: function (args) {

                declare.safeMixin(this, args);
                if(this.itemData && this.itemData.timeStamps && this.itemData.timeStamps.created )
                {
                  ///  this.itemData.created = (new Date(parseInt(this.itemData.created))).toString()

                    const createdDate = new Date(this.itemData.timeStamps.created);
                    const formattedDate = createdDate.toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric'
                    });

                    this.itemData.timeStamps.created = formattedDate

                }

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this.domNode);
                }));

            },
            postCreate: function () {
                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this.domNode);
                }));
                dijitFocus.focus(this.domNode);

                if (this.itemData.note !== ""){
                    domStyle.set(this._noteDiv, "display", "block")
                }
            },
            _onFocus: function () {
                //todo make it do something
            },
            unload: function () {
                this.destroy();
            }


        });
    });