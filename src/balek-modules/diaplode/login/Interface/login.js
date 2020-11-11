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

        'dojo/text!balek-modules/diaplode/login/resources/html/login.html',
        'dojo/text!balek-modules/diaplode/login/resources/css/login.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, dojoKeys, dijitFocus, dojoReady, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, template, templateCSS) {

        return declare("moduleDiaplodeLoginInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "diaplodeLoginInterface",

            _userData: {},
            constructor: function (args) {

                declare.safeMixin(this, args);

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

                dojoReady(lang.hitch(this, function () {
                    dijitFocus.focus(this._usernameField);
                }));

            },
            _onClickSendLoginButton: function (eventObject) {
                this.sendLoginAndClose();
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
            sendLoginAndClose: function () {
                let loginCredentials = {};

                let sendLoginCredentials = lang.hitch(this, function(){
                    topic.publish("sendLoginCredentials", loginCredentials, lang.hitch(this, function (loginReply) {
                        if (loginReply.error) {
                            alert(loginReply.error.error);
                        } else {

                            topic.publish("requestSessionUnloadModuleInstance", this._instanceKey,
                                lang.hitch(this, function (loginReply) {
                                    if(loginReply.error === undefined)
                                    {
                                        topic.publish("getSessionState", lang.hitch(this, function (sessionState) {
                                            let availableSessions = sessionState.get("availableSessions");
                                            let firstSessionKey = Object.keys(availableSessions)[0];

                                            if(firstSessionKey && firstSessionKey !== null)
                                            {
                                                topic.publish("requestSessionChangeAndUnloadAll", firstSessionKey);
                                            }else
                                            {
                                                topic.publish("requestModuleLoad", "diaplode/elements/notes");

                                                topic.publish("requestModuleLoad", "diaplode/navigator");
                                                topic.publish("requestModuleLoad", "diaplode/commander");

                                                topic.publish("loadBackground", "flowerOfLife");

                                                this.destroy();
                                            }
                                        }));


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