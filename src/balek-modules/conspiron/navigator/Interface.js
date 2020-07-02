define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'dojo/topic',
        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",
        'balek-modules/conspiron/navigator/Interface/navigator'
    ],
    function (declare, lang, baseInterface, topic, domConstruct, domStyle, win, navigatorMainWidget) {

        return declare("moduleConspironNavigatorInterface", baseInterface, {
            _instanceKey: null,
            _navigatorMainWidget: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                this.sendInstanceCallbackMessage({
                    request: "Navigator Component Key",
                }, lang.hitch(this, function (requestResults) {
                    console.log("got command return results");
                    this._navigatorMainWidget = new navigatorMainWidget({
                        _instanceKey: this._instanceKey,
                        _componentKey: requestResults.componentKey
                    });
                    topic.publish("addToMainContentLayerAlwaysOnTop", this._navigatorMainWidget.domNode);
                }));




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



