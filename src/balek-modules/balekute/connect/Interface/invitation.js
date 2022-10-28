//Navigator Interface Custom Menu Class
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/dom-construct',
        "dojo/dom-class",
        "dojo/dom-style",
        "dojo/dom-attr",

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        'dojo/text!balek-modules/balekute/connect/resources/html/invitation.html'


    ],
    function (declare,
              lang,
              domConstruct,
              domClass,
              domStyle,
              domAttr,

              _WidgetBase, _TemplatedMixin,
              template,

           ) {

        return declare("moduleBalekuteConnectInvitationInterface", [_WidgetBase, _TemplatedMixin] , {

            baseClass: "moduleBalekuteConnectInvitationInterface",


            templateString: template,

            invitationKey: "",
            invitationHost: "",
            connectInterface: null,

            _statusDiv: null,
            _hostDiv: null,
            _hostnameDiv: null,
            _publicSigningKeyDiv: null,
            _keychainIdentifierDiv: null,
            _nameDiv: null,
            _osNameDiv: null,
            _signatureDiv: null,

            _qrDiv: null,
            _qrImage: null,
            qrEncodedString: "",




            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                declare.safeMixin(this, args);


                console.log("Initializing moduleBalekuteConnectInvitationInterface...");

                console.log("CDD: Initializing moduleBalekuteConnectInvitationInterface...");
              console.log("this.connectInterface._mainInterface._instanceCommands", this.connectInterface._mainInterface._instanceCommands)

            },

            postCreate: function () {
                console.log("CDD: eConnectInvitation Postcreate", this.connectInterface._instanceCommands);

                this.connectInterface._instanceCommands._connectInvitationState(this.invitationKey, lang.hitch(this, function(Update){

                   console.log("State Update", Update)

                    this.onInvitationStateChange(Update.name, Update.oldState, Update.newState)
                }))

            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            onInvitationStateChange: function (name, oldState, newState) {
                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommands and link them
                this.inherited(arguments);
                console.log("🟦🟦State Update", name, oldState, newState)

                if( name == "status"){
                    this._statusDiv.innerHTML = newState
                    switch(newState){
                        case "waiting" :
                            domClass.remove(this.domNode, "moduleBalekuteConnectInvitationInterfaceStatusAccepted")
                            domClass.add(this.domNode, "moduleBalekuteConnectInvitationInterfaceStatusWaiting")
                            break;
                        case "accepted" :
                            domClass.remove(this.domNode, "moduleBalekuteConnectInvitationInterfaceStatusWaiting")
                            domClass.add(this.domNode, "moduleBalekuteConnectInvitationInterfaceStatusAccepted")
                            break;
                    }
                }

                if( name == "host") {
                    console.log('CCCFFFGGG', newState)
                    this.invitationHost = newState
                    this._hostDiv.innerHTML = newState

                    this.connectInterface._mainInterface._instanceCommands.getQRCode("balekute://newConnection/?host=" + this.invitationHost + "&invitationKey=" + this.invitationKey).then(lang.hitch(this, function(commandReturnResults){
                        console.log("#QRCode", commandReturnResults)
                        //create new interface with callback

                        this.qrEncodedString = commandReturnResults.Result
                        console.log("#QRCode this.qrEncodedString", this.qrEncodedString)

                        if(this._qrDiv && this._qrImage)
                        {
                            this._qrImage.src = this.qrEncodedString
                        }

                    })).catch(function(commandErrorResults){
                        console.log("#QRCode", "Create QRCode Received Error Response" + commandErrorResults);
                    });

                }

                if( name == "hostname")
                {
                    this._hostnameDiv.innerHTML = newState
                }

                if( name == "publicSigningKey")
                {
                    this._publicSigningKeyDiv.innerHTML = newState
                }
                if( name == "keychainIdentifier")
                {
                    this._keychainIdentifierDiv.innerHTML = newState
                }
                if( name == "name")
                {
                    this._nameDiv.innerHTML = newState
                }
                if( name == "osName")
                {
                    this._osNameDiv.innerHTML = newState
                }
                if( name == "signature")
                {
                    this._signatureDiv.innerHTML = newState
                }


            },

            _invitationClicked: function(clickEvent){

                console.log("CDD: _invitationClicked...");


                window.open("balekute://newConnection/?host=" + this.invitationHost + "&invitationKey=" + this.invitationKey, "_self")


            },


            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################
            refreshView: function(){

            },

            //##########################################################################################################
            //Custom Menu Functions Section
            //##########################################################################################################

            //##########################################################################################################
            //Workspace Container Functions Section
            //##########################################################################################################

            toggleShowView: function(){


            },

            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################

            unload: function () {
                console.log("Destroying menu");
                this.inherited(arguments);
                this.destroy();
            }

        });
    });

