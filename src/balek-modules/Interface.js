define(['dojo/_base/declare'],
    function (declare
    ) {

        return declare("BalekServerModuleInterface", null, {

            constructor: function () {
                //todo make an array of watch handles for unload

            },
            _start: function () {

            },
            _end: function () {

            },
            _error: function (error) {
                console.log(error);
            },
            receiveMessage: function (moduleMessage, wssConnection) {//override
            },
            unload: function () {
                console.log("unload Method not overridden in " + this._moduleName);
            }
        });
    });
