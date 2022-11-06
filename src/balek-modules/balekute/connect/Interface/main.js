define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-style',
        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/on',
        "dojo/dom-attr",
        "dojo/keys",
        "dijit/focus",
        "dojo/ready",
        "dijit/InlineEditBox",
        "dijit/form/TextBox",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',



        'dojo/text!balek-modules/balekute/connect/resources/html/main.html',
        'dojo/text!balek-modules/balekute/connect/resources/css/main.css',
        'dojo/text!balek-modules/balekute/connect/resources/css/invitation.css'
    ],
    function (declare, lang, topic, domClass, domStyle, domConstruct, win, on, domAttr, dojoKeys,
              dijitFocus, dojoReady, InlineEditBox, TextBox,
              _WidgetBase, _TemplatedMixin,
              _SyncedCommanderInterface,
              _BalekWorkspaceContainerContainable,
              template,
              mainCss,
              invitationCss) {
        return declare("moduleBalekuteConnectInterface", [_WidgetBase, _TemplatedMixin, _SyncedCommanderInterface, _BalekWorkspaceContainerContainable], {
            _instanceKey: null,
            _interface: null,
            templateString: template,
            baseClass: "moduleBalekuteConnectInterface",

            _mainCssString: mainCss,
            _invitationCssString: invitationCss,

            _invitationsDiv: null,

            _qrDiv: null,
            _qrImage: null,
            qrEncodedString: "",

            targetKey: "",


            _createInvitationClicked: function(clickEvent){
                console.log(this._instanceCommands)



                this._interface._instanceCommands.createInvitationKey(location.hostname).then(function(commandReturnResults){
                    console.log("#CDD", commandReturnResults)
                    //create new interface with callback
                }).catch(function(commandErrorResults){
                    console.log("#CD", "Create Invitation Key Received Error Response" + commandErrorResults);
                });



            },
            _loginWithPassword: function(clickEvent){
                //The connect interface allows balekute devices to connect
                //Since we are a web interface, lets load the login
                // topic.publish("requestModuleLoad", "session/login");
                topic.publish("requestModuleLoad", "diaplode/login");
            },
            _qrClicked: function(clickEvent){
                window.open("balekute://newConnection/?host=" + location.hostname + "&targetKey=" + this.targetKey, "_self")

            },
            constructor: function (args) {
                this._interface = {};


                declare.safeMixin(this, args);
                console.log("BKConnect: staring up")
                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                domConstruct.place(domConstruct.toDom("<style>" + this._invitationCssString + "</style>"), win.body());
                this.setContainerName(" 📱 - Balekute Connect - ");
                dojoReady(lang.hitch(this, function () {
                    if (this._componentKey) {
                        this.askToConnectInterface();
                    }
                }));
            },

            onInterfaceStateChange: function (name, oldState, newState) {
                console.log("🆘🆘calling", name, oldState, newState);
                this.inherited(arguments);     //this has to be done so remoteCommander works

            if(name == "targetKey"){
                this.targetKey = newState
                this._instanceCommands.getQRCode("balekute://newConnection/?host=" + location.hostname + "&targetKey=" + newState).then(lang.hitch(this, function(commandReturnResults){
                    // console.log("#QRCode", commandReturnResults)
                    //create new interface with callback

                    this.qrEncodedString = commandReturnResults.Result
                    // console.log("#QRCode this.qrEncodedString", this.qrEncodedString)

                    if(this._qrDiv && this._qrImage )
                    {
                        this._qrImage.src = this.qrEncodedString
                    }

                })).catch(function(commandErrorResults){
                    console.log("#QRCode", "Create QRCode Received Error Response" + commandErrorResults);
                });
            }
                if(name == "targetActivated"){

                    topic.publish("requestSessionUnloadModuleInstance", this._instanceKey,
                        lang.hitch(this, function (loginReply) {
                                if(loginReply.error === undefined)
                                {
                                    topic.publish("getSessionState", lang.hitch(this, function (sessionState) {
                                        let availableSessions = sessionState.get("availableSessions");
                                        let firstSessionKey = Object.keys(availableSessions)[0];

                                        if(firstSessionKey && firstSessionKey !== null)
                                        {
                                            topic.publish("requestSessionChangeAndUnloadAll", firstSessionKey);
                                        }else
                                        {
                                            topic.publish("requestModuleLoad", "diaplode/elements/files");

                                            topic.publish("requestModuleLoad", "diaplode/elements/notes");
                                            topic.publish("requestModuleLoad", "diaplode/elements/tasks");

                                            topic.publish("requestModuleLoad", "diaplode/navigator");
                                            topic.publish("requestModuleLoad", "diaplode/commander");

                                           // topic.publish("loadBackground", "flowerOfLife");

                                            this.destroy();
                                        }
                                    }));
                                }
                                else
                                {
                                    alert(loginReply.error);
                                    //todo Maybe make a reset switch and use it here,
                                }
                        }));
                }
            },
            onNewInvitation: function(invitation){
                console.log("CDD: newIn", invitation);

                domConstruct.place(invitation.domNode, this._invitationsDiv)

            },

            postCreate: function () {
                this.initializeContainable();

            },
            startupContainable: function(){
                //called after containable is started
                console.log("startupContainable main scan containable");
            },
            unload: function () {

                this.inherited(arguments);
                this.destroy();
            }
        });
    });