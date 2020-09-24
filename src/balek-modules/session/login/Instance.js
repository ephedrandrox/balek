define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/components/login/Instance/login',],
    function (declare, lang, topic, _loginInstance) {
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


