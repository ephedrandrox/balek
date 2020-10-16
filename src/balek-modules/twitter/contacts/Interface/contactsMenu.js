define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        //Dojo browser includes
        'dojo/dom',
        'dojo/dom-construct',
        "dojo/_base/window",
        "dojo/window",
        "dojo/ready",
        'dojo/_base/fx',
        "dojox/fx/ext-dojo/complex",
        //Dijit widget includes
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        'dojo/text!balek-modules/twitter/contacts/resources/html/contactsMenu.html',
        'dojo/text!balek-modules/twitter/contacts/resources/css/contactsMenu.css',
        //Balek Interface Includes
        'balek-modules/components/syncedCommander/Interface',
        //Custom UI include
        "balek-modules/twitter/ui/input/getUserInputStringOrJSONFile",
    ],
    function (declare,
              lang,
              topic,
              //Dojo browser includes
              dom,
              domConstruct,
              win,
              window,
              dojoReady,
              fx,
              fxComplexExt,
              //Dijit widget includes
              _WidgetBase,
              _TemplatedMixin,
              template,
              mainCss,
              //Balek Interface Includes
              _syncedCommanderInterface,
              //Custom UI include
              getUserInput) {
        return declare("moduleTwitterContactsInterfaceContactsMenu", [_WidgetBase, _TemplatedMixin, _syncedCommanderInterface], {
            _instanceKey: null,                                     //set by initializer
            _sessionKey: null,                                      //set by initializer
            _userKey: null,                                         //set by initializer
            _componentKey: null,                                    //set by initializer
            _contactInstanceCommands: null,                         //set by initializer

            templateString: template,                               //html template used to create widget
            _mainCssString: mainCss,                                //css for html that is added to body
            baseClass: "twitterContactsInterfaceContactsMenu",      //base class namespace and css class

            _menuDocked: false,
            _statusDiv: null,
            _requestsRemainingDiv: null,
            _requestsInQueueDiv: null,
            _queueProcessingDiv: null,
            _getInputButton: null,
            _noInputDiv: null,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {
                declare.safeMixin(this, args);
                //Place the css file as a tag into the body
                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                //once the DOM is ready ask to connect Interface to stateSynced Instance based on Component Key
                this._noInputDiv = domConstruct.toDom("<div class='twitterContactsInterfaceContactsMenuDisabledButton'>Not Ready For Input</div>");
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
                this.inherited(arguments);

                //if status is ready and widget domNode has been created, show Dom Node
                if (name === "Status" && newState === "Ready") {
                    if(this.domNode)
                    {
                        this.introAnimation();
                    }
                }else if (name === "menuDocked") {
                    if(this.domNode)
                    {
                        this.updateDockedState(newState);
                    }
                }else if(name==="twitterStatus"){
                    if(newState === "ERROR" || newState === "Starting" )
                    {
                        if(dom.isDescendant(this._getInputButton, this.domNode)) {
                            domConstruct.place(this._noInputDiv, this._getInputButton, "replace");
                        }
                    }else if(newState === "Ready"){
                        if(dom.isDescendant(this._noInputDiv, this.domNode)){
                            domConstruct.place(this._getInputButton, this._noInputDiv,  "replace");
                        }
                    }
                    this._statusDiv.innerHTML = newState;
                }else if(name==="twitterRequestsRemaining"){
                    this._requestsRemainingDiv.innerHTML = newState;
                }else if(name==="twitterRequestsInQueue"){
                    this._requestsInQueueDiv.innerHTML = newState;
                }else if(name==="twitterProcessingQueue"){
                    this._queueProcessingDiv.innerHTML = newState ? "Running" : "Idle";
                }
            },

            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            _onDockMenuButtonClicked: function(event)
            {
                if(this._menuDocked) {
                    this._instanceCommands.undockMenuInterface();
                }else{
                    this._instanceCommands.dockMenuInterface();
                }
            },
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
            updateDockedState: function(dockedState){
                if(dockedState === "true" && this._menuDocked === false)
                {
                    this.dockMenu();
                }else if (dockedState === "false"  && this._menuDocked === true) {
                    this.undockMenu();
                }
            },
            undockMenu: function(){
                this._menuDocked = false;

                fx.animateProperty({
                    node:this.domNode,
                    duration:300,
                    properties: {
                        top:            {end: 50, start: 0, units:"%"},
                        left:           {end: 50, start: 0, units:"%"},
                        width:          {end: 200, start: window.getBox().w, units:"px"},
                        borderRadius:   {end: 50, start: 0, units:"%"},
                        padding:        {end: 100, start: 5, units:"px"},
                        transform:      { end: 'translate(-50%, -50%)',
                                        start:'translate(-50%, -50%)'},
                        marginRight:    { end: -50, start:50 , units:"%"}
                    }
                }).play();

                this._dockMenuButton.innerHTML="⬆︎Dock⬆︎";

            },
            dockMenu: function(){
                this._menuDocked = true;

                fx.animateProperty({
                    node:this.domNode,
                    duration:300,
                    properties: {
                        top:            {end: 0},
                        left:           {end: 0},
                        width:          {end: 100, start: 5, units:"%"},
                        borderRadius:   {end: 0, start: 50, units:"%"},
                        padding:        {end: 5, start: 100, units:"px"},

                        transform:      { end: 'translate(0%, 0%)' ,
                                        start: 'translate(0%, 0%)' },
                        marginRight:    { end: 50, start:-50, units:"%"}
                    }
                }).play();

                this._dockMenuButton.innerHTML="⬇︎Undock⬇︎";

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