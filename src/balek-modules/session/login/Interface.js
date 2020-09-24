define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'dojo/topic',
        "dojo/dom-construct",
        "dojo/_base/window",
        'balek-modules/session/login/Interface/login'
    ],
    function (declare, lang, baseInterface, topic, domConstruct, win, loginInterface) {

        return declare("moduleSessionLoginInterface", baseInterface, {
            _instanceKey: null,
            _loginInterface: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._loginInterface = new loginInterface({_instanceKey: this._instanceKey});
                topic.publish("displayAsDialog", this._loginInterface);

            },
            receiveMessage: function (moduleMessage) {
                console.log("You shouldn't be seeing this", moduleMessage);
            },
            unload: function () {
                this._loginInterface.unload();
            }
        });
    }
);



