define(['dojo/_base/declare', 'dojo/_base/lang', 'dojo/topic'],
    function (declare, lang, topic) {
        return declare("wssConnection", null, {
            _wssConnection: null,
            _sessionKey: null,
            constructor: function (args) {

                declare.safeMixin(this, args);

                if (this._wssConnection != null) {
                    console.log("Initializing webSocket Secure Connection...");

                    this._wssConnection.on('message', lang.hitch(this, "onWebSocketMessage"));
                    this._wssConnection.on('close', lang.hitch(this, "onWebSocketClose"));
                    this._wssConnection.on('error', lang.hitch(this, "onWebsocketError"));

                    topic.publish("requestSessionKey", this);
                }
            },
            sendDataToClient: function (dataToSend) {
                let thestring = JSON.stringify(dataToSend);

                if (this._wssConnection && this._wssConnection.readyState === this._wssConnection.OPEN)
                    this._wssConnection.sendUTF(thestring);

            },
            onWebSocketMessage: function (wsMessage) {
                if (wsMessage.type === 'utf8') {
                    let dataReceived = JSON.parse(wsMessage.utf8Data);

                    if (dataReceived.balekProtocolMessage != null) {
                        topic.publish("receiveBalekProtocolMessage", dataReceived.balekProtocolMessage, this);
                    } else {
                        console.log("####Exception: Do not recognize message received from client");
                    }
                } else if (wsMessage.type === 'binary') {
                    console.log('Received Binary Message of ' + wsMessage.binaryData.length + ' bytes');
                }
            },
            onWebSocketClose: function (reasonCode, description) {
                console.log((new Date()) + ' Peer ' + this._wssConnection.remoteAddress + ' disconnected.');
                topic.publish("setSessionDisconnected", this._sessionKey);
                console.log(reasonCode, description);

            },
            onWebsocketError: function (reasonCode, description) {
                console.log((new Date()) + ' Peer ' + this._wssConnection.remoteAddress + ' threw error.');
                console.log(reasonCode, description);
            }
        });
    });
