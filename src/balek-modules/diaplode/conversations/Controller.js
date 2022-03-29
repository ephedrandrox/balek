define(['dojo/_base/declare', 'dojo/_base/lang',
    'balek-modules/diaplode/conversations/Controller/Conversation'],
    function (declare, lang, Conversation) {
        return declare("diaplodeConversationsController", null, {
            _module: null,

            _conversations: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                this._conversations = [];
                if(this._module === null){
                    console.log("diaplodeConversationsController  Cannot Start!...");
                }
                console.log("diaplodeConversationsController  starting...");
            },
            createConversation: function (conversationContent) {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (conversationContent === null) {
                        //Make sure that the Interface sent a conversationContent Object
                            Reject({error: "conversationContent === null"});
                    } else {
                        //Make sure that the conversationContent Object is structured correctly
                        if(conversationContent && conversationContent.name && typeof conversationContent.name === 'string'
                            && conversationContent.users && Array.isArray(conversationContent.users)
                            && conversationContent.owner && conversationContent.owner.userKey)
                        {
                            let newConversation = Conversation({owner: conversationContent.owner});
                            Resolve({sent: conversationContent, return: newConversation});
                        }else
                        {
                            Reject({error: "conversationContent is not structured correctly."});
                        }
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

