define(['dojo/_base/declare',
        'dojo/_base/lang',

        'balek-modules/diaplode/conversations/Instance/main',

        'balek-modules/components/syncedCommander/Instance',
        'balek-modules/components/syncedMap/Instance'
    ],
    function (declare, lang,
              MainInstance,
              syncedCommanderInstance, syncedMapInstance) {
        return declare("moduleDiaplodeConversationsInstance", syncedCommanderInstance, {
            _instanceKey: null,

            _availableUsers: null,
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("moduleDiaplodeConversationsInstance starting...");

                this._commands={
                    "createConversation" : lang.hitch(this, this.createConversation),
                    "loadConversation" : lang.hitch(this, this.loadConversation)
                };

                this._interfaceState.set("moduleName","moduleDiaplodeConversationsInstance");

                this._availableUsers  = new syncedMapInstance({_instanceKey: this._instanceKey});
                this._interfaceState.set("availableUsersComponentKey", this._availableUsers._componentKey);

                //Create Main Instance and save keys in interface state
                //will maybe make this a bunch of instances in syncedmap
                let mainInstance = new MainInstance({_instanceKey: this._instanceKey,
                    _sessionKey: this._sessionKey,
                    _userKey: this._userKey});
                this._mainInstance = mainInstance  ;
                this._interfaceState.set("mainInterfaceKeys" , {instanceKey: mainInstance._instanceKey,
                    sessionKey: mainInstance._sessionKey,
                    userKey: mainInstance._userKey,
                    componentKey: mainInstance._componentKey});

                this.prepareSyncedState();
                this.setInterfaceCommands();
            },
            //##########################################################################################################
            //Remote Commands Functions Section
            //##########################################################################################################
            createConversation: function(conversationContent, remoteCommanderCallback){
                this.moduleController.createConversation(conversationContent).then(lang.hitch(this, function (newConversation) {
                    remoteCommanderCallback({newConversation: newConversation})
                })).catch(function(rejectError){
                    remoteCommanderCallback({error: rejectError})
                })
            },
            loadConversation: function(conversationContent, remoteCommanderCallback)
            {
                this.moduleController.loadConversation().then().then(lang.hitch(this, function (newConversation) {
                    remoteCommanderCallback({newConversation: newConversation})
                })).catch(function(rejectError){
                    remoteCommanderCallback({error: rejectError})
                })
            }
        });
    }
);


