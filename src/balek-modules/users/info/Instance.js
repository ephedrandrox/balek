define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/Instance'],
    function (declare, lang, topic, baseInstance) {
        return declare("moduleUsersInfoInstance", baseInstance, {
            _instanceKey: null,

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("moduleUsersInfoInstance starting...");

                //todo make login a component with no Instance

            },
            receiveMessage: function (moduleMessage, wssConnection) {
                console.log("shouldn't be seeing anything here" , moduleMessage);
            }
        });
    }
);


