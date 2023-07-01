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

            uiState: null,             //SyncedMap
            uiStateWatchHandle: null,

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

                this._interface.getUIState().then(lang.hitch(this, function(uiState){
                    this.uiState = uiState
                    this.uiStateWatchHandle = this.uiState.setStateWatcher(lang.hitch(this, this.onUIStateChange));
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
                if( newState !== null && newState.entry)
                {

                    this.entries[id] = newState.entry
                    this.addOrUpdateEntryWidget(id)


                } else
                {


                    this.removeEntryWidget(id)
                    this.entries[id] = undefined
                    delete this.entries[id]
                    console.log("deletedEntry")

                }

                console.log("deletedEntry building string", this.entries, this.getTabSeperatedEntries())

                this.tableModel.setDataString(this.getTabSeperatedEntries())



            },
            onUIStateChange: function (name, oldState, newState) {

                console.log("onUIStateChange: name, oldState, newState",name, oldState, newState)

                if(name === "ActiveView")
                {
                    if(newState === "previewDiv")
                    {
                        this.makePreviewDivActive()
                    }else if(newState === "tabularDiv")
                    {
                        this.makeTabularDivActive()
                    }
                }

            },

            getTabSeperatedEntries: function(){
                let entriesArray =  Object.keys(this.entries).map(key => this.entries[key]);
                console.log("deletedEntry building string", this.entries, entriesArray)

                let tabbedString = "" ;
                entriesArray.forEach(lang.hitch(this, function (entry) {
                    console.log("deletedEntry building string", this.entries, entry)

                    if( entry && entry.recognizedText){
                        tabbedString += entry.barcode + "\t" + entry.recognizedText.replace(/(?:\r\n|\r|\n)/g, "\t") + "\n";

                    }
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
            removeEntryWidget(id){
                if (this._EntryWidgets[id]) {

                    domConstruct.destroy(this._EntryWidgets[id].domNode, this._previewDiv);


                    this._EntryWidgets[id] = undefined;
                    console.log("Removed ENtryWIdget", id);
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
            // _onExportClicked: function (eventObject) {
            //
            //     // domStyle.set(this._previewDiv, "display", "none");
            //     // domStyle.set(this._tabularDiv, "display", "inherit");
            //     this.toggleViews()
            // },
            _onActivatePreviewView: function(){
                this._interface.setUIActiveView("previewDiv");

                //this.makePreviewDivActive()

            },
            _onActivateTabularView: function(){
                this._interface.setUIActiveView("tabularDiv");

                //this.makeTabularDivActive()
            },
            _onRemoveClicked: function (eventObject) {
                this._interface.removeAllCaptures();

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
            makeTabularDivActive: function(){
                console.log("makeTabularDivActive")

                const previewDiv = this._previewDiv;
                const tabularDiv = this._tabularDiv;

                this.switchViews(previewDiv, tabularDiv);

            },
            makePreviewDivActive: function(){
                console.log("makePreviewDivActive")
                const previewDiv = this._previewDiv;
                const tabularDiv = this._tabularDiv;

                this.switchViews(tabularDiv, previewDiv);

            },
            switchViews: function(fadeOutNode, fadeInNode){
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
            toggleViews: function () {
                if(this.uiState !== null)
                {
                    let currentlyActiveDiv = this.uiState.get("ActiveView")
                    console.log("toggleViews",currentlyActiveDiv)
                    currentlyActiveDiv === "previewDiv" ? this._interface.setUIActiveView("tabularDiv")  : this._interface.setUIActiveView("previewDiv");

                }


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


                if(this.uiStateWatchHandle && this.uiStateWatchHandle.unwatch)
                {
                    this.uiStateWatchHandle.unwatch()

                }


                for (const entryWidget in this._EntryWidgets) {
                    this._EntryWidgets[entryWidget].unload();
                }
            }
        });
    });