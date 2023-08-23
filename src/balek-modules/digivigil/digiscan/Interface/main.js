define(['dojo/_base/declare',
        'dojo/_base/lang',
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

        "balek-modules/digivigil/digiscan/Interface/captureDetailView",


        "balek-modules/digivigil/digiscan/Interface/captureGridView",
        'balek-modules/digivigil/digiscan/Interface/listControl',
        "balek-modules/digivigil/digiscan/Interface/tabular",

        'balek-modules/digivigil/tabular/Interface/mainTable',
        'balek-modules/digivigil/tabular/Model/table',
        'balek-modules/digivigil/ui/about',

        'dojo/text!balek-modules/digivigil/digiscan/resources/html/main.html',
        'dojo/text!balek-modules/digivigil/digiscan/resources/css/main.css',

        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',
    ],
    function (declare, lang, domStyle, domConstruct, win, fx,
              on, domAttr, dojoKeys, dijitFocus, dojoReady, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin,
              CaptureDetailView,
              captureGridView, listControl, TableView, Tabular, TableModel, AboutUI,
              template,
              mainCss,
              _SyncedCommanderInterface, _BalekWorkspaceContainerContainable) {
        return declare("scapturaMainInterface", [_WidgetBase, _TemplatedMixin, _SyncedCommanderInterface, _BalekWorkspaceContainerContainable], {
            _instanceKey: null,
            _interface: null,
            baseClass: "digivigilDigiscanMainInterface",

            templateString: template,
            _mainCssString: mainCss,

            Detail: null,

            _previewDiv: null,                     //DomNode
            _tabularDiv: null, //DomNode
            _detailDiv: null, //DomNode

            _noSelectionDiv: null,
           // _tabularContainer: null, //DomNode
           // _tabularStatus: null,
           // _tabularOutput: null,

            _statusDiv: null,

            _listControlContainer: null, //DomNode
            listControl: null,

            tableModel: null,
            MainTable: null,

            uiState: null,             //SyncedMap
            uiStateWatchHandle: null,

            captureSets: null,
            captureSetsWatchHandle: null,
            currentCaptureSetWatchHandle: null,
            lastCaptureSetIDWatched: null,

            CaptureViews: null,
            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################
            constructor: function (args) {
                this._interface = {};
                this._digiscanData = {};
                this.CaptureViews = {};
                this.tableModel = new TableModel({
                    mostValuesInAnyLine: 0,
                    headerStart : 0,
                    footerStart : 0
                });

                declare.safeMixin(this, args);
                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
            },
            postCreate: function () {
                this.initializeContainable();



                this.Detail =    new CaptureDetailView({
                    _interfaceKey: this._interfaceKey,
                    interfaceCommands: this._interface,
                    domNodeToPlaceIn: this._detailDiv
                });


                //Create the Main Table Widget
                if(this.MainTable == null)
                {
                    // this.MainTable = Tabular({tableModel: this.tableModel,
                    //     domStatusDiv: this._tabularStatus,
                    //     outputPreviewPane: this._tabularOutput
                    // })
                    this.MainTable = TableView({
                        _interfaceKey: this._interfaceKey,
                        interfaceCommands: this._interface,
                        mainInterface: this,
                    })
                   // console.log("MainTable was created", this.MainTable)
                    domConstruct.place(this.MainTable.domNode, this._tabularDiv, 'only')
                }else{
                   // console.log("MainTable already exists", this.MainTable)
                }

                //Create List Control Widget
                //Should be null but check anyway
                if(this.listControl == null) {
                    //Create list control Widget
                    this.listControl = listControl({
                        interfaceCommands: this._interface,
                        mainInterface: this,
                    })
                    // insert it into container
                    domConstruct.place(this.listControl.domNode, this._listControlContainer, 'only')
                }

                //Get UI State from the interface
                this._interface.getUIState().then(lang.hitch(this, function(uiState){
                    this.uiState = uiState
                    this.uiStateWatchHandle = this.uiState.watch(lang.hitch(this, this.onUIStateChange));
                    this.refreshViews()
                })).catch(lang.hitch(this, function(Error){
                    console.log("Error this._interface.getAvailableEntries()", Error)
                }))

                //Get Users Capture Sets List from interface
                this._interface.getCaptureSets().then(lang.hitch(this, function(captureSets){
                     this.captureSets = captureSets
                     this.captureSetsWatchHandle = this.captureSets.watch(lang.hitch(this, this.onCaptureSetsChange));
                     this.refreshViews()
                })).catch(lang.hitch(this, function(Error){
                    console.log("Error this._interface.getCaptureSets()", Error)
                }))

            },
            startupContainable: function(){
                //called after containable is started
                //keep stub for future use
            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onAvailableCapturesStateChange: function (name, oldState, newState) {
                console.log("onAvailableCapturesStateChange",name, oldState, newState)
                //his.refreshViews()
            },
            onUIStateChange: function (name, oldState, newState) {
                console.log("onUIStateChange",name, oldState, newState)

                //if active view, selected capture set or show hidden captures changed
                if(name === "ActiveView" || name === "selectedCaptureSet" || name === "showHiddenCaptures" || name === "selectedCaptures")
                {
                    this.refreshViews()
                    this.setCurrentCaptureSetWatcher()
                }
                //If just status text Changes then update the div
                if(name === "UIStatusText" ||  name === "showHelpfulHints"){

                 this.updateStatusTextView()

                }
            },

            onCaptureSetsChange: function (captureSetID, oldName, newName) {
                console.log("onCaptureSetsChange",captureSetID, oldName, newName)

                //if the users capture sets list changes
                    this.refreshViews()
            },
            setCurrentCaptureSetWatcher: function(){
                //refresh the view when the selected capture set changes
                //but first remove the previous watch event

                if(this.uiState!==null ) {
                    const selectedCaptureSetID = this.uiState.get("selectedCaptureSet")
                    if(selectedCaptureSetID && this.lastCaptureSetIDWatched !== selectedCaptureSetID){
                        this.lastCaptureSetIDWatched = selectedCaptureSetID
                        if(this.currentCaptureSetWatchHandle !== null){
                            this.currentCaptureSetWatchHandle.unwatch()
                            this.currentCaptureSetWatchHandle.remove()
                        }

                        const captureSet = this._interface.getCaptureSetsController().getCaptureSetByID(selectedCaptureSetID);
                        this.currentCaptureSetWatchHandle = captureSet.watch(lang.hitch(this, function(name, oldValue, newValue){
                            if(newValue === true)
                            {

                                let captureView = this.getCaptureView(name)
                                dojoReady(lang.hitch(this, function () {
                                    if(!this._previewDiv.contains(captureView.domNode))
                                    domConstruct.place(captureView.domNode, this._previewDiv);
                                }));

                            } else if(newValue === false) {



                            }else if (name === "filter")
                            {
                                console.log("currentCaptureSetWatchHandle filter settings",name, oldValue, newValue)
                            }
                            else{
                                console.warn("main captureSet.watch unexpected value",name, oldValue, newValue)

                            }

                           // this.refreshViews()
                        }))
                    }
                }
            },

            //##########################################################################################################
            //Widget Event Functions Section
            //##########################################################################################################

            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ESCAPE:
                        this._interface.toggleShowView();
                        keyUpEvent.preventDefault();
                        break;
                }
            },
            // _onActivatePreviewView: function(){
            //     this.makePreviewDivActive()
            // },
            // _onActivateTabularView: function(){
            //     this.makeTabularDivActive()
            //     this._interface.setUIActiveView("tabularDiv");
            // },
            _onRemoveClicked: function (eventObject) {
                this._interface.removeAllCaptures();
            },
            _onSaveOver: function (eventObject) {
                this.updateStatusText("🔆 Click to Save Captures")
            },
            _onCopyOver: function (eventObject) {
                this.updateStatusText("🔆 Click to Copy Captures to Clipboard 📋")
            },
            _onRemoveOver: function (eventObject) {
                this.updateStatusText("🔆 Click to Remove All Captures From Server")
            },
            _onAboutClicked: function (eventObject) {
                // new AboutUI({interfaceCommands: this._interface,
                // mainInterface: this});

                if(eventObject.altKey )
                {
                    this._interface.hideSettings()
                }else {
                    this._interface.showSettings()}

            },
            _onAboutOver: function (){
                this.updateStatusText("🔆 Show Control Panel")
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
            updateAllStatusText: function(newStatusText){
                if(this.uiState!==null && typeof newStatusText === "string"){}
                {
                    this.uiState.set("UIStatusText", newStatusText)
                    //this.uiState.set("UIListControlStatusText", newStatusText)

                }
            },
            updateListControlStatusText: function(newText){
                if(this.uiState!==null && typeof newText === "string"){}
                {
                    this.uiState.set("UIListControlStatusText", newText)
                }
            },
            _onSaveClicked: function (eventObject) {

                let tabbedString = this.getTabSeperatedEntries()
                this.createTabbedDataDownload(tabbedString);

            },
            _onCopyClicked: function (eventObject) {
                let tabbedString = this.getTabSeperatedEntries()
                this.copyToClipboard(tabbedString);

            },
            //##########################################################################################################
            //Interface Commands Functions Section
            //##########################################################################################################
            makeTabularDivActive: function(){
                const previewDiv = this._previewDiv;
                const tabularDiv = this._tabularDiv;
                this.switchViews(previewDiv, tabularDiv);
                this._interface.setUIActiveView("tabularDiv");
            },
            makePreviewDivActive: function(){
                const previewDiv = this._previewDiv;
                const tabularDiv = this._tabularDiv;
                this.switchViews(tabularDiv, previewDiv);
                this._interface.setUIActiveView("previewDiv");
            },
            //##########################################################################################################
            //UI Update Functions Section
            //##########################################################################################################
            refreshViews: function(){

                if(this.uiState != null) {
                    console.log("refreshing view")

                    const activeView = this.uiState.get("ActiveView")
                    const selectedCaptures = this.uiState.get("selectedCaptures")


                    this.tableModel.setDataString(this.getTabSeperatedEntries())

                    const previewDiv = this._previewDiv;
                    const tabularDiv = this._tabularDiv;
                    const noSelectionDiv = this._noSelectionDiv

                    if (activeView === "previewDiv") {
                        this.switchViews(tabularDiv, previewDiv);
                        this.updatePreviewViews();
                    } else if (activeView === "tabularDiv") {
                        this.switchViews(previewDiv, tabularDiv);
                        if(this.MainTable !== null)
                        {
                            this.MainTable.refreshUI();
                        }
                    } else {
                        console.log("switchViews unexpected", activeView)
                    }
                    let selectedCaptureSet = this.uiState.get("selectedCaptureSet")

                    if (selectedCaptureSet
                        && this.captureSets && this.captureSets[selectedCaptureSet]
                    ) {
                        domStyle.set(previewDiv, "visibility", "inherit")
                       domStyle.set(tabularDiv, "visibility", "inherit")
                        domStyle.set(noSelectionDiv, "display", "none")

                    } else {
                        domStyle.set(previewDiv, "visibility", "hidden")
                        domStyle.set(tabularDiv, "visibility", "hidden")
                        domStyle.set(noSelectionDiv, "display", "inline-block")

                    }


                    if (Array.isArray(selectedCaptures)
                        && selectedCaptures.length > 0
                        && activeView === "previewDiv" ) {
                        //then
                        domStyle.set(this._detailDiv, "width", "inherit")
                    }else {
                        domStyle.set(this._detailDiv, "width", "0")
                    }

                }
            },
            updateStatusTextView: function()
            {


                if(this.uiState != null) {
                    const showHelpfulHints = this.uiState.get("showHelpfulHints")
                    const UIStatusText = this.uiState.get("UIStatusText")

                    if(UIStatusText === "" || UIStatusText === undefined ||
                        showHelpfulHints === false || showHelpfulHints === undefined)
                    {
                        domStyle.set(this._statusDiv, "display", "none" )
                    }else {
                        domStyle.set(this._statusDiv, "display", "block" )
                        this._statusDiv.innerHTML = UIStatusText
                    }




                }


            },
            updatePreviewViews: function(){
                domConstruct.empty(this._previewDiv)
                    this.forEachSelectedCapture(lang.hitch(this, function(captureID){
                       let captureView = this.getCaptureView(captureID)
                            dojoReady(lang.hitch(this, function () {
                                domConstruct.place(captureView.domNode, this._previewDiv);
                            }));
                    }));
            },
            getCaptureView: function (id){
                if (!(this.CaptureViews[id])) {
                    this.CaptureViews[id] = new captureGridView({
                        _interfaceKey: this._interfaceKey,
                        interfaceCommands: this._interface,
                        captureID: id
                    });
                }
                return this.CaptureViews[id];

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
            //##########################################################################################################
            //Export and Data Functions Section
            //##########################################################################################################
            getTabSeperatedEntries: function(){
                //let tabbedString = "barcode\tnote\tdateString\trecognizedText\t\n" ;
                let csvContent = "Barcode,Note,Date,RecognizedText\n";

                this.forEachSelectedCapture(lang.hitch(this, function(captureID){
                    if(captureID){
                        let capture  =  this._interface.getCaptures().getCaptureByID(captureID)
                        if(capture && typeof capture.get === "function"){
                            const barcode = capture.get("barcode");
                            const note = capture.get("note");
                            const dateString = capture.get("created");
                            const recognizedText = capture.get("recognizedText");
                            if(typeof recognizedText === "string")
                            {
                                // const encodedString = recognizedText.replace(/\n/g, '\\n')
                                // //  tabbedString += barcode + "\t" + recognizedText.replace(/(?:\r\n|\r|\n)/g, "\t") + "\n";
                                // tabbedString += barcode + "\t" + note + "\t" +  dateString + "\t" +encodedString+ "\n";
                                // const encodedRecognizedText = recognizedText.replace(/\n/g, '\n');
                                // tabbedString +=
                                //     barcode + "\t" +
                                //     '"' + note.replace(/"/g, '""') + '"' + "\t" +
                                //     dateString + "\t" +
                                //     '"' + encodedRecognizedText.replace(/"/g, '""') + '"' + "\t\n";


                                const encodedNote = note.replace(/"/g, '""').replace(/\r?\n/g, '\n');
                                const encodedRecognizedText = recognizedText.replace(/"/g, '""').replace(/\r?\n/g, '\n');
                                csvContent +=
                                    barcode + ',"' +
                                    encodedNote + '",' +
                                    dateString + ',"' +
                                    encodedRecognizedText + '"\n';
                            }
                        }
                    }

                }))
                //return tabbedString
                return csvContent
            },
            forEachSelectedCapture: function(doThis)
            {

                //todo move this to interface controller
                //and change entries to captures
                if(typeof doThis === 'function' && this.uiState!==null && this.captureSets!==null && this._interface.availableCaptures!==null)
                {
                    const selectedCaptureSetID = this.uiState.get("selectedCaptureSet")
                    const captureSet = this._interface.getCaptureSetsController().getCaptureSetByID(selectedCaptureSetID);
                    const showHiddenCaptures = this.uiState.get("showHiddenCaptures")
                    if (captureSet ) {
                        let availableCaptures = this._interface.availableCaptures
                        availableCaptures.forEach(lang.hitch(this, function (key) {
                            let keyInCaptureSet = captureSet.get(key)

                            if (showHiddenCaptures || (keyInCaptureSet && keyInCaptureSet === true)) {
                                doThis(key)
                            }
                        }));
                    }
                }
            },
            createTabbedDataDownload: function (tabbedData){
                let element = document.createElement('a');
                element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(tabbedData));
                element.setAttribute('download', "Digivigil Data.csv");
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
             copyTextToClipboard: function(textToCopy) {
            // Create a temporary textarea element
            const textArea = document.createElement('textarea');
            textArea.value = textToCopy;
            textArea.setAttribute('readonly', '');
            textArea.style.position = 'absolute';
            textArea.style.left = '-9999px';
            document.body.appendChild(textArea);

            // Select the text inside the textarea
            textArea.select();

            try {
                // Use the Clipboard API to copy the text to the clipboard
                navigator.clipboard.writeText(textToCopy).then(() => {
                    console.log('Text copied to clipboard!');
                }, (err) => {
                    console.error('Unable to copy text:', err);
                });
            } catch (err) {
                console.error('Clipboard writeText method not available:', err);
            }

            // Clean up: Remove the temporary textarea from the DOM
            document.body.removeChild(textArea);
        },
            //##########################################################################################################
            //Widget Deconstruction Section
            //##########################################################################################################
            unload: function () {

                if(this.uiStateWatchHandle && this.uiStateWatchHandle.unwatch)
                {
                    this.uiStateWatchHandle.unwatch()

                }

                if(this.captureSetsWatchHandle && this.captureSetsWatchHandle.unwatch)
                {
                    this.captureSetsWatchHandle.unwatch()

                }

                if(this.currentCaptureSetWatchHandle !== null){
                    this.currentCaptureSetWatchHandle.unwatch()
                    this.currentCaptureSetWatchHandle.remove()
                }

                for (const captureView in this.CaptureViews) {
                    this.CaptureViews[captureView].unload();
                }
            }
        });
    });