define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        //Dojo browser includes
        'dojo/dom-construct',
        "dojo/_base/window",
        "dojo/ready",
        'dojo/_base/fx',
        //Dijit widget includes
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        'dojo/text!balek-modules/twitter/contacts/resources/html/contactsMenu.html',
        'dojo/text!balek-modules/twitter/contacts/resources/css/contactsMenu.css',
        //Balek Interface Includes
        'balek-modules/Interface',
        'balek-modules/base/state/synced',
        //Custom UI include
        "balek-modules/twitter/ui/input/getUserInputStringOrJSONFile",
    ],
    function (declare,
              lang,
              topic,
              //Dojo browser includes
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
              getUserInput) {
        return declare("moduleTwitterContactsInterfaceContactsMenu", [_WidgetBase, _TemplatedMixin, _baseInterface, _stateSynced], {
            _instanceKey: null,                                     //set by initializer
            _sessionKey: null,                                      //set by initializer
            _userKey: null,                                         //set by initializer
            _componentKey: null,                                    //set by initializer
            _contactInstanceCommands: null,                         //set by initializer

            templateString: template,                               //html template used to create widget
            _mainCssString: mainCss,                                //css for html that is added to body
            baseClass: "twitterContactsInterfaceContactsMenu",      //base class namespace and css class

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {
                declare.safeMixin(this, args);
                //Place the css file as a tag into the body
                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                //once the DOM is ready ask to connect Interface to stateSynced Instance based on Component Key
                dojoReady(lang.hitch(this, function () {
                    if (this._componentKey) {
                        this.askToConnectInterface();
                    }
                }));
            },
            postCreate: function () {
                //After widget is created, add it to the main Content Layer
                topic.publish("addToMainContentLayer", this.domNode);
                //If Status state says Instance is ready, show Dom Node
                if(this._interfaceState.get("Status") === "Ready"){
                    this.introAnimation();
                }
            },

            //##########################################################################################################
            //State Functions Section
            //##########################################################################################################

            onInterfaceStateChange: function(name, oldState, newState){
                console.log("Contacts Menu State change", name, newState);
                //if status is ready and widget domNode has been created, show Dom Node
                if (name === "Status" && newState === "Ready") {
                    if(this.domNode)
                    {
                        this.introAnimation();
                    }
                }
            },

            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            _onAddContactClicked: function(event){
                //called when button is clicked, set in html template
                //create new getUserInput Interface and send input to importContacts remote Instance command
                let getContacts = new getUserInput({stringQuestion: "Provide a user to add to your contacts",
                                                    fileQuestion: "Select a JSON file with an array of usernames",
                                                    inputReplyCallback: lang.hitch(this, function(contactsToLookup)
                {
                    console.log("Looking Up Contacts", contactsToLookup);
                    this._contactInstanceCommands.importContacts(contactsToLookup).then(function (results) {
                        //log results from Instance
                        console.log(results);
                    });
                    //unload the widget when done
                    getContacts.unload();
                }) });
            },

            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################
            introAnimation: function(){
                //fade in domNode over 600ms
                fx.animateProperty({
                    node:this.domNode,
                    duration:600,
                    properties: {
                        opacity: {end: 1},
                    }
                }).play();
            },

            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################

            unload: function () {
                //Call inherited object unload
                this.inherited(arguments);
                //destroy widget
                this.destroy();
            }
        });
    });