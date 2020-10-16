define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        //Dojo browser includes
        'dojo/dom',
        'dojo/dom-construct',
        "dojo/_base/window",
        "dojo/ready",
        'dojo/_base/fx',
        //Dijit widget includes
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        'dojo/text!balek-modules/twitter/contacts/resources/html/contactsList.html',
        'dojo/text!balek-modules/twitter/contacts/resources/css/contactsList.css',
        //Balek Interface Includes
        'balek-modules/Interface',
        'balek-modules/base/state/synced',
        //Custom UI include
        'balek-modules/twitter/contacts/Interface/contactsListItem.js'
    ],
    function (declare,
              lang,
              topic,
              //Dojo browser includes
              dom,
              domConstruct,
              win,
              dojoReady,
              fx,
              //Dijit widget includes
              _WidgetBase,
              _TemplatedMixin,
              template,
              mainCss,
              //Balek Interface Includes
              _baseInterface,
              _stateSynced,
              //Custom UI include
              contactsListItem) {

        return declare("moduleTwitterContactsInterfaceContactsList", [_WidgetBase, _TemplatedMixin, _baseInterface, _stateSynced], {
            _instanceKey: null,

            templateString: template,
            _mainCssString: mainCss,
            baseClass: "twitterContactsInterfaceContactsList",

            _listItems: null,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._listItems = {};

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());

                 dojoReady(lang.hitch(this, function () {
                    if (this._componentKey) {
                        this.askToConnectInterface();
                    }
                }));
            },
            postCreate: function () {
                topic.publish("addToMainContentLayer", this.domNode);

                if(this._interfaceState.get("Status") === "Ready"){
                    this.introAnimation();
                }
            },

            //##########################################################################################################
            //State Functions Section
            //##########################################################################################################

            onInterfaceStateChange: function(name, oldState, newState){
               if (name === "Status" && newState === "Ready") {
                    if(this.domNode)
                    {
                        this.introAnimation();
                    }
                }else if(name.substring(0, 15) === "ContactListItem")
                {
                    console.log("New Item!", name.substring(15), newState);

                    if(  this._listItems[name.substring(15)] === undefined)
                    {
                        try{
                            if(newState && newState.id &&
                                newState.name &&
                                newState.public_metrics &&
                                newState.public_metrics.followers_count !== undefined){
                                let newContactData = newState;
                                this._listItems[name.substring(15)] = new contactsListItem(
                                                                    {   _twitterData: newContactData,
                                                                        _ContactsListDomNode: this.domNode,
                                                                        _contactsInstanceCommands: this._contactsInstanceCommands});
                            }
                            else
                            {
                                console.log("Not enough info!", name.substring(15), newState);
                            }
                        }catch(error){
                            console.log("error parsing ContactListItem", error)
                        }
                    }

                }else if(name.substring(0, 16) === "ContactListError")
                {
                     console.log("New Error!", name.substring(16), newState);
                }
            },

            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            //No Event Functions in the Contacts List Yet

            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################
            introAnimation: function(){
                fx.animateProperty({
                    node:this.domNode,
                    duration:1200,
                    properties: {
                        opacity: {end: 1},
                    }
                }).play();
            },

            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################

            unload: function () {
                this.inherited(arguments);
                this.destroy();
            }
        });
    });