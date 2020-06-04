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
            _InstanceState: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                this.requestState();


                this._navigatorMainWidget = new navigatorMainWidget({_instanceKey: this._instanceKey, requestNewMenu: this.requestNewMenu
                    });
                topic.publish("displayAsDialog", this._navigatorMainWidget);

            },
            receiveMessage: function (moduleMessage) {
                console.log("You shouldn't be seeing this", moduleMessage);
            },
            toggleShowView: function () {
                let currentStateToggle = {"block": "none", "none": "block"};
                console.log(domStyle.get(this._navigatorMainWidget.domNode, "display"));
                domStyle.set(this._navigatorMainWidget.domNode, {"display": currentStateToggle[domStyle.get(this._navigatorMainWidget.domNode, "display")]});
            },
            unload: function () {
                this._navigatorMainWidget.unload();
            },
            requestNewMenu(name){

                    console.log("requesting New Menu");
                    topic.publish("sendBalekProtocolMessage", {
                        moduleMessage: {
                            instanceKey: this._instanceKey, messageData: {
                                request: "New Navigator Menu",
                                name: name
                            }
                        }
                    });

            },
            requestState() {

                   console.log("requesting diaplode navigator state");
                    topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                        moduleMessage: {
                            instanceKey: this._instanceKey, messageData: {
                                request: "Diaplode Navigator State"
                            }
                        }
                    }, lang.hitch(this, function(reply){

                        //this is when we update state
                        console.log(reply);

                    }));

            },
        });
    }
);



