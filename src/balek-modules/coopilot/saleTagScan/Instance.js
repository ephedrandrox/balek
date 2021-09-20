define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/Instance'],
    function (declare, lang, topic, baseInstance) {

        return declare("moduleDigivigilWWWSaleTagScanInstance", baseInstance, {
            _instanceKey: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                console.log("moduleDigivigilWWWSaleTagScanInstance starting...");

            },
            receiveMessage: function (moduleMessage, wssConnection) {
                if (moduleMessage.instanceKey == this._instanceKey) {
                    if (moduleMessage.messageData.request) {
                        switch (moduleMessage.messageData.request) {
                            case "Digivigil SaleTagScan Entry":
                                if (moduleMessage.messageData.saleTagScanEntry) {
                                    this._module.addDigivigilWWWSaleTagScanEntry(moduleMessage.messageData.saleTagScanEntry);
                                } else {
                                    console.log("SaleTagScan Entry Format Error", moduleMessage);
                                }
                                break;
                            case "SaleTagScan Entries":
                                this.sendSaleTagScanEntries(wssConnection);
                                break;
                            default:
                                console.log("Not a valid request", moduleMessage);
                        }
                    }
                } else {
                    console.log("received Module message with incorrect instanceKey", moduleMessage.instanceKey, this._instanceKey)
                }
            },
            sendSaleTagScanEntries: function (wssConnection) {
                this._module.getDigivigilWWWSaleTagScanEntries(lang.hitch(this, function (saleTagScanEntries) {
                    topic.publish("sendBalekProtocolMessage", wssConnection, {
                        moduleMessage: {
                            instanceKey: this._instanceKey,
                            messageData: {saleTagScanData: saleTagScanEntries}
                        }
                    });
                }));
            }
        });
    }
);


