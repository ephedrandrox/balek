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

        "dijit/InlineEditBox",
        "dijit/form/TextBox",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/digivigil-www/guestbook/resources/html/createEntry.html',
        'dojo/text!balek-modules/digivigil-www/guestbook/resources/css/createEntry.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, dojoKeys,
              dijitFocus, dojoReady, fx, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, template,
              mainCss) {
        return declare("digivigilWWWGuestbookCreateEntryInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            _interface: null,
            templateString: template,
            baseClass: "digivigilWWWGuestbookCreateEntryInterface",

            _mainCssString: mainCss,

            _guestbookData: {},
            _shiftDown: false,

            constructor: function (args) {
                this._interface = {};
                this._guestbookData = {};
                declare.safeMixin(this, args);

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

            },
            _onAddEntryClicked: function (eventObject) {

                this._interface.sendEntry({
                    name: this._inputName.value,
                    home: this._inputHome.value,
                    note: this._inputNote.value
                });
                //todo Update interface and wait for response before clsoing
                this._removeWidget();

            },
            _onCancelEntryClicked: function (eventObject) {
                this._removeWidget();
            },
            _removeWidget() {
                fx.fadeOut({
                    node: this.domNode,
                    onEnd: lang.hitch(this, function () {
                        this.destroy();

                    })
                }).play();
            },
            _onFocus: function () {
                this._inputName.focus();
            },
            _onInputFocus: function (event) {
                console.log(event);
                event.target.select();
            },
            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        this._removeWidget();
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
                    case dojoKeys.ENTER:
                        if (this._shiftDown) {
                            keyDownEvent.preventDefault();
                            this._onAddEntryClicked();
                        }
                        break;
                }
            },
            unload: function () {
                this.destroy();
            }
        });
    });