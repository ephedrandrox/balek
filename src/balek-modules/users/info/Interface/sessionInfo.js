define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/on',
        "dojo/dom-attr",
        "dojo/keys",
        "dijit/focus",
        "dojo/ready",
        'dojo/_base/fx',

        "balek-modules/diaplode/ui/input/getUserInput",


        "dijit/InlineEditBox",
        "dijit/form/TextBox",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/users/info/resources/html/sessionInfo.html',
        'dojo/text!balek-modules/users/info/resources/css/sessionInfo.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, dojoKeys,
              dijitFocus, dojoReady, fx, getUserInput, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, template,
              mainCss) {

        return declare("usersInfoSessionInfoInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "usersInfoSessionInfoInterface",

            _mainCssString: mainCss,

            sessionInfo: null,

            _mainDiv: null,
            _keyDiv: null,
            _statusDiv: null,

            sessionControllerCommands: null,

            _sessionState: null,
            constructor: function (args) {

                declare.safeMixin(this, args);

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());

                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this.domNode);
                }));

            },
            postCreate: function () {
                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this.domNode);
                }));

                this._sessionState = this.sessionControllerCommands.getSessionState(this.sessionInfo.key)
                console.log("🔻🔻🔻🔻UserInfo",this.sessionInfo.key, this._sessionState)

                this.updateSessionInfo()
                this._sessionStateWatchHandle = this._sessionState.watch(lang.hitch(this, this.onSessionStateChange))

                dijitFocus.focus(this.domNode);
            },
            onSessionStateChange(name, oldState, newState){
                console.log("🔻🔻🔻🔻UserInfo",name, oldState, newState)
                if(name = "sessionName"){
                    this.updateSessionInfo()
                }
                if(name = "sessionStatus"){
                    this.updateSessionInfo()
                }
            },
            updateSessionInfo : function (){
                let sessionName = this._sessionState.get("sessionName")
                let sessionStatus = this._sessionState.get("sessionStatus")
                if (sessionName)
                {
                    this._keyDiv.innerHTML = sessionName
                }else {
                    this._keyDiv.innerHTML = this.sessionInfo.key
                }
                let statusText = ""

                if(sessionStatus === 1)
                {
                    statusText = "Connected"
                }else if(sessionStatus === 2)
                {
                    statusText = "Disconnected"
                }else{
                    statusText = "unknown Status"
                }
                this._statusDiv.innerHTML = statusText
            },
            _onDoubleClick: function (clickEvent) {
                let getUserInputForName = new getUserInput({question: "Change Session Name...",
                    inputReplyCallback: lang.hitch(this, function(newName){
                        this.sessionControllerCommands.requestSessionNameChange(this.sessionInfo.key, newName)
                        getUserInputForName.unload();
                    }) });

            },
            _onSwitchToButtonClicked: function (clickEvent) {
                this.sessionControllerCommands.requestSessionChange(this.sessionInfo.key)
            },
            _onCloseButtonClicked: function (clickEvent) {
                topic.publish("requestSessionUnload", this.sessionInfo.key, function(value){
                                console.log(value);
                            });
            },
            _onSwitchAndCloseButtonClicked: function (clickEvent) {
                this.sessionControllerCommands.requestSessionChange(this.sessionInfo.key, true)
            },

            _onFocus: function () {
                //todo make it do something
            },
            unload: function () {
                console.log("💀💀💀unloading usersInfoSessionInfoInterface...");
                this._sessionStateWatchHandle.unwatch()
                this._sessionStateWatchHandle.remove()

                this.destroy();
            }


        });
    });