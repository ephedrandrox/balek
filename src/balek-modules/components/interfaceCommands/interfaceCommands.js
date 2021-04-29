define(['dojo/_base/declare',
        "dojo/_base/lang"
/*
Extend this class to share commands with other interfaces
 */

    ],
    function (declare, lang) {

        return declare("diaplodeComponentInterfaceCommands", null, {
            _containers: null,
            _sessionKey: null,

            _shared: {},

            _interfaceCommands: null, //Must be declared as {} in extended class
            _resolvesWaiting: null,  //Must be declared as [] in extended class

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("Initializing Diaplode Component Interface Commands...");
            },
            isReady: function () {
                return false;
            },
            getCommands: function () {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (this.isReady() === true) {
                        Resolve(this._interfaceCommands);
                    } else {
                        this._resolvesWaiting.push({Resolve: Resolve, Reject: Reject});
                    }
                }));
            },
            setCommand: function (key, commandFunction) {
                if (this._interfaceCommands !== null) {
                    this._interfaceCommands[String(key)] = commandFunction;
                } else {
                    console.log("Error: Component interfaceCommands - no _interfaceCommands - should be declared as {} in extended class", this);
                }
            },
            resolveCommandRequests: function () {
                if (this._resolvesWaiting !== null) {
                    this._resolvesWaiting.forEach(lang.hitch(this, function (commandRequest) {
                        commandRequest.Resolve(this._interfaceCommands);
                    }));
                } else {
                    console.log("Error: Component interfaceCommands - no _resolvesWaiting - should be declared as [] in extended class", this)
                }
            }
        });
    });