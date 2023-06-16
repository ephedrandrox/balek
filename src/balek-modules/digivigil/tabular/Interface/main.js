define([//------------------------------|
        // Base Includes:---------------|
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/on',
        'dojo/query',
        //------------------------------|
        //Dom Includes:-----------------|
        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/dom-class",
        "dojo/dom-attr",
        "dojo/_base/window",
        //------------------------------|
        //Input Includes:---------------|
        "dojo/keys",
        //------------------------------|
        //Widget Declare Mixins:--------|
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",


        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',

        'balek-modules/digivigil/tabular/Model/table',
        'balek-modules/digivigil/tabular/Model/file',
        'balek-modules/digivigil/tabular/Interface/mainTable',


        'dojo/text!balek-modules/digivigil/tabular/resources/html/main.html',
        'dojo/text!balek-modules/digivigil/tabular/resources/css/main.css',
    ],
    function (declare,
              lang,
              topic,
              on,
              query,

              domConstruct,
              domStyle,
              domClass,
              domAttr,
              win,

              dojoKeys,

              _WidgetBase,
              _TemplatedMixin,


              _SyncedCommanderInterface,
              _BalekWorkspaceContainerContainable,

              TableModel,
              FileModel,
              MainTable,

              interfaceHTMLFile,
              interfaceCSSFile

              ) {

        return declare("moduleDigivigilTabularMainInterface", [_WidgetBase,_TemplatedMixin,_SyncedCommanderInterface,_BalekWorkspaceContainerContainable], {


            baseClass: "digivigilTabularInterface",

            templateCssString: interfaceCSSFile,
            templateString: interfaceHTMLFile,

            importCompleteCallback: null,

            MainTable: null,


            _autoTrimPane: null,
            _previewPane: null,
            _previewStatusDiv: null,
            _outputPane: null,
            _outputPreviewPane: null,
            _dropZone: null,

            _headerRowInput: null,
            _footerRowInput: null,




            headerStart: 0,
            footerStart: 0,
            autoTrim: false,
            valueSeparator: "\t",






            tableModel: null,
            tableModelState: null,
            tableModelStateWatchHandle: null,

            fileModel: null,
            fileModelState: null,
            fileModelStateWatchHandle: null,

            constructor: function (args) {


                declare.safeMixin(this, args);
                domConstruct.place(domConstruct.toDom("<style>" + this.templateCssString + "</style>"), win.body());

                //Main Table model and state
                this.tableModel = new TableModel({
                    mostValuesInAnyLine: this.mostValuesInALine,
                    headerStart : this.headerStart,
                    footerStart : this.footerStart,
                    valueSeparator: this.valueSeparator
                });
                this.tableModelState = this.tableModel.getModelState()
                this.tableModelStateWatchHandle = this.tableModelState.watch(lang.hitch(this, this.onTableModelStateChange))

                //File Model and State Handels
                this.fileModel = new FileModel({});
                this.FileModelState = this.fileModel.getModelState()
                this.FileModelStateWatchHandle = this.FileModelState.watch(lang.hitch(this, this.onFileModelStateChange))

                //Set Balek Container Name
                this.setContainerName("📥 - Importer");

            },
            //#####################################################
            //###   On Model State Changes
            onFileModelStateChange: function(name, oldState, newState) {
                console.log("📧 FileModelStateChange in main ⚡️", name, oldState, newState)
                if(name == "fileDataStringWhen"){
                    let newData= this.fileModel.getFileDataString()
                    this.tableModel.setDataString(newData)

                }
            },
            onTableModelStateChange: function(name, oldState, newState) {
                console.log("💌 TableModelStateChange in main ⚡️", name, oldState, newState)
                if(name == "dataProcessedWhen"){
                   this.refreshTable()
                    this.refreshInfo()
                }else if( name== "valueSeparator"){
                    this.refreshValueSeperatorStatus()
                }else if ( name == "headerStart" ||  name == "footerStart")
                {
                    this.refreshInfo()
                }
            },
            postCreate: function(){

                this.initializeContainable();

                on(this._dropZone, ["dragenter, dragstart, dragend, dragleave, dragover, drag, drop"], function (e) {
                       e.preventDefault()
                    e.stopPropagation()});

            },
            startupContainable: function(){
                console.log("startupContainable Tab Importer containable");
            },
            _onFocus: function(){

            },
            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        keyUpEvent.stopPropagation();
                        this.unload();
                        break;

                }
            },
            _onKeyDown: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();

                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        keyUpEvent.stopPropagation();
                        this.unload();
                        break;

                }
            },
            _onHeaderInputChange: function(){
            console.log("Changed",this._headerRowInput.value)
                this.tableModel.setHeaderRow(this._headerRowInput.value)

            },
            _onFooterInputChange: function(){
                console.log("Changed",this._footerRowInput.value)
                this.tableModel.setFooterRow(this._footerRowInput.value)

            },
            _onDropped: function(dropEvent){
                dropEvent.preventDefault()
                dropEvent.stopPropagation()

                let dataTransfer = dropEvent.dataTransfer
                let files = dataTransfer.files

                let file = files[0];


                if (file.type.match('text.*')) {
                    this.fileModel.readFile(file)
                } else {
                    alert("Not a Text File!");
                }



              //  this._textFile.files = files
                console.log("Dropped",files)
            },

            _autoTrimMouseDown: function(mouseEvent){
                let autoTrim = this.tableModel.getAutoTrim()
                this.tableModel.setAutoTrim(!autoTrim)
            },
            _onDragEnter: function(dragEvent){
                dragEvent.preventDefault()
                dragEvent.stopPropagation()
                console.log("In",dragEvent)
            },
            _onDragLeave: function(dragEvent){
                dragEvent.preventDefault()
                dragEvent.stopPropagation()
                console.log("Out",dragEvent)
            },

            _onSeparatorChoiceDown: function() {
                let seperatorChracter = this.tableModel.getValueSeparator()
                if (seperatorChracter == "\t")
                {
                    this.tableModel.setValueSeparator(",")
                }else
                {
                    this.tableModel.setValueSeparator("\t")
                }
            },

            refreshValueSeperatorStatus: function(){
                let seperatorChracter = this.tableModel.getValueSeparator()
                if (seperatorChracter == "\t")
                {
                    this._separatorChoicePane.innerHTML = "Tab"
                }else
                {
                    this._separatorChoicePane.innerHTML = "Comma"
                }
            },
            refreshUI: function(){
                this.refreshInfo()
                this.refreshTable()
            },
            refreshInfo: function(){
                this._headerRowInput.value = this.tableModel.getHeaderRow()
                this._footerRowInput.value = this.tableModel.getFooterRow()
                domAttr.set( this._headerRowInput,"max", this.tableModel.getLines().length)
                domAttr.set( this._footerRowInput,"max", this.tableModel.getLines().length)

                this._fileInfoDiv.innerHTML = this.fileModel.getFileName() + " " + this.fileModel.getFileSize() + " [ Lines:" + this.tableModel.getLines().length + " | Columns: " + this.tableModel.getMostValuesInAnyLine() + " ]"
                let infoString = this.fileModel.getFileName() + " " + this.fileModel.getFileSize() + " [ Lines:" + this.tableModel.getLines().length + " | Columns: " + this.mostValuesInLine + " ]"
                this.setContainerName("📥 - Importing "+ infoString);
            },
            refreshTable: function(){
                if(this.MainTable == null)
                {
                    this.MainTable = MainTable({tableModel: this.tableModel,
                                                domStatusDiv: this._previewStatusDiv,
                                                outputPreviewPane: this._outputPreviewPane
                    })
                    console.log("MainTable was created", this.MainTable)

                    domConstruct.place(this.MainTable.domNode, this._previewPane, 'only')
                }else{
                    console.log("MainTable already exists", this.MainTable)
                }
            },

            getWorkspaceDomNode: function () {
                return this.domNode;
            },
            unload: function () {
                //unwatch states
                this.tableModelStateWatchHandle.unwatch()
                this.tableModelStateWatchHandle.remove()
                this.FileModelStateWatchHandle.unwatch()
                this.FileModelStateWatchHandle.remove()
                //call destroy function
                this.destroy();
            }
        });
    }
);



