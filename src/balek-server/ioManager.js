define(['dojo/_base/declare', 'dojo/_base/lang',
        "balek-server/io/httpsManager",
        "balek-server/io/wssManager",
        'balek-server/io/databaseManager'],
    function (declare, lang, httpsManager, wssManager, databaseManager) {
        return declare("ioManager", null, {
            _httpsManager: null,
            _wssManager: null,
            _databaseManager: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                console.log("Initializing IO Manager...");

                console.log("IOManager creating http server...");
                this._httpsManager = new httpsManager();

                console.log(" IOManager creating wss server...");
                this._wssManager = new wssManager();

                console.log(" IOManager creating databaseManager...");
                this._databaseManager = new databaseManager();

            },
            _start: function (ioManagerPromiseResolve, ioManagerPromiseReject) {

                let databaseIsReady = new Promise(lang.hitch(this, function (databaseReadyPromiseResolve, databaseReadyPromiseReject) {
                    this._databaseManager._start(databaseReadyPromiseResolve, databaseReadyPromiseReject)
                }));

                databaseIsReady.then(lang.hitch(this, function (value) {
                    console.log("Database  is ready" + value);

                    let httpsIsReady = new Promise(lang.hitch(this, function (httpsReadyPromiseResolve, httpsReadyPromiseReject) {
                        this._httpsManager._start(httpsReadyPromiseResolve, httpsReadyPromiseReject);
                    }));

                    httpsIsReady.then(lang.hitch(this, function (value) {
                        console.log("httpIsReady" + value);
                        this._wssManager._start(this._httpsManager._httpsServer);
                        ioManagerPromiseResolve("httpissReady");
                    })).catch(function (error) {
                        console.log(error);
                        console.log("ERRRRRRRRRRRRROR");
                        ioManagerPromiseReject("https server had a problem starting up");
                    });

                })).catch(function (error) {
                    console.log(error);
                    console.log("ERRRRRRRRRRRRROR");
                    ioManagerPromiseReject("https server had a problem starting up");
                });
            }
        });
    });
