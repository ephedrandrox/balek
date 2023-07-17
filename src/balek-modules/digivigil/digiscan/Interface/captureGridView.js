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

        'dojo/text!balek-modules/digivigil/digiscan/resources/html/captureGridView.html',
        'dojo/text!balek-modules/digivigil/digiscan/resources/css/captureGridView.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, template,
              mainCss) {

        return declare("digivigilDigiscanCaptureViewInterface", [_WidgetBase, _TemplatedMixin], {
            baseClass: "digivigilDigiscanCaptureViewInterface",
            _instanceKey: null,

            templateString: template,
            _mainCssString: mainCss,

            _barcodeDiv: null,
            _noteDiv: null,                 //domNode
            _createdText: null,             //domNode
            _barcodeText: null,             //domNode
            _recognizedText: null,          //domNode
            _noteText: null,                //domNode

            interestedButton: null,         //domNode
            uninterestedButton: null,       //domNode

            interfaceCommands: null,        //passed argument

            captureID: null,                //passed argument
            captureState: null,             //loaded Stateful
            captureStateWatchHandle: null,  //set


            uiState: null,                  //loaded Stateful
            uiStateWatchHandle: null,       //set


            currentCaptureSetWatchHandle: null, //multiple sets

            constructor: function (args) {

                declare.safeMixin(this, args);

                if(this.captureID && this.interfaceCommands){
                    this.captureState =   this.interfaceCommands.getCaptures().getCaptureByID(this.captureID)
                    this.captureStateWatchHandle = this.captureState.watch(lang.hitch(this, this.onCaptureStateChange))

                    //this.captureSets = this.interfaceCommands.getCaptureSets()
                    this.reloadViewFromState()
                }

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this.domNode);
                }));

            },
            onCaptureStateChange: function(name, oldValue, newValue){
                this.reloadViewFromState()
            },
            setCurrentCaptureListWatcher: function(){
                //if a handle has been set, shut it down
                if(this.currentCaptureSetWatchHandle !== null){
                    this.currentCaptureSetWatchHandle.unwatch()
                    this.currentCaptureSetWatchHandle.remove()
                }
                //Check that we can get the current selected capture Set ID
                if(this.uiState!==null ) {
                    const selectedCaptureSetID = this.uiState.get("selectedCaptureSet")
                    if(selectedCaptureSetID)
                    {
                        const captureSet = this.interfaceCommands.getCaptureSetsController().getCaptureSetByID(selectedCaptureSetID);
                        if(captureSet)
                        {
                            this.currentCaptureSetWatchHandle = captureSet.watch(
                                lang.hitch(this, function(name, oldValue, newValue){
                                this.reloadViewFromState()
                            }))
                        }
                    }
                }

            },
            postCreate: function () {
                this.interfaceCommands.getUIState().then(lang.hitch(this, function(uiState){
                    this.uiState = uiState
                    this.uiStateWatchHandle = this.uiState.watch(lang.hitch(this, this.onUIStateChange));
                    this.setCurrentCaptureListWatcher()
                    this.reloadViewFromState()
                })).catch(lang.hitch(this, function(Error){
                    console.warn("Error interfaceCommands getUIState() from captureGridView", Error)
                }))
            },
            onUIStateChange: function(name, oldValue, newValue){
                if("selectedCaptureSet")
                {
                    this.setCurrentCaptureListWatcher()
                }
                this.reloadViewFromState()
            },
            onCaptureSetsChange: function(name, oldValue, newValue){
                this.reloadViewFromState()
            },
            reloadViewFromState: function()
            {
                //Needs Capture State and UI State
                if(this.captureState !== null
                    && this.uiState !== null) {
                    const dateString = this.captureState.get("created");
                    const date = new Date(dateString);

                    //Set data by node handles
                    this._createdText.innerHTML = date.toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric'
                    });

                    let barcode = this.captureState.get("barcode");
                    if(barcode && barcode !== ""){
                        domStyle.set(this._barcodeDiv, "display", "block")
                        this._barcodeText.innerHTML = barcode
                    }else{
                        domStyle.set(this._barcodeDiv, "display", "none")
                    }
                    this._recognizedText.innerHTML = this.captureState.get("recognizedText");

                    let note = this.captureState.get("note");
                    if(note && note !== ""){
                        domStyle.set(this._noteDiv, "display", "block")
                        this._noteText.innerHTML = note
                    }else{
                        domStyle.set(this._noteDiv, "display", "none")
                    }

                    //get the selected Capture Set
                    const selectedCaptureSetID = this.uiState.get("selectedCaptureSet")
                    const captureSet = this.interfaceCommands.getCaptureSetsController().getCaptureSetByID(selectedCaptureSetID);

                    if (captureSet) {
                        let captureInSet  = captureSet.get(this.captureID)
                        //if capture is in set
                        if (captureInSet === true) {
                            //Set Class and show correct set/unset toggle button
                            domClass.remove(this.domNode, `${this.baseClass}CaptureNotInSet`)
                            domStyle.set(this.interestedButton, "display", "none")
                            domStyle.set(this.uninterestedButton, "display", "inline-block")
                        } else {
                            //Set Class and show correct set/unset toggle button
                            domClass.add(this.domNode, `${this.baseClass}CaptureNotInSet`)
                            domStyle.set(this.interestedButton, "display", "inline-block")
                            domStyle.set(this.uninterestedButton, "display", "none")
                        }
                    }

                }

            },
            onInterestedClick: function(clickEvent){
                //Called from HTML Click to unset capture from set
                if(this.uiState !== null) {
                    let selectedCaptureSetID = this.uiState.get("selectedCaptureSet")
                    if(selectedCaptureSetID){
                        //Send Command to add capture from capture set
                        this.interfaceCommands.addCaptureToSet(selectedCaptureSetID, this.captureID, lang.hitch(this, function(commandResult){
                        }))
                        //Update State before it is updated from Instance
                        const captureSet = this.interfaceCommands.getCaptureSetsController().getCaptureSetByID(selectedCaptureSetID);
                        if(captureSet){
                            captureSet.set(this.captureID, true)
                        }
                    }
                }
            },
            onUninterestedClick: function(clickEvent){
                //Called from HTML Click to set capture to set
                if(this.uiState !== null) {
                    let selectedCaptureSetID = this.uiState.get("selectedCaptureSet")
                    if(selectedCaptureSetID){
                        //Send Command to remove capture from capture set
                        this.interfaceCommands.removeCaptureFromSet(selectedCaptureSetID, this.captureID, lang.hitch(this, function(commandResult){
                        }))
                        //Update State before it is updated from Instance
                        const captureSet = this.interfaceCommands.getCaptureSetsController().getCaptureSetByID(selectedCaptureSetID);
                        if(captureSet){
                            captureSet.set(this.captureID, false)
                        }
                    }
                }
            },
            _onFocus: function () {
                //todo make it do something
            },
            unload: function () {
                if(this.currentCaptureSetWatchHandle !== null){
                    this.currentCaptureSetWatchHandle.unwatch()
                    this.currentCaptureSetWatchHandle.remove()
                }
                if(this.captureStateWatchHandle)
                {
                    this.captureStateWatchHandle.unwatch()
                    this.captureStateWatchHandle.remove()
                }
                if(this.uiStateWatchHandle)
                {
                    this.uiStateWatchHandle.unwatch()
                    this.uiStateWatchHandle.remove()
                }

                this.destroy();
            }


        });
    });