define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'dojo/topic',
        "dojo/dom-construct",
        "dojo/dom-styl",
        "dojo/_base/window",
        'balek-modules/diaplode/menu/Interface/menu'
    ],
    function (declare, lang, baseInterface, topic, domConstruct, domStyle, win, menuMainWidget) {

        return declare("moduleDiaplodeLoginInterface", baseInterface, {
            _instanceKey: null,
            _menuMainWidget: null,

            constructor: function (args) {

                declare.safeMixin(this, args);


                this._menuMainWidget = new menuMainWidget({_instanceKey: this._instanceKey});
                topic.publish("displayAsDialog", this._menuMainWidget);

            },
            receiveMessage: function (moduleMessage) {
                console.log("You shouldn't be seeing this", moduleMessage);
            },
            toggleShowView: function () {
                let currentStateToggle = {"visible": "hidden", "hidden": "visible"};
                domStyle.set(this._menuMainWidget.domNode, {"visibility": currentStateToggle[domStyle.get(this._menuMainWidget.domNode, "visibility")]});
            },
            unload: function () {
                this._loginInterface.unload();
            }
        });
    }
);



