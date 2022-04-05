define(['dojo/_base/declare', 'dojo/_base/lang',
    'dojo/Stateful',
    'balek-modules/diaplode/conversations/Controller/Conversation'],
    function (declare, lang, Stateful, Conversation) {
        return declare("diaplodeConversationsController", null, {
            _module: null,

            _conversations: null,

            _userConversationsStateMaps: null,

            statusAsState: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                this._conversations = {};

                this._userConversationsStateMaps = {};

                let StatusState = declare([Stateful], {});

                this.statusAsState = new StatusState({});

                if(this._module === null){
                    console.log("diaplodeConversationsController  Cannot Start!...");
                }
                console.log("diaplodeConversationsController  starting...");
            },
            //Interface Commands:
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
                            //New Conversation Created!
                            let newConversation = Conversation({owner: conversationContent.owner, users: new Array(conversationContent.users), _conversationsController: this, _module: this._module});
                            let newConversationKey = newConversation.getConversationKey()
                            if(newConversationKey !== null)
                            {

                                //Add it to the conversations array
                                this._conversations[newConversationKey.toString()]  = newConversation;
                                //add to all users lists:


                                this.refreshConversationUsersLists(newConversation);
                                debugger;

                                Resolve({sent: conversationContent, newKey: newConversationKey});
                            }else {
                                //no key, no go
                                Reject({error: "new conversation could not produce key."});
                            }
                        }else
                        {
                            Reject({error: "conversationContent is not structured correctly."});
                        }
                    }
                }));
            },
            createUserConversationsStateMap: function(userKey){
                if(!this._userConversationsStateMaps[userKey])
                {
                    let conversationsStateMap = declare([Stateful], {});
                    let newStateMap = new conversationsStateMap({});
                    this._userConversationsStateMaps[userKey] = newStateMap;
                    return newStateMap;
                }else {
                     return this._userConversationsStateMaps[userKey]
                }
            },
            getUserConversationsStateMap: function(userKey){
                if(this._userConversationsStateMaps[userKey] )
                {
                    return this._userConversationsStateMaps[userKey];

                }else {
                     return this.createUserConversationsStateMap(userKey);
                }
            },
            refreshConversationUsersLists: function(conversation)
            {
                if(conversation && typeof conversation.getOwnerKey === `function`  && typeof conversation.getUserKeys === `function`)
                {
                    let ownerKey = conversation.getOwnerKey();
                    let userKeys = conversation.getUserKeys();
                    let conversationKey = conversation.getConversationKey();
                    if( ownerKey != null && Array.isArray(userKeys)){
                            let ownerStateMap = this.getUserConversationsStateMap(ownerKey);
                            ownerStateMap.set(String(conversationKey) ,"Active");
                        debugger;
                        userKeys.forEach(lang.hitch(this, function(userKey){
                            let userStateMap = this.getUserConversationsStateMap(userKey);
                            userStateMap.set(String(conversationKey), "Active")
                        }))

                    }
                }

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
