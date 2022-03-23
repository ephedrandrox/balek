define(['dojo/_base/declare'],
    function (declare) {
        return declare("diaplodeConversationsController", null, {
            _module: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                if(this._module === null){
                    console.log("diaplodeConversationsController  Cannot Start!...");
                }
                console.log("diaplodeConversationsController  starting...");
            },
            createConversation: function (conversationContent) {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (conversationContent === null) {
                        Reject({error: "conversationContent === null"});
                    } else {
                        Resolve(conversationContent);
                    }
                }));
            },
            loadConversation: function (conversationContent) {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (conversationContent === null) {
                        Reject({error: "conversationContent === null"});
                    } else {
                        Resolve(conversationContent);
                    }
                }));
            }
        });
    }
);

