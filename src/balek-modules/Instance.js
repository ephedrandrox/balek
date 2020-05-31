define(['dojo/_base/declare',
        'dojo/_base/lang'],
    function (declare,
              lang
    ) {

        return declare("BalekServerModuleInstance", null, {
            constructor: function () {
                console.log("Creating server Module base Instance");

            },
            receiveMessage: function (moduleMessage, wssConnection) {
                console.log("receivedMessage in bas class called, should be overwrote");
            },
            _start: function () {

            },
            _end: function () {
                //overwrite this and reject to keep module instance from being unloaded
                //Until all resources can be released.
                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    Resolve({success: "Unloaded Instance"});
                }));
            },
            _error: function (error) {
                console.log(error);
            }
        });
    });
