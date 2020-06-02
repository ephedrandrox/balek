define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'dojo/topic',
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/_base/window",
        'balek-modules/diaplode/navigator/Interface/navigator'
    ],
    function (declare, lang, baseInterface, topic, domConstruct, domStyle, win, navigatorMainWidget) {

        return declare("moduleDiaplodeLoginInterface", baseInterface, {
            _instanceKey: null,
            _navigatorMainWidget: null,

            constructor: function (args) {

                declare.safeMixin(this, args);


                this._navigatorMainWidget = new navigatorMainWidget({_instanceKey: this._instanceKey});
                topic.publish("displayAsDialog", this._navigatorMainWidget);

            },
            receiveMessage: function (moduleMessage) {
                console.log("You shouldn't be seeing this", moduleMessage);
            },
            toggleShowView: function () {
                let currentStateToggle = {"visible": "hidden", "hidden": "visible"};
                domStyle.set(this._navigatorMainWidget.domNode, {"visibility": currentStateToggle[domStyle.get(this._navigatorMainWidget.domNode, "visibility")]});
            },
            unload: function () {
                this._navigatorMainWidget.unload();
            }
        });
    }
);


