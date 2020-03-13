define([    'dojo/_base/declare',
            'dojo/_base/lang',
            'dojo/topic',
            'balek-modules/Instance'],
    function (declare, lang, topic, baseInstance) {
        return declare("moduleSessionMenuInstance", baseInstance, {
            _instanceKey: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleSessionMenuInstance starting...");
            },
            receiveMessage: function(moduleMessage, wssConnection)
            {
                if(moduleMessage.instanceKey == this._instanceKey)
                {
                    if(moduleMessage.messageData)
                    {
                       console.log("Shouldn't be seeing this",moduleMessage );
                    }
                }else
                {
                    console.log("received Module message with incorrect instanceKey", moduleMessage.instanceKey, this._instanceKey )
                }
            }
        });
    }
);


