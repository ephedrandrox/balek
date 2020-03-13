define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/Instance',],
    function (declare, lang, topic, baseInstance) {

        return declare("moduleAdminUsersInstance", baseInstance, {
            _instanceKey: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                console.log("moduleAdminUsersInstance starting...");

            },
            receiveMessage: function (moduleMessage, wssConnection) {
                console.log("shouldn't see anything here", moduleMessage);
            }
        });
    }
);


