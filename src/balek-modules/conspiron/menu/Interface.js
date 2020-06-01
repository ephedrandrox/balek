define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'dojo/topic',
        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",
        'balek-modules/conspiron/menu/Interface/menu'
    ],
    function (declare, lang, baseInterface, topic, domConstruct, domStyle, win, menuInterface) {

        return declare("moduleConspironMenuInterface", baseInterface, {
            _instanceKey: null,
            _menuInterface: null,

            constructor: function (args) {

                declare.safeMixin(this, args);


                this._menuInterface = new menuInterface({_instanceKey: this._instanceKey});

                topic.publish("addToMainContentLayerAlwaysOnTop", this._menuInterface.domNode);
            },
            receiveMessage: function (moduleMessage) {
                console.log("You shouldn't be seeing this", moduleMessage);
            },
            toggleShowView: function () {
                let currentStateToggle = {"visible": "hidden", "hidden": "visible"};
                domStyle.set(this._menuInterface.domNode, {"visibility": currentStateToggle[domStyle.get(this._menuInterface.domNode, "visibility")]});
            },
            unload: function () {
                this._menuInterface.unload();
            }
        });
    }
);



