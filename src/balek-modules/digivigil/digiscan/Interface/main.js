define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-style',
        'dojo/dom-construct',
        "dojo/_base/window",
        "dojo/_base/fx",

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
        'balek-modules/digivigil/tabular/Interface/mainTable',
        'balek-modules/digivigil/tabular/Model/table',


        'dojo/text!balek-modules/digivigil/digiscan/resources/html/main.html',
        'dojo/text!balek-modules/digivigil/digiscan/resources/css/main.css',

        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',

    ],
    function (declare, lang, topic, domClass, domStyle, domConstruct, win, fx, on, domAttr, dojoKeys,
              dijitFocus, dojoReady, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, createEntry, listItem, Tabular, TableModel, template,
              mainCss,
              _SyncedCommanderInterface, _BalekWorkspaceContainerContainable) {
        return declare("moduleSessionLoginInterface", [_WidgetBase, _TemplatedMixin, _SyncedCommanderInterface, _BalekWorkspaceContainerContainable], {
            _instanceKey: null,
            _interface: null,
            baseClass: "digivigilDigiscanMainInterface",

            templateString: template,
            _mainCssString: mainCss,

            _previewDiv: null,                     //DomNode
            _tabularDiv: null, //DomNode
            _createEntry: null,                 //Widget
            _tabularContainer: null, //DomNode
            _tabularStatus: null,
            _tabularOutput: null,

            tableModel: null,
            MainTable: null,

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

                this.tableModel = new TableModel({
                    mostValuesInAnyLine: 0,
                    headerStart : 0,
                    footerStart : 0
                });

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


                if(this.MainTable == null)
                {
                    this.MainTable = Tabular({tableModel: this.tableModel,
                        domStatusDiv: this._tabularStatus,
                        outputPreviewPane: this._tabularOutput
                    })
                    console.log("MainTable was created", this.MainTable)

                    domConstruct.place(this.MainTable.domNode, this._tabularContainer, 'only')
                }else{
                    console.log("MainTable already exists", this.MainTable)
                }

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

                this.tableModel.setDataString(this.getTabSeperatedEntries())

            },

            getTabSeperatedEntries: function(){
                let entriesArray =  Object.keys(this.entries).map(key => this.entries[key]);

                let tabbedString = "" ;
                entriesArray.forEach(lang.hitch(this, function (entry) {
                    tabbedString += entry.recognizedText.replace(/(?:\r\n|\r|\n)/g, "\t") + "\n";
                }));
                return tabbedString
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
                    console.log("_EntryWidgets", id, this._previewDiv, this._EntryWidgets, this._EntryWidgets[id].domNode);
                    domConstruct.place(this._EntryWidgets[id].domNode, this._previewDiv);
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
            _onExportClicked: function (eventObject) {

                // domStyle.set(this._previewDiv, "display", "none");
                // domStyle.set(this._tabularDiv, "display", "inherit");
                this.toggleViews()
            },
            _onRemoveClicked: function (eventObject) {
                this._interface.removeEntries();

            },

            _onSaveClicked: function (eventObject) {
                let saleTagScanData =  Object.keys(this.entries).map(key => this.entries[key]);

                let tabbedString = "" ;
                saleTagScanData.forEach(lang.hitch(this, function (entry) {
                    tabbedString += entry.recognizedText.replace(/(?:\r\n|\r|\n)/g, "\t") + "\n";
                }));


                console.log('tabbed content: ', tabbedString);


                this.createTabbedDataDownload(tabbedString);

            },

            _onCopyClicked: function (eventObject) {
                let saleTagScanData =  Object.keys(this.entries).map(key => this.entries[key]);
                let tabbedString = "" ;
                saleTagScanData.forEach(lang.hitch(this, function (entry) {
                    tabbedString += entry.recognizedText.replace(/(?:\r\n|\r|\n)/g, "\t") + "\n";
                }));


                console.log('tabbed content: ', tabbedString);

                this.copyToClipboard(tabbedString);



            },
            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################
            toggleViews: function () {
            // Get references to the elements you want to toggle
            const previewDiv = this._previewDiv;
            const tabularDiv = this._tabularDiv;


            // Get the current display property of the elements
            const previewDisplay = domStyle.get(previewDiv, "visibility");

            // Check the current state and determine the next state
            const nextPreviewState = previewDisplay === "hidden" ? "inherit" : "hidden";

                let fadeOutNode = nextPreviewState === "hidden" ? previewDiv : tabularDiv;
                let fadeInNode = nextPreviewState === "hidden" ? tabularDiv : previewDiv
console.log(fadeOutNode, fadeInNode, nextPreviewState)
            // Use the fade animation from the dojo/fx module
            const fadeOutAnimation = fx.fadeOut({
                node: fadeOutNode ,
                duration: 100,
                onEnd: function(){
                    domStyle.set(fadeOutNode, "opacity", 0);
                    domStyle.set(fadeOutNode, "visibility", "hidden");
                }
            });
            const fadeInAnimation = fx.fadeIn({
                node: fadeInNode ,
                duration: 100,
                onBegin: function(){
                    domStyle.set(fadeInNode, "opacity", 0);

                    domStyle.set(fadeInNode, "visibility", "inherit");
                }
            });


            // Start the fade animation
            fadeOutAnimation.play();
                fadeInAnimation.play();

            },
            createTabbedDataDownload: function (tabbedData){
                var element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(tabbedData));
                element.setAttribute('download', "Digivigil Data.txt");

                element.style.display = 'none';
                document.body.appendChild(element);

                element.click();

                document.body.removeChild(element);
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