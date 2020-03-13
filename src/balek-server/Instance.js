define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-server/ioManager',
        'balek-server/systemResourceManager',
        'balek-server/configManager',
        "balek-server/protocolManager",
        "balek-server/moduleManager",
        "balek-server/sessionManager",
        "balek-server/usersManager"],
    function (declare,
              lang,
              ioManager,
              systemResourceManager,
              configManager,
              protocolManager,
              moduleManager,
              sessionManager,
              usersManager
    ) {
        return declare("BalekServerInstance", null, {

            _ioManager: null,
            _systemResourceManager: null,
            _protocolManager: null,
            _moduleManager: null,
            _configManager: null,
            _sessionManager: null,
            _usersManager: null,

            constructor: function () {
                console.log("creating server Instance");
                this._protocolManager = new protocolManager();
                this._configManager = new configManager();
                this._systemResourceManager = new systemResourceManager();
                this._ioManager = new ioManager();
                this._moduleManager = new moduleManager();
                this._sessionManager = new sessionManager();
            },
            _start: function (serverPromiseResolve, serverPromiseReject) {

                console.log("Starting server Instance");

                let ioManagerIsReady = new Promise(lang.hitch(this, function (ioManagerPromiseResolve, ioManagerPromiseReject) {
                    this._ioManager._start(ioManagerPromiseResolve, ioManagerPromiseReject);
                }));

                ioManagerIsReady.then(lang.hitch(this, function (value) {
                    console.log("IoManager is ready" + value);

                    let moduleManagerReady = new Promise(lang.hitch(this, function (moduleManagerPromiseResolve, moduleManagerPromiseReject) {
                        this._moduleManager._start(moduleManagerPromiseResolve, moduleManagerPromiseReject);
                    }));

                    moduleManagerReady.then(lang.hitch(this, function (value) {
                        console.log("ModuleManager is ready" + value);
                        this._usersManager = new usersManager();
                        serverPromiseResolve("Instance is ready");
                    })).catch(lang.hitch(this, function (error) {
                        this._error(error);
                        serverPromiseReject(error);
                    }));

                })).catch(lang.hitch(this, function (error) {
                    this._error(error);
                    serverPromiseReject(error);
                }));

                console.log("Done Starting");
            },
            _end: function () {
                //close ioManager
                //close databases
            },
            _error: function (error) {
                console.log("error in INstance" + error);
            }
        });
    });
