define(['dojo/_base/declare', 'dojo/topic'
    ],
    function (declare, topic
    ) {

        return declare("BalekServerInterface", null, {

            constructor: function () {
                //todo make an array of watch handles for unload

                //todo make Promise function for communicating with Instance

            },
            _start: function () {

            },
            _end: function () {

            },
            _error: function (error) {
                console.log(error);
            },
            receiveMessage: function (moduleMessage, wssConnection) {//override
            },
            unload: function () {
                console.log("unload Method not overridden in " + this._moduleName);
            },
            sendInstanceCallbackMessage(message, messageCallback){

                topic.publish("sendBalekProtocolMessageWithReplyCallback", {
                    moduleMessage: {
                        instanceKey: this._instanceKey, messageData: message
                    }
                }, messageCallback);

            },
            sendInstanceMessage(message){

                topic.publish("sendBalekProtocolMessage", {
                    moduleMessage: {
                        instanceKey: this._instanceKey, messageData: message
                    }
                });

            },

        });
    });
