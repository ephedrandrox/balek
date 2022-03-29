define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        //Dojo browser includes
        'dojo/dom',
        'dojo/dom-construct',
        "dojo/dom-geometry",
        "dojo/dom-style",
        "dojo/dom-class",
        "dojo/_base/window",
        "dojo/ready",
        "dojo/fx",
        "dojo/keys",
        //Dijit Template Includes
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        'dojo/text!balek-modules/diaplode/conversations/resources/html/main.html',
        'dojo/text!balek-modules/diaplode/conversations/resources/css/main.css',
        //Diaplode ui components
        "balek-modules/diaplode/ui/input/getUserInput",
        "balek-modules/diaplode/ui/input/chooseUsers",

        //Balek Interface Includes
        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',

    ],
    function (declare, lang, topic,
              //Dojo browser includes
              dom, domConstruct, domGeometry, domStyle, domClass, win, dojoReady, fx, dojoKeys,
              //Dijit Template Includes
              _WidgetBase, _TemplatedMixin,
              template, mainCss,
              //Diaplode ui components
              getUserInput,
              chooseUsers,
              //Balek Interface Includes
              _syncedCommanderInterface,
              _balekWorkspaceContainerContainable
    ) {
        return declare("moduleDiaplodeConversationsMainInterface", [_WidgetBase, _TemplatedMixin, _syncedCommanderInterface, _balekWorkspaceContainerContainable
        ], {
            _instanceKey: null,

            templateString: template,
            _mainCssString: mainCss,
            baseClass: "diaplodeConversationsMainInterface",

           _mainNode: null,
            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################
            constructor: function (args) {
                declare.safeMixin(this, args);
                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                this.setContainerName("💌 - Conversations -");
                dojoReady(lang.hitch(this, function () {
                    if (this._componentKey) {
                        this.askToConnectInterface();
                    }
                }));
            },
            postCreate: function () {
                this.initializeContainable();
            },
            updateContainerName: function(newName)
            {
              this.setContainerName(newName);
            },
            startupContainable: function(){
               //should be called when containable is started?
            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onInterfaceStateChange: function (name, oldState, newState) {
                this.inherited(arguments);     //this has to be done so remoteCommander works
                if (name === "Status" && newState === "Ready") {
                    console.log("Instance Status:", newState);
                }else if(name === "content"){
                    console.log("#CD", newState)
                    //this is when we get new content, lets make a syncedMap
                }else if(name === "removeContent"){
                    console.log("#CD", newState)
                    //This could be used to signal content removed that was given to Interface State
                }
            },
            _onAddContent: function (clickEvent) {
                this._instanceCommands.addContent("New Content").then(function(commandReturnResults){
                    console.log("#CD", commandReturnResults)
                }).catch(function(commandErrorResults){
                    console.log("#CD", "Create Content Received Error Response" + commandErrorResults);
                });
            },
            _onRemoveContent: function(clickEvent){
                this._instanceCommands.removeContent("Remove New Content").then(function(commandReturnResults){
                    console.log("#CD", commandReturnResults)
                }).catch(function(commandErrorResults){
                    console.log("#CD", "Remove Content Received Error Response" + commandErrorResults);
                });
            },
            _onNewConversation: function(clickEvent){
                let getNameForConversation = new getUserInput({question: "Choose Conversation Name",
                    inputReplyCallback: lang.hitch(this, function(newConversationNameChoice){
                        let getUserForConversation = new chooseUsers({question: "Choose User",
                            inputReplyCallback: lang.hitch(this, function(newConversationUserChoice){
                                this._conversationsInstanceCommands.createConversation({ name: newConversationNameChoice, users: [newConversationUserChoice]}).then(function(commandReturnResults){
                                    console.log("#CD", commandReturnResults)
                                }).catch(function(commandErrorResults){
                                    console.log("#CD", "Create Conversation Received Error Response" + commandErrorResults);
                                });
                                getUserForConversation.unload();
                                getNameForConversation.unload()

                            }) });

                    }) });
            },
            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        break;
                    case dojoKeys.ESCAPE:
                        this._instanceCommands.addContent(this._viewNodeCodeMirror.getValue());
                        break;
                    case dojoKeys.SHIFT:
                        break;
                }
            },
            _onKeyDown: function (keyDownEvent) {
                switch (keyDownEvent.keyCode) {
                    case dojoKeys.SHIFT:
                        break;
                }
            },
            _onFocus: function (event) {

            },
            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################
            //no UI Functions yet
            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################
            unload: function () {
                this.inherited(arguments);
                this.destroy();
            }
        });
    });