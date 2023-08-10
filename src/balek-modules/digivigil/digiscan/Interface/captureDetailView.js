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

        'dojo/text!balek-modules/digivigil/digiscan/resources/html/captureDetailView.html',
        'dojo/text!balek-modules/digivigil/digiscan/resources/css/captureDetailView.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, template,
              mainCss) {

        return declare("digivigilDigiscanCaptureDetailViewInterface", [_WidgetBase, _TemplatedMixin], {
            baseClass: "digivigilDigiscanCaptureDetailViewInterface",
            _instanceKey: null,

            templateString: template,
            _mainCssString: mainCss,

            _barcodeDiv: null,
            _noteDiv: null,                 //domNode
            _createdText: null,             //domNode
            _barcodeText: null,             //domNode
            _recognizedText: null,          //domNode
            _noteText: null,                //domNode
            _imageNode: null,

            interestedButton: null,         //domNode
            uninterestedButton: null,       //domNode

            interfaceCommands: null,        //passed argument




            uiState: null,                  //loaded Stateful
            uiStateWatchHandle: null,       //set

            currentCaptureID: null,
            currentCaptureState: null,       //dojo stateful
            currentCaptureStateWatchHandle: null, //Single Selected Capture Watch Handle

            constructor: function (args) {

                declare.safeMixin(this, args);



                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this.domNode);
                }));

            },

            postCreate: function () {

                if(this.interfaceCommands){

                    this.interfaceCommands.getUIState().then(lang.hitch(this, function(uiState){
                        this.uiState = uiState
                        this.uiStateWatchHandle = this.uiState.watch(lang.hitch(this, this.onUIStateChange));
                        this.updateSelectedCaptures();
                    })).catch(lang.hitch(this, function(Error){
                        console.warn("Error interfaceCommands getUIState() from captureGridView", Error)
                    }))

                }






            },

            onUIStateChange: function(name, oldValue, newValue){
                //Needs Capture State and UI State
                if(name === "selectedCaptures")
                {
                    this.updateSelectedCaptures();
                }
            },
            updateSelectedCaptures: function(){
                if( this.uiState !== null) {
                    const selectedCaptures = this.uiState.get("selectedCaptures")

                    if (Array.isArray(selectedCaptures) && selectedCaptures.length === 1)
                    {
                        this.currentCaptureID = selectedCaptures[0];
                        this.setCurrentCaptureWatch();

                    }else
                    {
                        this.clearCurrentCapture();
                    }
                    this.reloadView()
                }
            },
            clearCurrentCapture: function() {
                this.currentCaptureID = null;
                this.currentCaptureState = null
                this.currentCaptureStateWatchHandle.unwatch();
                this.currentCaptureStateWatchHandle.remove();
                this.currentCaptureWatchHandle = null
            },
            currentCaptureStateChange: function(name, oldValue, newValue) {
                if(name === "image" || name === "id"){
                    this.reloadView();
                }
            },
            setCurrentCaptureWatch: function()
            {
                if (this.currentCaptureStateWatchHandle !== null)
                {
                  this.currentCaptureStateWatchHandle.unwatch();
                  this.currentCaptureStateWatchHandle.remove();
                    this.currentCaptureStateWatchHandle = null;
                }

                if (this.currentCaptureID)
                {
                    this.currentCaptureState =  this.interfaceCommands.getCaptures().getCaptureByID(this.currentCaptureID )
                    if (this.currentCaptureState) {
                        this.currentCaptureStateWatchHandle = this.currentCaptureState.watch(lang.hitch(this, this.currentCaptureStateChange))
                        this.reloadView()
                    }


                }


            },

            reloadView: function()
            {

                if (this.currentCaptureState !== null
                && typeof this.currentCaptureState.get === "function")
                {
                    const imageBase64String = this.currentCaptureState.get("image");

                    if(imageBase64String )
                    {
                        domClass.remove(this._imageNode,`${this.baseClass}NoImage`)
                        domClass.add(this._imageNode,`${this.baseClass}Image`)
                        this._imageNode.src = "data:image/png;base64," + imageBase64String
                    }else{
                        const CaptureID = this.currentCaptureState.get("id");
                        if(CaptureID){
                            this.interfaceCommands.getCaptureDetailedImage(this.currentCaptureID)
                        }else {
                        }
                    }
                }


            },

            onExpandClick: function(clickEvent){

                this.interfaceCommands.clearSelectedCaptures(function(returned){

                })
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