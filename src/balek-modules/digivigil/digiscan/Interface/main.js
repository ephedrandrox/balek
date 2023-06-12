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

        "balek-modules/digivigil/digiscan/Interface/createEntry",
        "balek-modules/digivigil/digiscan/Interface/listItem",

        'dojo/text!balek-modules/digivigil/digiscan/resources/html/main.html',
        'dojo/text!balek-modules/digivigil/digiscan/resources/css/main.css',

        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',

    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, dojoKeys,
              dijitFocus, dojoReady, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, createEntry, listItem, template,
              mainCss,
              _SyncedCommanderInterface, _BalekWorkspaceContainerContainable) {
        return declare("moduleSessionLoginInterface", [_WidgetBase, _TemplatedMixin, _SyncedCommanderInterface, _BalekWorkspaceContainerContainable], {
            _instanceKey: null,
            _interface: null,
            baseClass: "digivigilDigiscanMainInterface",

            templateString: template,
            _mainCssString: mainCss,

            _listDiv: null,                     //DomNode
            _createEntry: null,                 //Widget

            entries: null,                      //Objects by id

            availableEntries: null,             //SyncedMap
            availableEntriesWatchHandle: null,

            _EntryWidgets: null,
            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################
            constructor: function (args) {
                this._interface = {};
                this._createEntry = {};
                this._digiscanData = {};
                this._EntryWidgets = {};

                this.entries = {}

                declare.safeMixin(this, args);
                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());

            },
            postCreate: function () {
                this.initializeContainable();
                this._interface.getAvailableEntries().then(lang.hitch(this, function(Entries){
                    this.availableEntries = Entries
                    this.availableEntriesWatchHandle = this.availableEntries.setStateWatcher(lang.hitch(this, this.onAvailableEntriesStateChange));
                })).catch(lang.hitch(this, function(Error){
                    console.log("Error this._interface.getAvailableEntries()", Error)
                }))
            },
            startupContainable: function(){
                //called after containable is started
                console.log("startupContainable main Digiscan interface containable");
            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onAvailableEntriesStateChange: function (name, oldState, newState) {
                let id = name.toString()
                this.entries[id] = newState.entry
                this.addOrUpdateEntryWidget(id)
            },
            onNewEntry: function(id){
                this.addOrUpdateEntryWidget(id)
            },
            addOrUpdateEntryWidget: function (id) {
                if (!(this._EntryWidgets[id])) {
                    this._EntryWidgets[id] = new listItem({
                        _interfaceKey: this._interfaceKey,
                        itemData: this.entries[id]
                    });
                    console.log("_EntryWidgets", id, this._listDiv, this._EntryWidgets, this._EntryWidgets[id].domNode);
                    domConstruct.place(this._EntryWidgets[id].domNode, this._listDiv);
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

            _onRemoveClicked: function (eventObject) {
                this._interface.removeEntries();

            },

            _onSaveClicked: function (eventObject) {
                // let saleTagScanData =  this._saleTagScanData;
                //
                // let tabbedString = "" ;
                // saleTagScanData.forEach(lang.hitch(this, function (entry) {
                //     tabbedString += entry.note.replace(/(?:\r\n|\r|\n)/g, "\t") + "\n";
                // }));
                //
                //
                // console.log('tabbed content: ', tabbedString);
                //
                //
                // this.createTabbedDataDownload(tabbedString);

            },

            _onCopyClicked: function (eventObject) {
                // let saleTagScanData =  this._saleTagScanData;
                // let tabbedString = "" ;
                // saleTagScanData.forEach(lang.hitch(this, function (entry) {
                //     tabbedString += entry.note.replace(/(?:\r\n|\r|\n)/g, "\t") + "\n";
                // }));
                //
                //
                // console.log('tabbed content: ', tabbedString);
                //
                // this.copyToClipboard(tabbedString);



            },
            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################
            unload: function () {
                if (this._createEntry.unload) {
                    this._createEntry.unload();
                }

                if(this.availableEntriesWatchHandle && this.availableEntriesWatchHandle.unwatch)
                {
                    this.availableEntriesWatchHandle.unwatch()

                }

                for (const entryWidget in this._EntryWidgets) {
                    this._EntryWidgets[entryWidget].unload();
                }
            }
        });
    });