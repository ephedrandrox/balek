define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-style',
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

        "balek-modules/coopilot/saleTagScan/Interface/createEntry",
        "balek-modules/coopilot/saleTagScan/Interface/listItem",

        'dojo/text!balek-modules/coopilot/saleTagScan/resources/html/main.html',
        'dojo/text!balek-modules/coopilot/saleTagScan/resources/css/main.css'
    ],
    function (declare, lang, topic, domClass, domStyle, domConstruct, win, on, domAttr, dojoKeys,
              dijitFocus, dojoReady, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, createEntry, listItem, template,
              mainCss) {
        return declare("moduleSessionLoginInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            _interface: null,
            templateString: template,
            baseClass: "digivigilWWWSaleTagScanMainInterface",

            _mainCssString: mainCss,

            _saleTagScanData: [],
            _listDiv: null,
            _mainContentDiv: null,

            _listItems: {},
            _createEntry: null,

            constructor: function (args) {
                this._interface = {};
                this._createEntry = {};
                this._saleTagScanData = {};
                this._listItems = {};

                declare.safeMixin(this, args);

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());

            },
            postCreate: function () {

                this._interface.requestSaleTagScanEntries();

            },
            updateSaleTagScanData: function (saleTagScanData) {
                if (saleTagScanData instanceof Array) {
                    this._saleTagScanData = saleTagScanData;

                    saleTagScanData.forEach(lang.hitch(this, function (entry) {
                        this.addOrUpdateListItem(entry);
                    }));
                } else {
                    this._saleTagScanData.push(saleTagScanData);
                    this.addOrUpdateListItem(saleTagScanData);
                }
            },
            addOrUpdateListItem: function (listItemData) {
                if (!(this._listItems[listItemData._id])) {

                    this._listItems[listItemData._id] = new listItem({
                        _interfaceKey: this._interfaceKey,
                        itemData: listItemData
                    });
                    domConstruct.place(this._listItems[listItemData._id].domNode, this._listDiv);

                    this._mainContentDiv.scrollTop = this._mainContentDiv.scrollHeight;
                }
            },
            _onCopyClicked: function (eventObject) {
            let saleTagScanData =  this._saleTagScanData;
                let tabbedString = "" ;
                saleTagScanData.forEach(lang.hitch(this, function (entry) {
                    tabbedString += entry.note.replace(/(?:\r\n|\r|\n)/g, "\t") + "\n";
                }));


                     console.log('tabbed content: ', tabbedString);

                     this.copyToClipboard(tabbedString);



            },
            copyToClipboard: function (textToCopy){


            let node = domConstruct.create("div");
            node.innerHTML = "<pre>" + textToCopy +"</pre>";
            domStyle.set(node, "display", "float");
            domConstruct.place(node, win.body())

                if (window.getSelection) {
                    if (window.getSelection().empty) {  // Chrome
                        window.getSelection().empty();
                    } else if (window.getSelection().removeAllRanges) {  // Firefox
                        window.getSelection().removeAllRanges();
                    }
                } else if (document.selection) {  // IE?
                    document.selection.empty();
                }
            if (window.getSelection) {
                var range = document.createRange();
                range.selectNode(node);
                window.getSelection().addRange(range);
                let text =  window.getSelection().toString();
                console.log('Pasted content: ', text);
                document.execCommand("copy");
                alert("Tags Tabbed and copied to clipboard")
            }else {
                alert("Could not copy text!")
            }
                domConstruct.destroy(node);
        },
            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ESCAPE:
                      //  this._interface.toggleShowView();
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