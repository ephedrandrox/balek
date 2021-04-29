define(['dojo/_base/declare',
        "dojo/_base/lang",

        "balek-modules/components/interfaceCommands/interfaceCommands",
    ],
    function (declare,
              lang,
              //Component includes
              interfaceCommands) {

        return declare("diaplodeElementInterfaceCommands", [interfaceCommands], {
            _containers: null,
            _sessionKey: null,

            _shared: {},

            _interfaceCommands: {},
            _resolvesWaiting: [],

            constructor: function (args) {
                declare.safeMixin(this, args);

                if (this._shared.navigatorReady === undefined) {
                    this._shared.navigatorReady = false;
                }

                console.log("Initializing Diaplode Element Interface Commands...");
            },
            setReady: function () {
                this._shared.elementsReady = true;
                this.resolveCommandRequests();
            },
            isReady: function () {
                if (this._shared.elementsReady === true) {
                    return true;
                } else {
                    return false
                }
            }
        });
    });