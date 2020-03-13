define(['dojo/_base/declare', 'dojo/_base/lang',
        "dojo/node!https",
        "dojo/topic",
        "balek-server/io/fileManager"
    ],
    function (declare, lang, https, topic,
              fileManager) {
        return declare("httpsManager", null, {
            _httpsServer: null,
            _httpsAddress: null,
            _httpsPort: null,
            _fileManager: null,

            _mimiTypes: null,

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("Initializing http Manager...");

                //todo remove this from here and config communicate with topics
                this._fileManager = new fileManager();

            },
            _start: function (httpsReadyPromiseResolve, httpsReadyPromiseReject) {
                this._httpsReadyPromiseResolve = httpsReadyPromiseResolve;
                this._httpsReadyPromiseReject = httpsReadyPromiseReject;
                topic.publish("getHttpsSettingsWithCallback", lang.hitch(this, function (httpsSettings) {

                    this._mimiTypes = httpsSettings.mimiTypes;

                    this._httpsServer = https.createServer(httpsSettings.httpsOptions);

                    this._httpsServer.on('request', lang.hitch(this, "onhttpServerRequest"));

                    this._httpsServer.on('listening', lang.hitch(this, function () {
                        this._httpsReadyPromiseResolve(true);
                    }));

                    this._httpsServer.on('error', lang.hitch(this, function (error) {
                        console.log("ERRRRRRRRRRRRROR");
                        this._httpsReadyPromiseReject(error);
                    }));

                    this._httpsAddress = httpsSettings.address;
                    this._httpsPort = httpsSettings.port;

                    console.log("port:" + this._httpsPort + "address:" + this._httpsAddress);

                    this._httpsServer.listen(this._httpsPort, this._httpsAddress);

                }));

            },
            onhttpServerRequest: function (request, response) {

            	//todo replace this function in release and use docker apache image to server files
                //remove query string from URL
                if (request.url.indexOf("?") != -1) {
                    requestURL = request.url.substring(0, request.url.indexOf("?"));
                    //	console.log("requested file: " + requestURL);
                } else {
                    requestURL = request.url;
                }

                if (requestURL == "/closeServer") {
                    console.log("closing server");
                    response.end();
                    this._httpsServer.close();
                } else {
                    if (requestURL.startsWith("/dojo/")) {
                        var fileToReturn = "lib/dojo-release-src" + requestURL;

                    } else if (requestURL.startsWith("/dijit/")) {
                        var fileToReturn = "lib/dojo-release-src" + requestURL;
                    } else if (requestURL.startsWith("/dojox/")) {
                        var fileToReturn = "lib/dojo-release-src" + requestURL;
                    } else if (requestURL.startsWith("/balek-client/")) {
                        var fileToReturn = "src/" + requestURL.substring(1);
                    } else if (requestURL.startsWith("/balek/")) {
                        var fileToReturn = "src/" + requestURL.substring(1);
                    } else if (requestURL.startsWith("/balek-modules/")) {
                        var fileToReturn = "src/" + requestURL.substring(1);
                    } else if (requestURL.startsWith("/release/")) {
                        let requestInRelease = requestURL.substr(9);
                        //if(requestInRelease.startsWith("/dojo"))


                        var fileToReturn = requestURL.substring(1);


                        if (fileToReturn.endsWith("/")) {
                            fileToReturn = "release/balek/balek-client/resources/index.html";
                        } else if (fileToReturn.endsWith("balek.css")) {
                            fileToReturn = "release/balek/balek-client/resources/css/balek.css";
                        } else {
                            fileToReturn = "release/balek/" + requestInRelease;
                        }

                    } else if (requestURL == "/") {
                        var fileToReturn = "src/balek-client/resources/index.html";

                    } else {
                        var fileToReturn = "src/balek-client/resources" + requestURL;
                    }

                    this._fileManager.returnFile(fileToReturn,
                        null,
                        lang.hitch({
                                "_httpsManager": this,
                                "_response": response,
                                "_request": request,
                                "_requestURL": requestURL,
                                "_fileName": fileToReturn
                            },
                            function (fileErr, fileData) {

                                if (fileErr) {
                                    console.log("fileread callback called with Error for :" + this._request.url);
                                    this._httpsManager.sendContent(this._response, this._httpsManager._mimiTypes["txt"], JSON.stringify(fileErr));
                                } else {
                                    //console.log("fileread callback called with success for :" + this._request.url);

                                    var fileExtension = this._fileName.split('.').pop();

                                    //	console.log("file Extension:" + fileExtension);

                                    if (this._httpsManager._mimiTypes[fileExtension])
                                        this._httpsManager.sendContent(this._response, this._httpsManager._mimiTypes[fileExtension], fileData);
                                    else
                                        this._response.end();


                                }
                                //this._response.end();
                            }));
                }
            },
            sendContent: function (response, contentType, contentData) {

                let content_length = contentData.length;
                response.writeHead(200, {
                    'Content-Length': content_length,
                    'Content-Type': contentType
                });
                response.end(contentData);
            }
        });
    });
