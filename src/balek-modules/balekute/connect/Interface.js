define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        "dojo/dom-construct",
        'dojo/dom-style',
        "dojo/_base/window",

        'balek-modules/balekute/connect/Interface/main',
        'balek-modules/balekute/connect/Interface/invitation',

        'balek-modules/components/syncedCommander/Interface',
        'balek-modules/components/syncedMap/Interface',

    ],
    function (declare, lang, topic,
              domConstruct, domStyle, win,
               MainInterface, Invitation,
               _SyncedCommanderInterface, SyncedMapInterface) {

        return declare("moduleBalekuteConnectInterface", _SyncedCommanderInterface, {
            _instanceKey: null,
            _mainInterface: null,

            availableInvitations: null,
            availableInvitationsWatchHandle: null,

            invitations: null,



            constructor: function (args) {
                this.invitationInterfaces = {}
                this.invitations = {}
                declare.safeMixin(this, args);
                console.log("BKConnect: starting up")


            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to be here so remoteCommander works
                this.inherited(arguments);
                console.log("Instance Status:",name, oldState, newState);

                if (name === "Status" && newState === "Ready") {
                    console.log("Instance Status:", newState);
                    //we could do something based on error status here
                }else if (name === "availableInvitationsComponentKey") {
                    if(this.availableInvitations === null){
                        this.availableInvitations = new SyncedMapInterface({_instanceKey: this._instanceKey, _componentKey: newState.toString()});
                        console.log("CDD:onInterfaceStateChange ", this.availableInvitations)

                        this.availableInvitationsWatchHandle = this.availableInvitations.setStateWatcher(lang.hitch(this, this.onAvailableInvitationsStateChange));

                    }
                }
                else if (name === "mainInstanceKeys") {
                    console.log("mainInstanceKeys:", newState);

                    if(this._mainInterface === null){
                        this._mainInterface = new MainInterface({_instanceKey: newState.instanceKey,
                            _sessionKey: newState.sessionKey,
                            _componentKey: newState.componentKey,
                            _interface: this});

                        this._mainInterface.getContainerKeys().then(lang.hitch(this, function(containerKeys){
                            //         console.log(containerKeys, typeof containerKeys );
                            if(Array.isArray(containerKeys) && containerKeys.length === 0)
                            {
                                console.log("addToCurrentWorkspace ooooooooooooooooooooooooooooooooooooooooo");
                                topic.publish("addToCurrentWorkspace",this._mainInterface );
                            }else
                            {
                                //            console.log(containerKeys.length);
                            }
                        })).catch(lang.hitch(this, function(error){
                            console.log(error);
                        }));



                    }



                }
            },
            onAvailableInvitationsStateChange: function(name, oldState, newState){
                console.log("CDD:onAvailableInvitationsStateChange ", name, oldState, newState)

                if( !this.invitations[name.toString()]){
                    console.log("CDD:", "onAvailableInvitationsStateChange creating interface", name);

                    let newInvitation = new Invitation({invitationKey: name.toString(), connectInterface: this});
                   // this.invitations[name.toString()] = newInvitation;
                    console.log("CDD:", "onAvailableInvitationsStateChange", newInvitation);


                    this._mainInterface.onNewInvitation(newInvitation)
                }else {
                    console.log("CDD", "onAvailableInvitationsStateChange", this._menuInterfaces);
                }

            },
            getWorkspaceDomNode: function () {
                console.log("BKConnect: getWorkspaceDomNode called")
                return undefined
            },
            toggleShowView: function () {
                console.log("BKConnect: toggleShowView called")
            },
            unload: function () {

            }
        });
    }
);
