define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Interface',
        'dojo/topic',
        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",
        'balek-modules/coopilot/saleTagScan/Interface/main'
    ],
    function (declare, lang, baseInterface, topic, domConstruct, domStyle, win, mainInterface) {

        return declare("moduleDigivigilWWWSaleTagScanInterface", baseInterface, {
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
            sendDigivigilSaleTagScanEntry: function (saleTagScanEntry) {
                //todo make this use the send with callback function and return a promise
                let entryMessage = {
                    moduleMessage: {
                        instanceKey: this._instanceKey, messageData: {
                            request: "Digivigil SaleTagScan Entry",
                            saleTagScanEntry: saleTagScanEntry
                        }
                    }
                };
                console.log("sending saleTagScan entry", entryMessage);
                topic.publish("sendBalekProtocolMessage", entryMessage);

            },
            requestSaleTagScanEntries() {
                console.log("requesting saleTagScan entries");
                topic.publish("sendBalekProtocolMessage", {
                    moduleMessage: {
                        instanceKey: this._instanceKey, messageData: {
                            request: "SaleTagScan Entries",
                            searchParams: null
                        }
                    }
                });
            },
            receiveMessage: function (moduleMessage) {

                if (moduleMessage.instanceKey == this._instanceKey) {
                    if (moduleMessage.messageData.saleTagScanData) {
                        console.log(moduleMessage.messageData.saleTagScanData);
                        this._mainInterface.updateSaleTagScanData(moduleMessage.messageData.saleTagScanData);
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



