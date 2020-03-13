define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/Instance'],
    function (declare, lang, topic, baseInstance) {
        return declare("moduleSessionLoginInstance", baseInstance, {
            _instanceKey: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleSessionLoginInstance starting...");
            },
            receiveMessage: function (moduleMessage, wssConnection, messageCallback) {
                if (moduleMessage.instanceKey == this._instanceKey) {
                    if (moduleMessage.messageData) {
                        if (moduleMessage.messageData.request && moduleMessage.messageData.request == "Session Credentials Update") {
                            topic.publish("sessionCredentialsUpdate", wssConnection, moduleMessage.messageData.credentialData, function (sessionReply) {
                                messageCallback(sessionReply);
                            });
                        } else {
                        }
                    }
                } else {
                    console.log("received Module message with incorrect instanceKey", moduleMessage.instanceKey, this._instanceKey)
                }
            }
        });
    }
);


