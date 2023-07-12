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

        "balek-modules/digivigil/digiscan/Interface/capturePreviewView",
        'balek-modules/digivigil/digiscan/Interface/listControl',
        'balek-modules/digivigil/tabular/Interface/mainTable',
        'balek-modules/digivigil/tabular/Model/table',

        'balek-modules/digivigil/ui/about',


        'dojo/text!balek-modules/digivigil/digiscan/resources/html/main.html',
        'dojo/text!balek-modules/digivigil/digiscan/resources/css/main.css',

        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',

    ],
    function (declare, lang, topic, domClass, domStyle, domConstruct, win, fx, on, domAttr, dojoKeys,
              dijitFocus, dojoReady, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, capturePreviewView, listControl, Tabular, TableModel,
              AboutUI,
              template,
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
            _tabularContainer: null, //DomNode
            _tabularStatus: null,
            _tabularOutput: null,

            _statusDiv: null,

            _listControlContainer: null, //DomNode
            listControl: null,


            tableModel: null,
            MainTable: null,

            entries: null,                      //Objects by id

            availableEntries: null,             //SyncedMap
            availableEntriesWatchHandle: null,
            //interestedCaptures
            interestedCaptures: null,             //SyncedMap
            interestedCapturesWatchHandle: null,

            uiState: null,             //SyncedMap
            uiStateWatchHandle: null,

            captureSets: null,
          //  captureSetsWatchHandle: null,

            _EntryWidgets: null,
            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################
            constructor: function (args) {
                this._interface = {};
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


                this._interface.getAvailableEntries().then(lang.hitch(this, function(Entries){
                    this.availableEntries = Entries
                    this.availableEntriesWatchHandle = this.availableEntries.setStateWatcher(lang.hitch(this, this.onAvailableEntriesStateChange));
                })).catch(lang.hitch(this, function(Error){
                    console.log("Error this._interface.getAvailableEntries()", Error)
                }))

                this._interface.getInterestedCaptures().then(lang.hitch(this, function(interestedCaptures){
                    this.interestedCaptures = interestedCaptures
                    this.interestedCapturesWatchHandle = this.interestedCaptures.setStateWatcher(lang.hitch(this, this.onInterestedCapturesStateChange));
                    console.log("Interest captures")
                })).catch(lang.hitch(this, function(Error){
                    console.log("Error this._interface.getInterestedCaptures()", Error)
                }))


                this._interface.getUIState().then(lang.hitch(this, function(uiState){
                    this.uiState = uiState
                    this.uiStateWatchHandle = this.uiState.watch(lang.hitch(this, this.onUIStateChange));
                    this.refreshViews()
                })).catch(lang.hitch(this, function(Error){
                    console.log("Error this._interface.getAvailableEntries()", Error)
                }))


                this._interface.getCaptureSets().then(lang.hitch(this, function(captureSets){
                    // console.log("captureSetcaptureSetcaptureSet", captureSets)
                    //
                     this.captureSets = captureSets
                     this.captureSetsWatchHandle = this.captureSets.watch(lang.hitch(this, this.onCaptureSetsChange));
                     this.refreshViews()
                })).catch(lang.hitch(this, function(Error){
                    console.log("Error this._interface.getCaptureSets()", Error)
                }))

                if(this.listControl == null) {

                    //Create list control and insert it into menu
                    this.listControl = listControl({
                        interfaceCommands: this._interface,
                        listsController: this._interface,
                    })
                    domConstruct.place(this.listControl.domNode, this._listControlContainer, 'only')




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
                if( newState !== null && newState.capture)
                {

                    this.entries[id] = newState.capture
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



            },onInterestedCapturesStateChange:function (name, oldState, newState){
                console.log("onInterestedCapturesStateChange: name, oldState, newState",name, oldState, newState)

                let id = name.toString()
                if( newState !== null && newState.capture)
                {

                   // this.entries[id] = newState.entry
                    this.addOrUpdateEntryWidget(id)


                } else
                {


                    this.removeEntryWidget(id)
                   // this.entries[id] = undefined
                   // delete this.entries[id]
                    //console.log("deletedEntry")

                }

               // console.log("deletedEntry building string", this.entries, this.getTabSeperatedEntries())

                this.tableModel.setDataString(this.getTabSeperatedEntries())


            },

            onUIStateChange: function (name, oldState, newState) {

                console.log("onUIStateChange: name, oldState, newState",name, oldState, newState)

                if(name === "ActiveView" || name === "selectedCaptureSet" || name === "showHiddenCaptures")
                {

                    this.refreshViews()
                }


                if(name === "UIStatusText"){
                    this._statusDiv.innerHTML = newState
                }
            },
            onCaptureSetsChange: function (name, oldState, newState) {

                console.log("onCaptureSetsChange: name, oldState, newState",name, oldState, newState)



                    this.refreshViews()


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
                    this._EntryWidgets[id] = new capturePreviewView({
                        _interfaceKey: this._interfaceKey,
                        itemData: this.entries[id],
                        interfaceCommands: this._interface,
                        captureID: id
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
                this.makePreviewDivActive()

                //this.makePreviewDivActive()

            },
            _onActivateTabularView: function(){
                this.makeTabularDivActive()

                this._interface.setUIActiveView("tabularDiv");

            },
            _onRemoveClicked: function (eventObject) {
                this._interface.removeAllCaptures();

            },
            _onSaveOver: function (eventObject) {
                this.updateStatusText("Save captures as tab seperated text file")
            },
            _onCopyOver: function (eventObject) {
                this.updateStatusText("Copy captures as tab seperated text")
            },
            _onRemoveOver: function (eventObject) {
                this.updateStatusText("Remove all captures from database")
            },
            _onAboutClicked: function (eventObject) {
                new AboutUI();
            },
            _onAboutOver: function (){
                this.updateStatusText("About Scaptura")
            },
            _onMouseOutResetStatusText: function(){
                this.updateStatusText("")
            },
            updateStatusText: function(newText){
                if(this.uiState!==null && typeof newText === "string"){}
                {
                    this.uiState.set("UIStatusText", newText)
                }
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
                this._interface.setUIActiveView("tabularDiv");

            },
            makePreviewDivActive: function(){
                console.log("makePreviewDivActive")
                const previewDiv = this._previewDiv;
                const tabularDiv = this._tabularDiv;

                this.switchViews(tabularDiv, previewDiv);

                this._interface.setUIActiveView("previewDiv");


            },
            updatePreviewView: function(){
                if(this.uiState!==null && this.captureSets!==null && this._interface.availableEntries!==null){}
                {
                    const selectedCaptureSetID = this.uiState.get("selectedCaptureSet")
                    const selectedCaptureSet = this.captureSets.get(selectedCaptureSetID);


                    const showHiddenCaptures = this.uiState.get("showHiddenCaptures")


                    console.log("🚧🚧updatePreviewView", selectedCaptureSetID,selectedCaptureSet)

                    if(selectedCaptureSet && selectedCaptureSet.CaptureSet
                    && typeof selectedCaptureSet.CaptureSet.name === "string"
                        && typeof selectedCaptureSet.CaptureSet.appendAll === "boolean")
                    {
                        this._statusDiv.innerHTML = selectedCaptureSet.CaptureSet.name


                        let captures = selectedCaptureSet.CaptureSet.captures ? selectedCaptureSet.CaptureSet.captures : {}
                        let appendCaptures = selectedCaptureSet.CaptureSet.appendAll
                        let availableCaptures = this._interface.availableEntries
                        let visibleCaptureViews = {}
                        console.log("🚧🚧checking list", captures,availableCaptures)
                        domConstruct.empty(this._previewDiv)

                        availableCaptures.forEach( lang.hitch(this, function (key, value) {
                            console.log("🚧🚧availableCaptures.forEach", key, value, captures, selectedCaptureSet)

                            if (showHiddenCaptures || (captures[key] && captures[key].inSet === true)
                                || (!captures[key] && appendCaptures)){
                                captureView = this.getCaptureView(key)



                                if(!captures[key])
                                {
                                    //hopefully this doesn't happen but if it does, add to list
                                }



                                if(!captures[key].inSet)
                                {
                                    domClass.add(captureView.domNode, `${this.baseClass}CaptureNotInSet`)
                                }else{
                                    domClass.remove(captureView.domNode, `${this.baseClass}CaptureNotInSet`)
                                }



                                domConstruct.place(captureView.domNode, this._previewDiv);
                            }

                        }));

                        console.log("🚧🚧visibleCaptureViews list" , visibleCaptureViews)


                    }

                }


            },
            getCaptureView: function (id){
                console.log("🚧🚧getCaptureView!",  this._EntryWidgets, this._EntryWidgets[id] )

                if (!(this._EntryWidgets[id])) {
                    this._EntryWidgets[id] = new capturePreviewView({
                        _interfaceKey: this._interfaceKey,
                        //itemData: this.entries[id],
                        interfaceCommands: this._interface,
                        captureID: id

                    });
                    console.log("🚧🚧getCaptureView!",  this._EntryWidgets, this._EntryWidgets[id] )


                }
                return this._EntryWidgets[id];

            },

            refreshViews: function(){
                const activeView = this.uiState.get("ActiveView")

                this.updatePreviewView();


                const previewDiv = this._previewDiv;
                const tabularDiv = this._tabularDiv;
                console.log("switchViews", activeView)

                if(activeView === "previewDiv")
                {
                    this.switchViews(tabularDiv, previewDiv);
                }else if(activeView === "tabularDiv")
                {
                    this.switchViews(previewDiv, tabularDiv);
                }else {
                    console.log("switchViews", activeView)
                }
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


                //This should be an array of handles that get dealt with by superClass
                if(this.availableEntriesWatchHandle && this.availableEntriesWatchHandle.unwatch)
                {
                    this.availableEntriesWatchHandle.unwatch()

                }


                if(this.uiStateWatchHandle && this.uiStateWatchHandle.unwatch)
                {
                    this.uiStateWatchHandle.unwatch()

                }

                if(this.captureSetsWatchHandle && this.captureSetsWatchHandle.unwatch)
                {
                    this.captureSetsWatchHandle.unwatch()

                }

                for (const entryWidget in this._EntryWidgets) {
                    this._EntryWidgets[entryWidget].unload();
                }
            }
        });
    });