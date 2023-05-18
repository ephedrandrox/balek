define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/Instance',
        'dojo/node!crypto',
        'dojo/node!util'

    ],
    function (declare, lang, topic, baseInstance, nodeCrypto, nodeUtil) {
        return declare("moduleDiaplodeLoginInstance", baseInstance, {
            _instanceKey: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDiaplodeLoginInstance starting...");
            },
            receiveMessage: function (moduleMessage, wssConnection, messageCallback) {
                if (moduleMessage.instanceKey == this._instanceKey) {
                    if (moduleMessage.messageData) {
                        if (moduleMessage.messageData.request && moduleMessage.messageData.request == "Session Credentials Update") {

                            if(moduleMessage.messageData.credentialData.passwordNotEncrypted){
                                let passwordPlainText = moduleMessage.messageData.credentialData.password;
                                const encoder = new nodeUtil.TextEncoder();
                                let passwordHash = nodeCrypto.createHash('sha512');

                                passwordHash.on('readable', lang.hitch(this, function(){
                                    const passwordHashText = Array.prototype.map.call(new Uint8Array(passwordHash.read()), x => (('00' + x.toString(16)).slice(-2))).join(''); // decoder.decode(passwordHash.read());
                                    if(passwordHashText){
                                        moduleMessage.messageData.credentialData.password = passwordHashText;
                                        topic.publish("sessionCredentialsUpdate", wssConnection, moduleMessage.messageData.credentialData, function (sessionReply) {
                                            messageCallback(sessionReply);
                                        });
                                    }else {
                                        //could messageCallback with an error here
                                    }
                                }));
                                passwordHash.write(encoder.encode(passwordPlainText));
                                passwordHash.end();
                            }else {
                                topic.publish("sessionCredentialsUpdate", wssConnection, moduleMessage.messageData.credentialData, function (sessionReply) {
                                    messageCallback(sessionReply);
                                });
                            }
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


