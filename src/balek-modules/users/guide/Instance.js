define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/Instance'],
    function (declare, lang,baseInstance) {
        return declare("moduleUsersGuideInstance", baseInstance, {
            _instanceKey: null,

            constructor: function (args) {

                declare.safeMixin(this, args);
                console.log("moduleUsersGuideInstance starting...");


            },
            receiveMessage: function (moduleMessage, wssConnection) {
                console.log("shouldn't be seeing anything here" , moduleMessage);
            }
        });
    }
);


