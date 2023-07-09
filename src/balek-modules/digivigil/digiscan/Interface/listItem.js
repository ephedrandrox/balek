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

        'dojo/text!balek-modules/digivigil/digiscan/resources/html/listItem.html',
        'dojo/text!balek-modules/digivigil/digiscan/resources/css/listItem.css'
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

            interfaceCommands: null,

            uiState: null,
            captureID: null,

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

                    this.itemData.timeStamps.created = formattedDate

                }

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this.domNode);
                }));

            },
            postCreate: function () {
                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this.domNode);
                }));
                dijitFocus.focus(this.domNode);

                if (this.itemData.note !== ""){
                    domStyle.set(this._noteDiv, "display", "block")
                }

                this.interfaceCommands.getUIState().then(lang.hitch(this, function(uiState){
                    console.log("getUIState", uiState)

                    this.uiState = uiState

                })).catch(lang.hitch(this, function(Error){
                    console.log("Error this._interface.getAvailableEntries()", Error)
                }))
            },
            // onMarkUninterested: function ()
            // {
            //       //  this.interfaceCommands.setCaptureUninterested(this.itemData.id)
            // },

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
                this.destroy();
            }


        });
    });