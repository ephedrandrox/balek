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

                if (this._wssConnection && this.isConnected())
                    this._wssConnection.sendUTF(thestring);

            },
            onWebSocketMessage: function (wsMessage) {
                if (wsMessage.type === 'utf8') {

                    try{
                        let dataReceived = JSON.parse(wsMessage.utf8Data);

                        if (dataReceived.balekProtocolMessage != null) {
                            topic.publish("receiveBalekProtocolMessage", dataReceived.balekProtocolMessage, this);
                        } else {
                            console.log("####Exception: Do not recognize message received from client");
                        }
                    }
                    catch(error)
                    {
                        console.log("Error: " + error);
                        console.log("From Message: " + wsMessage.utf8Data);
                    }

                } else if (wsMessage.type === 'binary') {
                    console.log('Received Binary Message of ' + wsMessage.binaryData.length + ' bytes');
                }
            },
            onWebSocketClose: function (reasonCode, description) {
                console.log((new Date()) + ' Peer ' + this._wssConnection.remoteAddress + ' disconnected.');
                topic.publish("setSessionDisconnected", this._sessionKey);
                //todo make this tell the session is contains to disassociate and remove the publish event
                console.log(reasonCode, description);

            },
            onWebsocketError: function (reasonCode, description) {
                console.log((new Date()) + ' Peer ' + this._wssConnection.remoteAddress + ' threw error.');
                console.log(reasonCode, description);
            },
            close: function(reasonForClose, timeout){
                topic.publish("sendBalekProtocolMessage", this, {systemMessage: {message: "Connection closing in " + Math.floor(timeout/1000) + " seconds" , reasonForClose: reasonForClose}});

                setTimeout( lang.hitch(this, function(){
                        this._wssConnection.close();
                }), timeout);

            },
            isConnected: function(){
                if(this._wssConnection.state === "open")
                {
                    return true;
                }else
                {
                    return false;
                }
            }
        });
    });
