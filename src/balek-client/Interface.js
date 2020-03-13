define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-client/ioManager',
        'balek-client/uiManager',
        'balek-client/protocolManager',
        'balek-client/moduleManager',
        'balek-client/sessionManager',
        'balek-client/userManager'
    ],
    function (declare,
              lang,
              ioManager,
              uiManager,
              protocolManager,
              moduleManager,
              sessionManager,
              userManager) {

        return declare("balekInterface", null, {
            _protocolManager: null,
            _uiManager: null,
            _ioManager: null,
            _moduleManager: null,
            _sessionManager: null,
            _userManager: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._protocolManager = new protocolManager();

                this._uiManager = new uiManager();

                this._ioManager = new ioManager();

                this._moduleManager = new moduleManager();

                this._sessionManager = new sessionManager();

                this._userManager = new userManager();

                this._ioManager._wssManager.connectMainSocket("wss://" + window.location.host);

            }
        });
    }
);
