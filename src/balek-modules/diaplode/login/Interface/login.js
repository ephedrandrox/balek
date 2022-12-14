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
        "dijit/InlineEditBox",
        "dijit/form/TextBox",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        "balek-client/session/sessionController/interfaceCommands",

        'dojo/text!balek-modules/diaplode/login/resources/html/login.html',
        'dojo/text!balek-modules/diaplode/login/resources/css/login.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, dojoKeys, dijitFocus, dojoReady, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin,  SessionControllerInterfaceCommands,template, templateCSS) {

        return declare("moduleDiaplodeLoginInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "diaplodeLoginInterface",

            sessionControllerCommands: null,
            _usersSessionsStateList: null,
            _usersSessionsStateListWatchHandle: null,
            _sessionState: null,
            _sessionStateWatchHandle: null,



            _userData: {},
            constructor: function (args) {

                declare.safeMixin(this, args);

                let sessionControllerInterfaceCommands = new SessionControllerInterfaceCommands();
                this.sessionControllerCommands = sessionControllerInterfaceCommands.getCommands();



                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this._usernameField);
                }));

            },
            onSessionStateChange: function(name, oldValue, newValue) {
              if (name === "sessionStatus") {
                  if (newValue === 1) {
                //    this.loadFirstSession()
                  }
              }
            },
            onAvailableSessionsStateChange: function(name, oldValue, newValue) {
              debugger;
            },
            _onClickSendLoginButton: function (eventObject) {
                if(eventObject.altKey){
                    topic.publish("requestModuleLoad", "balekute/connect");
                    this.destroy();
                }else {
                    this.sendLoginAndClose();
                }

            },
            _onFocus: function () {
                this._usernameField.focus();
            },
            _onInputFocus: function (event) {
                event.target.select();
            },
            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();
                        this.sendLoginAndClose();
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        this._usernameField.value = "";
                        this._passwordField.value = "";
                        break;
                }
            },
            loadFirstSession: function () {
                this._usersSessionsStateList = this.sessionControllerCommands.getUserSessionsList()

                for (const key in this._usersSessionsStateList) {
                    let value = this._usersSessionsStateList[key]
                    if(typeof value !== 'function' && key != "_attrPairNames"
                        && key != "declaredClass" ){
                        console.log("adding objects from  State", key, value)
                        this.onAvailableSessionsStateChange(key, null, value );
                    }
                }
                this._usersSessionsStateListWatchHandle = this._usersSessionsStateList.watch(lang.hitch(this, this.onAvailableSessionsStateChange))
            },
            sendLoginAndClose: function () {
                let loginCredentials = {};

                let sendLoginCredentials = lang.hitch(this, function(){
                    topic.publish("sendLoginCredentials", loginCredentials, lang.hitch(this, function (loginReply) {
                        if (loginReply.error) {
                            alert(loginReply.error.error);
                        }
                        else {
                            topic.publish("requestSessionUnloadModuleInstance", this._instanceKey,
                                lang.hitch(this, function (loginReply) {
                                    if(loginReply.error === undefined)
                                    {
                                        this.sessionControllerCommands.getAvailableSessions().then(lang.hitch(this, function (availableSessions) {
                                            let availableSessionKeys = Object.keys(availableSessions)
                                            if (availableSessionKeys.length > 1) {
                                                //todo if more then one, show a chooser
                                                //todo automatically keep new session with option+return or some keystroke at login
                                                availableSessionKeys.some(lang.hitch(this, function(availableSessionKey){
                                                    if (availableSessionKey != this._sessionKey){
                                                        topic.publish("requestSessionChangeAndUnloadAll", availableSessionKey);
                                                        return true
                                                    }else{
                                                        return false
                                                    }
                                                }))
                                            }else {
                                                        topic.publish("requestModuleLoad", "diaplode/elements/files");
                                                        topic.publish("requestModuleLoad", "diaplode/elements/notes");
                                                        topic.publish("requestModuleLoad", "diaplode/elements/tasks");
                                                        topic.publish("requestModuleLoad", "diaplode/navigator");
                                                        topic.publish("requestModuleLoad", "diaplode/commander");
                                                        topic.publish("loadBackground", "flowerOfLife");
                                            }
                                        })).catch(lang.hitch(this, function(Error)  {
                                            console.log(Error);
                                        }))

                                        this.destroy();
                                    }
                                    else
                                    {
                                        alert(loginReply.error);
                                        //todo Maybe make a reset switch and use it here,
                                    }
                                }));
                        }
                    }));
                });


                if (this._usernameField.value && this._passwordField.value) {
                    loginCredentials.username = this._usernameField.value;
                    if(typeof(TextEncoder) !== 'undefined'){
                        let cryptoPromise = crypto.subtle.digest('SHA-512', new TextEncoder("utf-8").encode(this._passwordField.value));
                        cryptoPromise.then(lang.hitch(this, function (passwordHash) {
                            let passwordHashHex = Array.prototype.map.call(new Uint8Array(passwordHash), x => (('00' + x.toString(16)).slice(-2))).join('');
                            loginCredentials.password = passwordHashHex;
                            sendLoginCredentials();
                        }));
                    }else{
                        loginCredentials.password = this._passwordField.value;
                        loginCredentials.passwordNotEncrypted = true;
                        sendLoginCredentials();
                    }
                } else {
                    alert("Need more Input");
                }
            },
            unload() {

                this.destroy();
            }
        });
    });