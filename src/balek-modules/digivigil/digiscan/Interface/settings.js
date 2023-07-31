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


        'dojo/text!balek-modules/digivigil/digiscan/resources/html/settings.html',
        'dojo/text!balek-modules/digivigil/digiscan/resources/css/settings.css',

        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',
    ],
    function (declare, lang, domStyle, domConstruct, win, fx,
              on, domAttr, dojoKeys, dijitFocus, dojoReady, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin,
              template,
              mainCss,
              _SyncedCommanderInterface, _BalekWorkspaceContainerContainable) {
        return declare("scapturaSettingsInterface", [_WidgetBase, _TemplatedMixin, _SyncedCommanderInterface, _BalekWorkspaceContainerContainable], {
            _instanceKey: null,
            _interface: null,
            baseClass: "digivigilDigiscanSettingsInterface",


            _showHelpfulHintsCheckboxSpan: null,
            templateString: template,
            _mainCssString: mainCss,

            uiState: null,             //SyncedMap
            uiStateWatchHandle: null,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################
            constructor: function (args) {
                console.log("Construct😈😈😈")


                declare.safeMixin(this, args);
                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
            },
            postCreate: function () {
                this.initializeContainable();

                this._interface.getUIState().then(lang.hitch(this, function(uiState){
                    this.uiState = uiState
                    this.uiStateWatchHandle = this.uiState.watch(lang.hitch(this, this.onUIStateChange));
                    this.refreshViews()
                })).catch(lang.hitch(this, function(Error){
                    console.log("Error this._interface.getAvailableEntries()", Error)
                }))

            },
            startupContainable: function(){
                //called after containable is started
                //keep stub for future use
               // this.putInWorkspaceOverlayContainer();


            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onUIStateChange: function (name, oldState, newState) {
                //if active view, selected capture set or show hidden captures changed
                if(name === "showHelpfulHints" )
                {
                    this.refreshViews()
                }
            },
            //##########################################################################################################
            //Widget Event Functions Section
            //##########################################################################################################

            onCloseButtonClicked: function(clickEvent){
                this.hide();  //containable method
            },

            _onRemoveClicked: function (eventObject) {
                this._interface.removeAllCaptures();
            },
            _onShowHelpfulHintsClicked: function (eventObject) {
                if(this.uiState != null) {

                    const showHelpfulHints = this.uiState.get("showHelpfulHints")

                    if(showHelpfulHints){
                        this._interface.setShowHelpfulHints(false, lang.hitch(this, function(result){

                        }));
                    }else{
                        this._interface.setShowHelpfulHints(true, lang.hitch(this, function(result){

                        }));
                    }

                }
            },
            //##########################################################################################################
            //Interface Commands Functions Section
            //##########################################################################################################

            //##########################################################################################################
            //UI Update Functions Section
            //##########################################################################################################
            refreshViews: function(){
                if(this.uiState != null) {

                    const showHelpfulHints = this.uiState.get("showHelpfulHints")

                    if(showHelpfulHints){
                        this._showHelpfulHintsCheckboxSpan.innerHTML = "✅"
                    }else{
                        this._showHelpfulHintsCheckboxSpan.innerHTML = "☑️"
                    }

                }
            },


            //##########################################################################################################
            //Widget Deconstruction Section
            //##########################################################################################################
            unload: function () {
                if(this.uiStateWatchHandle && this.uiStateWatchHandle.unwatch)
                {
                    this.uiStateWatchHandle.unwatch()

                }
            }
        });
    });