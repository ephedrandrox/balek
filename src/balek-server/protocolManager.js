define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek/protocolManager'],
    function (declare, lang, topic, balekProtocolManager) {
        return declare("balekProtocolManager", balekProtocolManager, {
            constructor: function (args) {

                declare.safeMixin(this, args);

                console.log("Initializing Balek Protocol Manager for server...");

                topic.subscribe("sendBalekProtocolMessage", lang.hitch(this, this.sendBalekProtocolMessage));
                topic.subscribe("receiveBalekProtocolMessage", lang.hitch(this, this.receiveBalekProtocolMessage));
            },
            sendBalekProtocolMessage: function (wssConnection, dataToSend) {
             //   console.log("→ SEND  --  DEBUG: ################Send::::",dataToSend, "DEBUG: Send end:--------------------------")
                wssConnection.sendDataToClient(this.wrapObject(dataToSend));
            },
            sendBalekProtocolMessageReply: function (wssConnection, balekMessage, messageReply) {
                let dataToSend = this.wrapObject(messageReply);

                dataToSend.balekProtocolMessage.messageReply = balekMessage.messageKey;
             //   console.log("☞ SEND  --  DEBUG: ################SendMEssageReply::::",dataToSend, "DEBUG: Send end:--------------------------")

                wssConnection.sendDataToClient(dataToSend);
            },
            receiveBalekProtocolMessage: function (balekMessage, wssConnection) {
           //     console.log("✉️✉️ Receive -- DEBUG: ################RECEIVE::::",balekMessage, "DEBUG: RECEIVE END:--------------------------")
                if (balekMessage.moduleMessage) {
                    topic.publish("receiveModuleMessage", balekMessage.moduleMessage, wssConnection, lang.hitch(this, function (messageReply) {
                        this.sendBalekProtocolMessageReply(wssConnection, balekMessage, messageReply)
                    }));
                } else if (balekMessage.moduleManagerMessage) {
                    topic.publish("receiveModuleManagerMessage", balekMessage.moduleManagerMessage, wssConnection);
                    //this one does not have a reply callback, maybe it should?
                } else if (balekMessage.sessionMessage) {
                    topic.publish("receiveSessionMessage", balekMessage.sessionMessage, lang.hitch(this, function (messageReply) {
                        if(wssConnection.isConnected()){
                            this.sendBalekProtocolMessageReply(wssConnection, balekMessage, messageReply)
                            return true
                        }else{
                            return { Error: "Websocket is not connected - receiveSessionMessage messageCallback"}
                        }
                    }));
                } else if (balekMessage.sessionManagerMessage) {
                    topic.publish("receiveSessionManagerMessage", balekMessage.sessionManagerMessage);
                } else if (balekMessage.workspaceMessage) {
                    topic.publish("receiveWorkspaceMessage", balekMessage.workspaceMessage, lang.hitch(this, function (messageReply) {
                        this.sendBalekProtocolMessageReply(wssConnection, balekMessage, messageReply)
                    }));
                } else if (balekMessage.userManagerMessage) {
                    topic.publish("receiveUserManagerMessage", balekMessage.userManagerMessage, wssConnection, lang.hitch(this, function (messageReply) {
                        this.sendBalekProtocolMessageReply(wssConnection, balekMessage, messageReply)
                    }));
                }
            }
        });
    });