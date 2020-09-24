define(['dojo/_base/declare',
        'balek-modules/components/login/Instance/login',],
    function (declare,  _loginInstance) {
        return declare("moduleSessionLoginInstance", _loginInstance, {
            _instanceKey: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleSessionLoginInstance starting...");
            },
            receiveMessage: function (moduleMessage, wssConnection, messageCallback) {
                this.inherited(arguments);
            }
        });
    }
);


