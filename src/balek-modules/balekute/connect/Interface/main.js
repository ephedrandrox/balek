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

            _createInvitationClicked: function(clickEvent){
                console.log(this._instanceCommands)

                let invitationInterface = null;



                this._interface._instanceCommands.createInvitationKey(location.hostname).then(function(commandReturnResults){
                    console.log("#CDD", commandReturnResults)
                    //create new interface with callback
                }).catch(function(commandErrorResults){
                    console.log("#CD", "Create Invitation Key Received Error Response" + commandErrorResults);
                });



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
                console.log("calling");
                this.inherited(arguments);     //this has to be done so remoteCommander works
            },
            onNewInvitation: function(invitation){
                console.log("CDD: newIn", invitation);

                domConstruct.place(invitation.domNode, this._invitationsDiv)

            },
            postCreate: function () {
                this.initializeContainable();

            },
            startupContainable: function(){
                console.log("startupContainable main scan containable");
            },
            unload: function () {

                this.inherited(arguments);
                this.destroy();
            }
        });
    });