define(['dojo/_base/declare'],
    function (declare
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

            },
            _error: function (error) {
                console.log(error);
            }
        });
    });
