define(['dojo/_base/declare', 'dojo/_base/lang',
        "dojo/node!websocket", "balek-server/io/ws/wssConnection",
        'dojo/node!crypto'],
    function (declare, lang, webSocket, wssConnection, crypto) {
        return declare("wssManager", null, {
            _wssServer: null,
            _wssConnections: [],
            _maxReceivedFrameSize: 64, //64kb
            _maxReceivedMessageSize: 10, //10Mb

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("Initializing webSocket Manager...");

            },
            _start: function (httpsServer) {
                console.log("starting wssManager");
                this._wssServer = new webSocket.server({
                    httpServer: httpsServer,
                    autoAcceptConnections: false,
                    maxReceivedFrameSize: this.maxReceivedFrameSize * 1024,
                    maxReceivedMessageSize: this._maxReceivedMessageSize * 1024 * 1024
                });

                this._wssServer.on('request', lang.hitch(this, "onWebSocketRequest"));

            },
            onWebSocketRequest: function (request) {
                console.log("***websocket request" + request.origin);
                //fix this to check if active
                try {
                    //todo fix error that crashes server if no protocol is specified
                    var acceptedConnection = request.accept('balek-protocol', request.origin);
                    console.log((new Date()) + ' Connection accepted.');

                    let newKey = this.getUniqueWssConnectionsKey();
                    this._wssConnections[newKey] = new wssConnection({
                        "_wssConnection": acceptedConnection,
                        "_wssConnectionKey": newKey
                    });
                } catch (Err) {
                    console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.' + Err);
                }
            },
            getUniqueWssConnectionsKey: function () {
                do {
                    var id = crypto.randomBytes(20).toString('hex');
                    if (typeof this._wssConnections[id] == "undefined") return id;
                } while (true);
            }
        });
    });
