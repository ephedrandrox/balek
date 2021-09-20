define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'dojo/topic',
        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",
        'balek-modules/digivigil-www/guestbook/Interface/main'
    ],
    function (declare, lang, baseInterface, topic, domConstruct, domStyle, win, mainInterface) {

        return declare("moduleDigivigilWWWGuestbookInterface", baseInterface, {
            _instanceKey: null,
            _mainInterface: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._mainInterface = new mainInterface({_instanceKey: this._instanceKey, _interface: this});

                topic.publish("displayAsDialog", this._mainInterface);

            },
            getWorkspaceDomNode: function () {
                return this._mainInterface.domNode;
            },
            sendDigivigilGuestbookEntry: function (guestbookEntry) {
                //todo make this use the send with callback function and return a promise
                let entryMessage = {
                    moduleMessage: {
                        instanceKey: this._instanceKey, messageData: {
                            request: "Digivigil Guestbook Entry",
                            guestbookEntry: guestbookEntry
                        }
                    }
                };
                console.log("sending guestbook entry", entryMessage);
                topic.publish("sendBalekProtocolMessage", entryMessage);

            },
            requestGuestbookEntries() {
                console.log("requesting guestbook entries");
                topic.publish("sendBalekProtocolMessage", {
                    moduleMessage: {
                        instanceKey: this._instanceKey, messageData: {
                            request: "Guestbook Entries",
                            searchParams: null
                        }
                    }
                });
            },
            receiveMessage: function (moduleMessage) {

                if (moduleMessage.instanceKey == this._instanceKey) {
                    if (moduleMessage.messageData.guestbookData) {
                        console.log(moduleMessage.messageData.guestbookData);
                        this._mainInterface.updateGuestbookData(moduleMessage.messageData.guestbookData);
                    } else {
                        console.log("unknown message COntent")
                    }
                } else {
                    error("Module message with incorrect instanceKey sent to interface")
                }
            },
            toggleShowView: function () {
                let currentStateToggle = {"visible": "hidden", "hidden": "visible"};
                domStyle.set(this._mainInterface.domNode, {"visibility": currentStateToggle[domStyle.get(this._mainInterface.domNode, "visibility")]});
            },
            unload: function () {
                this._mainInterface.unload();
            }
        });
    }
);



