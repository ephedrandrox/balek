define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'dojo/topic',
        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",
        'balek-modules/conspiron/navigator/Interface/navigator'
    ],
    function (declare, lang, baseInterface, topic, domConstruct, domStyle, win, navigatorInterface) {

        return declare("moduleConspironNavigatorInterface", baseInterface, {
            _instanceKey: null,
            _navigatorInterface: null,

            constructor: function (args) {

                declare.safeMixin(this, args);


                this._navigatorInterface = new navigatorInterface({_instanceKey: this._instanceKey});

                topic.publish("addToMainContentLayerAlwaysOnTop", this._navigatorInterface.domNode);
            },
            receiveMessage: function (moduleMessage) {
                console.log("You shouldn't be seeing this", moduleMessage);
            },
            toggleShowView: function () {
                let currentStateToggle = {"visible": "hidden", "hidden": "visible"};
                domStyle.set(this._navigatorInterface.domNode, {"visibility": currentStateToggle[domStyle.get(this._navigatorInterface.domNode, "visibility")]});
            },
            unload: function () {
                this._navigatorInterface.unload();
            }
        });
    }
);



