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

        'balek-modules/digivigil/ui/input/getUserInput',

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/digivigil/digiscan/resources/html/listControl.html',
        'dojo/text!balek-modules/digivigil/digiscan/resources/css/listControl.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx, getUserInput, _WidgetBase, _TemplatedMixin, template,
              mainCss) {

        return declare("digivigilDigiscanCaptureViewInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "digivigilDigiscanSetControl",

            _noteDiv: null,
            _statusDiv: null,
            _mainCssString: mainCss,

            interfaceCommands: null,

            listNameOptions: null,
            eraseButtonImage: null,

            listsController: null,

            captureSets: null,
            captureSetsWatchHandle: null,

            uiState: null,
            uiStateWatchHandle: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this.domNode);
                }));

            },
            _onMouseOutResetStatusText: function (overEvent){
                this.updateStatusText("")
            },
            onCaptureSetsChange: function (name, oldValue, newValue) {
                console.log("onCaptureSetsChange", name, oldValue, newValue)
                this.refreshViews()
            },
            onUIStateChange: function( name, oldValue, newValue ) {
                console.log("onCaptureSetsChange", name, oldValue, newValue)

                if(name === "UIListControlStatusText"){
                    this._statusDiv.innerHTML = newValue
                }
                this.refreshViews()

            },
            _onNewOver: function (overEvent){
                console.log("mouseover")

                this.updateStatusText("Create New Set")
            },
            _onHiddenOver:function (overEvent){
                console.log("mouseover")

                this.updateStatusText("Show or Hide Captures not in Set")
            },
            updateStatusText: function(newText){
                if(this.uiState!==null && typeof newText === "string"){}
                {
                    this.uiState.set("UIListControlStatusText", newText)
                }
            },
            postCreate: function () {
                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this.domNode);
                }));
                dijitFocus.focus(this.domNode);


                if(this.listsController !== null && this.interfaceCommands !== null )
                {
                    this.interfaceCommands.getCaptureSets().then(lang.hitch(this, function(captureSets){
                        this.captureSets = captureSets
                        this.captureSetsWatchHandle = this.captureSets.watch(lang.hitch(this, this.onCaptureSetsChange));
                        this.refreshViews()
                    })).catch(lang.hitch(this, function(Error){
                        console.log("Error this._interface.getCaptureSets()", Error)
                    }))

                    this.interfaceCommands.getUIState().then(lang.hitch(this, function(uiState){
                        this.uiState = uiState
                        this.uiStateWatchHandle = this.uiState.watch(lang.hitch(this, this.onUIStateChange));
                        this.refreshViews()
                    })).catch(lang.hitch(this, function(Error){
                        console.log("Error this._interface.getAvailableEntries()", Error)
                    }))
                }


            },
            refreshViews: function()
            {
                if(this.uiState != null) {

                    let selectedCaptureSet = this.uiState.get("selectedCaptureSet")
                    let showHiddenCaptures = this.uiState.get("showHiddenCaptures")

                    if(showHiddenCaptures){
                        domAttr.set(this.eraseButtonImage, "src", "balek-modules/digivigil/digiscan/resources/images/circlegridfill.svg" )
                        domAttr.set(this.eraseButtonImage, "title", "Hide Captures not in Set" )

                    }else{
                        domAttr.set(this.eraseButtonImage, "src", "balek-modules/digivigil/digiscan/resources/images/circlegrid.svg" )
                        domAttr.set(this.eraseButtonImage, "title", "Show Captures not in Set" )
                    }


                    //Capture Views
                    this.listNameOptions.innerHTML = ""
                    if (this.captureSets !== null) {
                                for(captureSetID in this.captureSets)
                                {
                                    if(captureSetID !== "declaredClass" && this.captureSets[captureSetID] !== null
                                        && typeof this.captureSets[captureSetID] === "string"){

                                            const captureSetName = this.captureSets.get(captureSetID);
                                            const captureSetSelectDiv = this.captureSetSelectButton(captureSetID, captureSetName)

                                            if(selectedCaptureSet === captureSetID) {

                                                domClass.add(captureSetSelectDiv, `${this.baseClass}SelectedSet`)
                                            }

                                            domConstruct.place(captureSetSelectDiv, this.listNameOptions)


                                    }
                                }

                    }

                }

            },
            renameCaptureSet: function(captureSetID){
                let getNameForSet = new getUserInput({question: "Rename Set",
                    inputReplyCallback: lang.hitch(this, function(newSetNameChoice){
                        getNameForSet.unload();
                            this.interfaceCommands.renameCaptureSet(captureSetID, newSetNameChoice)

                    }) });
            },
            captureSetSelectButton: function(id, name)
            {
                let selectButton = domConstruct.create("div")
                domClass.add(selectButton, `${this.baseClass}SelectButton`)
                selectButton.innerHTML = name


                on(selectButton, ["click"], lang.hitch(this, function (clickEvent) {

                    if (clickEvent.altKey) {
                        this.interfaceCommands.deleteCaptureSet(id)
                    }else  if (clickEvent.shiftKey) {
                        this.renameCaptureSet(id)
                    }else{
                        this.interfaceCommands.selectCaptureSet(id)
                    }

                }));
                return selectButton
            },
            onClickNewSet: function (clickEvent){

                let getNameForList = new getUserInput({question: "Choose Set Name",
                    inputReplyCallback: lang.hitch(this, function(newListNameChoice){
                        getNameForList.unload();
                        if(clickEvent.altKey){
                            this.interfaceCommands.newClearSet(newListNameChoice)
                        }else{
                            this.interfaceCommands.newAllSet(newListNameChoice)
                        }
                    }) });
            },
            onClickNewClearSet: function (clickEvent){
                let getNameForList = new getUserInput({question: "Choose Set Name",
                    inputReplyCallback: lang.hitch(this, function(newListNameChoice){
                        getNameForList.unload();
                        this.interfaceCommands.newClearSet(newListNameChoice)
                    }) });
            },
            onShowHiddenCaptures: function(clickEvent){
                console.log("onShowHiddenCaptures", this.captureID)
                if(this.uiState !== null) {
                    let showingHiddenCaptures = this.uiState.get("showingHiddenCaptures")
                    if(showingHiddenCaptures ){
                        this.uiState.set("showingHiddenCaptures", false)
                        this.interfaceCommands.showHiddenCaptures( false,lang.hitch(this, function(commandResult){
                            console.log(commandResult)
                            //if error set ui state back?
                        }))
                    }else {
                        this.uiState.set("showingHiddenCaptures", true)
                        this.interfaceCommands.showHiddenCaptures( true, lang.hitch(this, function(commandResult){
                            console.log(commandResult)
                            //if error set back?
                        }))
                    }
                }

            },

            _onFocus: function () {
                //todo make it do something
            },
            unload: function () {


                this.captureSetsWatchHandle.unwatch();
                    this.uiStateWatchHandle.unwatch();

                this.destroy();
            }


        });
    });