define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'dojo/topic',
        "dojo/dom-construct",
        "dojo/_base/window",
        'balek-modules/diaplode/login/Interface/login'
    ],
    function (declare, lang, baseInterface, topic, domConstruct, win, loginInterface) {

        return declare("moduleDiaplodeLoginInterface", baseInterface, {
            _instanceKey: null,
            _loginInterface: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                this.sendLoginCredentialsSubscribeHandle =  topic.subscribe("sendLoginCredentials", lang.hitch(this, this.sendLoginCredentials));
                this._loginInterface = new loginInterface({_instanceKey: this._instanceKey});
                topic.publish("displayAsDialog", this._loginInterface);

            },
            receiveMessage: function (moduleMessage) {
                console.log("You shouldn't be seeing this", moduleMessage);
            },
            sendLoginCredentials: function (credentialData, messageCallback) {
                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    moduleMessage: {
                        instanceKey: this._instanceKey, messageData: {
                            request: "Session Credentials Update",
                            credentialData: credentialData
                        }
                    }
                }, messageCallback);
            },
            unload: function () {
                this.sendLoginCredentialsSubscribeHandle.remove();

                this._loginInterface.unload();
            }
        });
    }
);



