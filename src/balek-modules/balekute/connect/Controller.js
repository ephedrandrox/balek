define(['dojo/_base/declare', 'dojo/_base/lang',
        'dojo/topic',

        'dojo/Stateful',
        'balek-modules/balekute/connect/Controller/Invitation'
    ],
    function (declare, lang, topic, Stateful, Invitation
 ) {
        return declare("balekuteConnectController", null, {
            _module: null,

            _invitations: null,

            _invitationStates: null,

            statusAsState: null,


            mongoConnection: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                this._invitations = {};
                this._invitationStates = {}

                this._userConversationsStateMaps = {};

                let StatusState = declare([Stateful], {});

                this.statusAsState = new StatusState({});

                if(this._module === null){
                    console.log("diaplodeConversationsController  Cannot Start!...");
                }

                topic.publish("getMongoSettingsWithCallback", lang.hitch(this, function (mongoDBConfig) {
                    topic.publish("getMongoDbConnection", mongoDBConfig.host, mongoDBConfig.port, mongoDBConfig.user, mongoDBConfig.password, mongoDBConfig.database, lang.hitch(this, function (dbConnection) {
                        this.mongoConnection = dbConnection;
                    }));
                }));


                console.log("diaplodeConversationsController  starting...");
            },
            //Interface Commands:
            createInvitation: function (input) {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (input === null) {
                        //Make sure that the Interface sent a conversationContent Object
                            Reject({error: "input === null"});
                    } else {
                        //Make sure that the conversationContent Object is structured correctly
                        if(input && input.owner && input.owner.userKey)
                        {
                            //New Conversation Created!
                            let newInvitation = Invitation({owner: input.owner,  _connectController: this, _module: this._module});
                            let newInvitationKey = newInvitation.getKey()
                            if(newInvitationKey !== null)
                            {

                                //Add it to the conversations array
                                this._invitations[newInvitationKey.toString()]  = newInvitation;
                                //add to all users lists:
                                Resolve({result: "success", newKey: newInvitationKey});
                            }else {
                                //no key, no go
                                Reject({error: "new invitation could not produce key."});
                            }
                        }else
                        {
                            Reject({error: "input has no owner or userKey.", input});
                        }
                    }
                }));
            },
            useInvitationKey: function (invitationKey) {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (invitationKey === null) {
                        Reject({error: "conversationContent === null"});
                    } else {

                        if(this._invitations[invitationKey]){
                            let invitation = this._invitations[invitationKey]

                            if ( typeof invitation.useKey === 'function') {
                                let invitationStatus = invitation.useKey(invitationKey);
                                if( invitationStatus == "accepted" )
                                {
                                    Resolve({invitationKey: invitationKey, status: invitationStatus});
                                }else{
                                    Reject({error: "Not Accepted", status : invitationStatus});
                                }
                            }else{
                                Reject({error: "Invitation can not use key!"});
                            }



                        }else{
                            Reject({error: "Invitation is not available"});
                        }
                    }
                }));
            },

            //Instance Commands
            getInvitationState: function(invitationKey){
                if(this._invitations[invitationKey] && typeof this._invitations[invitationKey].getStatusState === 'function' )
                {
                    return this._invitations[invitationKey].getStatusState()
                }else {
                    return undefined
                }
            },
        });
    }
);
