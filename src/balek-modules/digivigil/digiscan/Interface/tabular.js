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

        'dojo/text!balek-modules/digivigil/digiscan/resources/html/tabular.html',
        'dojo/text!balek-modules/digivigil/digiscan/resources/css/tabular.css',

        "balek-modules/digivigil/digiscan/Interface/captureRowView",

    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, template,
              mainCss, CaptureRowView) {

        return declare("digivigilDigiscanCapturesTabularViewInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "digivigilDigiscanCapturesTabularViewInterface",

            _mainCssString: mainCss,

            interfaceCommands: null,
            mainInterface: null,

            contentDiv: null,
            uiState: null,             //SyncedMap
            uiStateWatchHandle: null,


           // capturesState: null,



            captureSets: null,
            captureSetsWatchHandle: null,
            currentCaptureSetWatchHandle: null,


            CaptureViews: null,

            constructor: function (args) {
                this.CaptureViews = {};

                declare.safeMixin(this, args);

              //  this.captureState =   this.interfaceCommands.getCaptures()

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());

            },
            postCreate: function () {

                if(this.interfaceCommands !== null )
                {
                    this.interfaceCommands.getCaptureSets().then(lang.hitch(this, function(captureSets){
                        this.captureSets = captureSets
                        this.captureSetsWatchHandle = this.captureSets.watch(lang.hitch(this, this.onCaptureSetsChange));
                        this.refreshUI()
                    })).catch(lang.hitch(this, function(Error){
                        console.log("Error this._interface.getCaptureSets()", Error)
                    }))

                    this.interfaceCommands.getUIState().then(lang.hitch(this, function(uiState){
                        this.uiState = uiState
                        this.uiStateWatchHandle = this.uiState.watch(lang.hitch(this, this.onUIStateChange));
                        this.refreshUI()
                    })).catch(lang.hitch(this, function(Error){
                        console.log("Error this._interface.getAvailableEntries()", Error)
                    }))
                }

            },
            //##########################################################################################################
            //State Change Event Functions Section
            //##########################################################################################################
            onCaptureSetsChange: function (name, oldValue, newValue) {
                this.refreshUI()

                //todo: watch the current capture set

            },
            onUIStateChange: function( name, oldValue, newValue ) {
                this.refreshUI()
            },
            onClearCapturesFromSetOver: function(){
                if(this.mainInterface !== null  && typeof this.mainInterface.updateStatusText === 'function') {
                    this.mainInterface.updateAllStatusText("Clear all captures from set")
                }else{
                    console.log(this.mainInterface)
                }
            },

            _onClearCapturesFromSet: function(){
                if(this.uiState != null) {
                    let selectedCaptureSet = this.uiState.get("selectedCaptureSet")
                    if(selectedCaptureSet)
                    {
                        this.interfaceCommands.clearCaptureSet(selectedCaptureSet);
                    }else{
                        alert("Select a capture set first")
                    }
                }
            },
            onShowHiddenCapturesOver: function(overEvent) {
                if(this.mainInterface !== null  && typeof this.mainInterface.updateStatusText === 'function') {

                    if(this.uiState !== null) {
                        let showingHiddenCaptures = this.uiState.get("showingHiddenCaptures")
                        if(showingHiddenCaptures ){
                            this.mainInterface.updateAllStatusText("Hide Captures not in Set")
                        }else {
                            this.mainInterface.updateAllStatusText("Show Captures not in Set")
                        }
                    }



                }else{
                    console.log(this.mainInterface)
                }

            },
            onShowHiddenCaptures: function(clickEvent){
                if(this.uiState !== null) {
                    let showingHiddenCaptures = this.uiState.get("showingHiddenCaptures")
                    if(showingHiddenCaptures ){
                        this.uiState.set("showingHiddenCaptures", false)
                        this.interfaceCommands.showHiddenCaptures( false,lang.hitch(this, function(commandResult){
                        }))
                        this.mainInterface.updateAllStatusText("Show Captures not in Set")

                    }else {
                        this.uiState.set("showingHiddenCaptures", true)
                        this.interfaceCommands.showHiddenCaptures( true, lang.hitch(this, function(commandResult){
                        }))
                        this.mainInterface.updateAllStatusText("Hide Captures not in Set")

                    }
                }

            },
            onCopyCodeListOver: function(overEvent) {
                if(this.mainInterface !== null  && typeof this.mainInterface.updateStatusText === 'function') {
                    this.mainInterface.updateAllStatusText("Copy Comma Seperated Values")
                }else{
                    console.log(this.mainInterface)
                }

            },
            _onMouseOutResetStatusText: function(overEvent) {
                if(this.mainInterface !== null  && typeof this.mainInterface.updateStatusText === 'function') {
                    this.mainInterface.updateAllStatusText("")
                }else{
                    console.log(this.mainInterface)
                }

            },
            onCopyCodeListClick: function(clickEvent) {

                if(this.mainInterface !== null  && typeof this.mainInterface.forEachSelectedCapture === 'function') {
                    let barcodeList = ""
                    this.mainInterface.forEachSelectedCapture(lang.hitch(this, function (captureID) {

                        if(captureID){
                            let capture  =  this.interfaceCommands.getCaptures().getCaptureByID(captureID)
                            if(capture && typeof capture.get === "function"){
                                const barcode = capture.get("barcode");
                                if(typeof barcode === "string" && barcode !== "")
                                {
                                    barcodeList += barcode + ","
                                }
                            }
                        }



                    }));
                    this.mainInterface.copyTextToClipboard(barcodeList.slice(0, -1))




                }
            },
            //##########################################################################################################
            //UI Update Functions Section
            //##########################################################################################################
            refreshUI: function()
            {
                if(this.mainInterface !== null  && typeof this.mainInterface.forEachSelectedCapture === 'function') {
                    domConstruct.empty(this.contentDiv)
                    this.mainInterface.forEachSelectedCapture(lang.hitch(this, function (captureID) {
                        let captureView =  this.getCaptureView(captureID)
                        dojoReady(lang.hitch(this, function () {
                            domConstruct.place(captureView.domNode, this.contentDiv);
                        }));
                    }));
                }
            },
            getCaptureView: function (id){
                if (!(this.CaptureViews[id])) {
                    this.CaptureViews[id] = new CaptureRowView({
                        _interfaceKey: this._interfaceKey,
                        interfaceCommands: this.interfaceCommands,
                        mainInterface: this.mainInterface,
                        captureID: id
                    });
                }
                return this.CaptureViews[id];
            },
            unload: function () {
                this.destroy();
            }


        });
    });