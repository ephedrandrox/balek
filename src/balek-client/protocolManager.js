define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek/protocolManager'],
    function (declare, lang, topic, balekProtocolManager) {

        return declare("balekProtocolManager", balekProtocolManager, {

            _replyableMessages: null,
            constructor: function (args) {

                this._replyableMessages = {};

                declare.safeMixin(this, args);

                topic.subscribe("balekProtocolMessageReceived", lang.hitch(this, this.balekProtocolMessageReceived));
                topic.subscribe("sendBalekProtocolMessage", lang.hitch(this, this.sendBalekProtocolMessage));
                topic.subscribe("sendBalekProtocolMessageWithReplyCallback", lang.hitch(this, this.sendBalekProtocolMessageWithReplyCallback));

            },

            balekProtocolMessageReceived: function (balekProtocolMessage) {
                if (balekProtocolMessage.sessionAction) {
                    topic.publish("sessionStatusActionReceived", balekProtocolMessage.sessionAction);
                } else if (balekProtocolMessage.moduleAction) {
                    switch (balekProtocolMessage.moduleAction.action) {
                        case "Module Loaded":
                            topic.publish("loadModuleInterface",    balekProtocolMessage.moduleAction.name,
                                                                    balekProtocolMessage.moduleAction.interfacePath,
                                                                    balekProtocolMessage.moduleAction.instanceKey,
                                                                    function () {
                            });
                            break;
                    }
                } else if (balekProtocolMessage.moduleMessage) {
                    topic.publish("receiveModuleMessage", balekProtocolMessage.moduleMessage);
                } else if (balekProtocolMessage.moduleManagerMessage) {
                    topic.publish("receiveModuleManagerMessage", balekProtocolMessage.moduleManagerMessage);
                } else if (balekProtocolMessage.sessionMessage) {
                    topic.publish("receiveSessionMessage", balekProtocolMessage.sessionMessage);
                } else if (balekProtocolMessage.sessionManagerMessage) {
                    topic.publish("receiveSessionManagerMessage", balekProtocolMessage.sessionManagerMessage);
                } else if (balekProtocolMessage.userManagerMessage) {
                    topic.publish("receiveUserManagerMessage", balekProtocolMessage.userManagerMessage);
                } else if(!balekProtocolMessage.messageReply){
                    console.log("Unknown balekProtocolMessage", balekProtocolMessage);
                }

                if (balekProtocolMessage.messageReply) {
                    let messageReplyID = String(balekProtocolMessage.messageReply);
                    this._replyableMessages[messageReplyID](balekProtocolMessage);
                }
            },
            sendBalekProtocolMessage: function (message) {
                topic.publish("sendServerMessage", this.wrapObject(message));
            },
            sendBalekProtocolMessageWithReplyCallback: function (message, messageReplyCallback) {
                let dataToSend = this.wrapObject(message);
                let messageKey = this.getUniqueReplyableMessageKey();
                this._replyableMessages[messageKey] = messageReplyCallback;
                dataToSend.balekProtocolMessage.messageKey = messageKey;
                topic.publish("sendServerMessage", dataToSend);
            },
            getUniqueReplyableMessageKey: function () {
                do {
                    //todo change this to a simpler key
                    let idArray = new Uint8Array(64);
                    window.crypto.getRandomValues(idArray);
                    let id = String.fromCharCode.apply(null, idArray);
                    if (typeof this._replyableMessages[id] == "undefined") return id;
                } while (true);
            }


        });
    });