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

        'dojo/text!balek-modules/digivigil/digiscan/resources/html/capturePreviewView.html',
        'dojo/text!balek-modules/digivigil/digiscan/resources/css/capturePreviewView.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, template,
              mainCss) {

        return declare("digivigilDigiscanCaptureViewInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "digivigilDigiscanCaptureViewInterface",

            _noteDiv: null,
            _mainCssString: mainCss,

            _createdText: null,
            _barcodeText: null,
            _recognizedText: null,
            _noteText: null,

            interestedButton: null,
            uninterestedButton: null,

            interfaceCommands: null,

            captureID: null,
            captureState: null,
            captureStateWatchHandle: null,


            uiState: null, //SyncedMap
            uiStateWatchHandle: null,

            captureSets: null,
              captureSetsWatchHandle: null,

            currentCaptureSetWatchHandle: null,

            constructor: function (args) {

                declare.safeMixin(this, args);
                if(this.itemData && this.itemData.timeStamps && this.itemData.timeStamps.created )
                {
                  ///  this.itemData.created = (new Date(parseInt(this.itemData.created))).toString()

                    const createdDate = new Date(this.itemData.timeStamps.created);
                    const formattedDate = createdDate.toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric'
                    });

                    //this.itemData.timeStamps.created = formattedDate

                }



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
                console.log("Captures synced onCaptureStateChange", name, oldValue, newValue)

                this.reloadViewFromState()
            },
            setCurrentCaptureListWatcher: function(){



                if(this.currentCaptureSetWatchHandle !== null){
                    this.currentCaptureSetWatchHandle.unwatch()
                    this.currentCaptureSetWatchHandle.remove()
                }

                if(this.uiState!==null ) {
                    const selectedCaptureSetID = this.uiState.get("selectedCaptureSet")
                    if(selectedCaptureSetID)
                    {
                        const captureSet = this.interfaceCommands.getCaptureSetsController().getCaptureSetByID(selectedCaptureSetID);

                        this.currentCaptureSetWatchHandle = captureSet.watch(lang.hitch(this, function(name, oldValue, newValue){
                            this.reloadViewFromState()

                        }))
                    }

                }



            },
            postCreate: function () {
                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this.domNode);
                }));
                dijitFocus.focus(this.domNode);
                //this.reloadViewFromState()
                // if (this.itemData.note !== ""){
                //     domStyle.set(this._noteDiv, "display", "block")
                // }

                this.interfaceCommands.getUIState().then(lang.hitch(this, function(uiState){
                    console.log("getUIState", uiState)

                    this.uiState = uiState
                    this.uiStateWatchHandle = this.uiState.watch(lang.hitch(this, this.onUIStateChange));
                    this.reloadViewFromState()
                })).catch(lang.hitch(this, function(Error){
                    console.log("Error this._interface.getAvailableEntries()", Error)
                }))




                this.interfaceCommands.getCaptureSets().then(lang.hitch(this, function(captureSets){
                    // console.log("captureSetcaptureSetcaptureSet", captureSets)
                    //
                    this.captureSets = captureSets
                    this.captureSetsWatchHandle = this.captureSets.watch(lang.hitch(this, this.onCaptureSetsChange));
                    this.reloadViewFromState()
                })).catch(lang.hitch(this, function(Error){
                    console.log("Error this._interface.getCaptureSets()", Error)
                }))
            },
            // onMarkUninterested: function ()
            // {
            //       //  this.interfaceCommands.setCaptureUninterested(this.itemData.id)
            // },
            onUIStateChange: function(name, oldValue, newValue){
            this.reloadViewFromState()

                if("selectedCaptureSet")
                {



                    this.setCurrentCaptureListWatcher()
                }
            },
            onCaptureSetsChange: function(name, oldValue, newValue){
                this.reloadViewFromState()
            },
            reloadViewFromState: function()
            {
                console.log("reloadViewFromState", this)
                if(this.captureState !== null
                    && this.uiState !== null
                && this.captureSets !== null) {
                    const dateString = this.captureState.get("created");
                    const date = new Date(dateString);
                    const shortDateFormat = date.toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric'
                    });

                    this._createdText.innerHTML = shortDateFormat;
                    this._barcodeText.innerHTML = this.captureState.get("barcode");
                    this._recognizedText.innerHTML = this.captureState.get("recognizedText");
                    this._noteText.innerHTML = this.captureState.get("note");


                    const selectedCaptureSetID = this.uiState.get("selectedCaptureSet")
                    const captureSet = this.interfaceCommands.getCaptureSetsController().getCaptureSetByID(selectedCaptureSetID);
                    //const selectedCaptureSet = this.captureSets.get(selectedCaptureSetID);

                    if (captureSet) {
                        // this._statusDiv.innerHTML = selectedCaptureSet.CaptureSet.name


                       // let captures = selectedCaptureSet.CaptureSet.captures ? selectedCaptureSet.CaptureSet.captures : {}


                        let captureInSet  = captureSet.get(this.captureID)

                        if (captureInSet === true) {
                            domClass.remove(this.domNode, `${this.baseClass}CaptureNotInSet`)
                            domStyle.set(this.interestedButton, "display", "none")
                            domStyle.set(this.uninterestedButton, "display", "inline-block")

                        } else {

                            domClass.add(this.domNode, `${this.baseClass}CaptureNotInSet`)
                            domStyle.set(this.interestedButton, "display", "inline-block")
                            domStyle.set(this.uninterestedButton, "display", "none")


                        }

                    }

                }

            },
            onInterestedClick: function(clickEvent){
                console.log("onUninterestedClick", this.captureID)
                if(this.uiState !== null) {
                    let selectedCaptureSetID = this.uiState.get("selectedCaptureSet")

                    if(selectedCaptureSetID){
                        this.interfaceCommands.addCaptureToSet(selectedCaptureSetID, this.captureID, lang.hitch(this, function(commandResult){
                            console.log(commandResult)
                        }))
                    }else {
                        alert("No Capture Set Selected")
                    }

                }

            },
            onUninterestedClick: function(clickEvent){
                console.log("onUninterestedClick", this.captureID)
                if(this.uiState !== null) {
                    let selectedCaptureSetID = this.uiState.get("selectedCaptureSet")

                    if(selectedCaptureSetID){
                        this.interfaceCommands.removeCaptureFromSet(selectedCaptureSetID, this.captureID, lang.hitch(this, function(commandResult){
                            console.log(commandResult)
                        }))
                    }else {
                        alert("No Capture Set Selected")
                    }

                }

            },
            _onFocus: function () {
                //todo make it do something
            },
            unload: function () {

                if(this.captureStateWatchHandle)
                {
                    this.captureStateWatchHandle.unwatch()
                    this.captureStateWatchHandle.remove()
                }
                this.destroy();
            }


        });
    });