define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/Instance'],
    function (declare, lang, topic, baseInstance) {

        return declare("moduleDigivigilWWWGuestbookInstance", baseInstance, {
            _instanceKey: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                console.log("moduleDigivigilWWWGuestbookInstance starting...");

            },
            receiveMessage: function (moduleMessage, wssConnection) {
                if (moduleMessage.instanceKey == this._instanceKey) {
                    if (moduleMessage.messageData.request) {
                        switch (moduleMessage.messageData.request) {
                            case "Digivigil Guestbook Entry":
                                if (moduleMessage.messageData.guestbookEntry) {
                                    this._module.addDigivigilWWWGuestbookEntry(moduleMessage.messageData.guestbookEntry);
                                } else {
                                    console.log("Guestbook Entry Format Error");
                                }
                                break;
                            case "Guestbook Entries":
                                this.sendGuestbookEntries(wssConnection);
                                break;
                            default:
                                console.log("Not a valid request", moduleMessage);
                        }
                    }
                } else {
                    console.log("received Module message with incorrect instanceKey", moduleMessage.instanceKey, this._instanceKey)
                }
            },
            sendGuestbookEntries: function (wssConnection) {
                this._module.getDigivigilWWWGuestbookEntries(lang.hitch(this, function (guestbookEntries) {
                    topic.publish("sendBalekProtocolMessage", wssConnection, {
                        moduleMessage: {
                            instanceKey: this._instanceKey,
                            messageData: {guestbookData: guestbookEntries}
                        }
                    });
                }));
            }
        });
    }
);


