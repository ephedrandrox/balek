//Navigator Interface Custom Menu Class
define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/dom-construct',
        "dojo/dom-class",
        "dojo/dom-style",

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        'dojo/text!balek-modules/balekute/connect/resources/html/invitation.html'


    ],
    function (declare,
              lang,
              domConstruct,
              domClass,
              domStyle,
              _WidgetBase, _TemplatedMixin,
              template,

           ) {

        return declare("moduleBalekuteConnectInvitationInterface", [_WidgetBase, _TemplatedMixin] , {

            baseClass: "moduleBalekuteConnectInvitationInterface",


            templateString: template,

            invitationKey: "",
            connectInterface: null,
            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                declare.safeMixin(this, args);


                console.log("Initializing moduleBalekuteConnectInvitationInterface...");

                console.log("CDD: Initializing moduleBalekuteConnectInvitationInterface...");

            },
            postCreate: function () {
                console.log("CDD: eConnectInvitation Postcreate", this.connectInterface._instanceCommands);

                this.connectInterface._instanceCommands._connectInvitationState(this.invitationKey, lang.hitch(this, function(Update){

                   console.log("State Update", Update)
                }))

            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            onInvitationStateChange: function (name, oldState, newState) {
                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommands and link them
                this.inherited(arguments);
                console.log(name, oldState, newState)
            },

            _invitationClicked: function(clickEvent){

                console.log("CDD: _invitationClicked...");


                window.open("balekute://localhost/&invitationKey=" + this.invitationKey)


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

