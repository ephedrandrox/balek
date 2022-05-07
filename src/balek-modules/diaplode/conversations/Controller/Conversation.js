define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/node!crypto'
    ],
    function (declare, lang, crypto) {
        return declare("diaplodeConversationsControllerConversation", null, {
            _module: null,
            _conversationsController: null,

            name: "Not Named",
            owner: { userKey: null},
            users: null,

            conversationKey: "",

            constructor: function (args) {
                declare.safeMixin(this, args);
                if(this._module === null || this._conversationsController === null){
                    console.log("diaplodeConversationsController Cannot Start!...");
                }
                console.log("diaplodeConversationsController starting...");
                this.conversationKey = String(crypto.randomUUID());
            },
            getConversationKey: function(){
                return this.conversationKey;
            },
            getOwnerKey: function(){
                return this.owner.userKey;
            },
            getUserKeys: function(){
                return this.users;
            }
        });
    }
);

