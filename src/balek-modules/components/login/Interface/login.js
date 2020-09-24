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

        'dojo/text!balek-modules/components/login/resources/html/login.html',
        'dojo/text!balek-modules/components/login/resources/css/login.css'
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, dojoKeys, dijitFocus, dojoReady, InlineEditBox, TextBox, _WidgetBase, _TemplatedMixin, template, templateCSS) {

        return declare("moduleComponentsLoginInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "loginComponentInterface",

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
                this._sendLoginAndClose();
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
                        this._sendLoginAndClose();
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        this._usernameField.value = "";
                        this._passwordField.value = "";
                        break;
                }
            },
            _sendLoginAndClose: function () {
                let loginCredentials = {};

                let sendLoginCredentials = lang.hitch(this, this._sendLoginCredentials, loginCredentials, lang.hitch(this, function (loginReply) {
                    if (loginReply.error) {
                        alert(loginReply.error.error);
                    } else {

                        topic.publish("requestSessionUnloadModuleInstance", this._instanceKey,
                            lang.hitch(this, function (loginReply) {
                                if(loginReply.error === undefined)
                                {
                                    this._onLoginSuccess();
                                }
                                else
                                {
                                   alert(loginReply.error);
                                   //todo Maybe make a reset switch and use it here,
                                }
                            }));
                    }
                }));


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
            _sendLoginCredentials: function (credentialData, messageCallback) {
                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    moduleMessage: {
                        instanceKey: this._instanceKey, messageData: {
                            request: "Session Credentials Update",
                            credentialData: credentialData
                        }
                    }
                }, messageCallback);
            },
            unload() {
                this.destroy();
            }
        });
    });