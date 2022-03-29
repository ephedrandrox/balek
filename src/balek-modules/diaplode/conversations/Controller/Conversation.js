define(['dojo/_base/declare', 'dojo/_base/lang'],
    function (declare, lang) {
        return declare("diaplodeConversationsControllerConversation", null, {
            _module: null,
            _conversationsController: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                if(this._module === null || this._conversationsController === null){
                    console.log("diaplodeConversationsController Cannot Start!...");
                }
                console.log("diaplodeConversationsController starting...");
            }
        });
    }
);

