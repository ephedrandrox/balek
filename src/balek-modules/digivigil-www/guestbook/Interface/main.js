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
        "dijit/InlineEditBox",
        "dijit/form/TextBox",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        "balek-modules/digivigil-www/guestbook/Interface/createEntry",
        "balek-modules/digivigil-www/guestbook/Interface/listItem",

        'dojo/text!balek-modules/digivigil-www/guestbook/resources/html/main.html',
        'dojo/text!balek-modules/digivigil-www/guestbook/resources/css/main.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, dojoKeys,
              dijitFocus, dojoReady, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, createEntry, listItem, template,
              mainCss) {
        return declare("moduleSessionLoginInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            _interface: null,
            templateString: template,
            baseClass: "digivigilWWWGuestbookMainInterface",

            _mainCssString: mainCss,

            _guestbookData: [],
            _listDiv: null,

            _listItems: {},
            _createEntry: null,

            constructor: function (args) {
                this._interface = {};
                this._createEntry = {};
                this._guestbookData = {};
                this._listItems = {};

                declare.safeMixin(this, args);

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());

            },
            postCreate: function () {

                this._interface.requestGuestbookEntries();

            },
            updateGuestbookData: function (guestbookData) {
                if (guestbookData instanceof Array) {
                    this._guestbookData = guestbookData;

                    guestbookData.forEach(lang.hitch(this, function (entry) {
                        this.addOrUpdateListItem(entry);
                    }));
                } else {
                    this._guestbookData.push(guestbookData);
                    this.addOrUpdateListItem(guestbookData);
                }
            },
            addOrUpdateListItem: function (listItemData) {
                if (!(this._listItems[listItemData._id])) {
                    this._listItems[listItemData._id] = new listItem({
                        _interfaceKey: this._interfaceKey,
                        itemData: listItemData
                    });
                    domConstruct.place(this._listItems[listItemData._id].domNode, this._listDiv);
                }
            },
            _onAddEntryClicked: function (eventObject) {
                this._createEntry = new createEntry({_interface: this._interface});
                topic.publish("displayAsDialog", this._createEntry);
            },
            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ESCAPE:
                        this._interface.toggleShowView();
                        keyUpEvent.preventDefault();
                        break;
                }
            },
            unload: function () {
                if (this._createEntry.unload) {
                    this._createEntry.unload();

                }

                for (const listItem in this._listItems) {

                    this._listItems[listItem].unload();
                }
            }
        });
    });