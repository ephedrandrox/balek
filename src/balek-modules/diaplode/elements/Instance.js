define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/diaplode/elements/Database/elements',

        'balek-modules/components/syncedCommander/Instance',
        'balek-modules/components/syncedMap/Instance'

    ],
    function (declare,
              lang,
              topic,
              elementsDatabase,
              syncedCommanderInstance,
              syncedMapInstance) {
        return declare("moduleDiaplodeElementsInstance", syncedCommanderInstance, {
            _instanceKey: null,
            _sessionKey: null,

            _elementsDatabase: null,
            _elementInstances: {},

            _availableElements: null,


            constructor: function (args) {
                declare.safeMixin(this, args);

                this._elementInstances = {};

                this._commands = {
                    "createElement": lang.hitch(this, this.createElement),
                    "loadElement": lang.hitch(this, this.loadElement)
                };

                this._interfaceState.set("moduleName", "moduleDiaplodeElementsInstance");

                console.log("moduleDiaplodeElementsInstance starting...");

                topic.publish("getSessionUserKey", this._sessionKey, lang.hitch(this, function (userKey) {
                    this._userKey = userKey;
                    this._elementsDatabase = new elementsDatabase({
                        _instanceKey: this._instanceKey,
                        _userKey: this._userKey
                    });
                    this._elementsDatabase.getUserElements().then(lang.hitch(this, function (userElements) {
                        userElements.toArray().then(lang.hitch(this, function (userElementsArray) {
                            if (userElementsArray.length > 0) {
                                for (userElementsArrayKey in userElementsArray) {
                                    if (!userElementsArray[userElementsArrayKey].name) {
                                        let elementContent = userElementsArray[userElementsArrayKey].Content;
                                        let elementName = userElementsArray[userElementsArrayKey].Name;
                                        userElementsArray[userElementsArrayKey].name = elementName;
                                        userElementsArray[userElementsArrayKey].loaded = false;
                                    }
                                    this._availableElements.add(userElementsArray[userElementsArrayKey]._id, userElementsArray[userElementsArrayKey]);

                                }

                            } else {
                                //no Elements for user returned
                            }
                        }));
                    })).catch(function (error) {
                        console.log(error);
                    });
                }));


                this._availableElements = new syncedMapInstance({_instanceKey: this._instanceKey});


                this._interfaceState.set("availableElementsComponentKey", this._availableElements._componentKey);


                this.prepareSyncedState();
                this.setInterfaceCommands();
            },
            createElementInstance: function (elementID) {
                //todo check element type
                //todo get controller instance for that element and create it with elementID
                //todo maybe create an element state and pass to instance
                //create state if doesn't exist

            },
            //##########################################################################################################
            //Remote Commands Functions Section
            //##########################################################################################################
            createElement: function (element, remoteCommanderCallback) {

                this._elementsDatabase.newUserElement(element).then(lang.hitch(this, function (newElementID) {

                    this._availableElements.add(newElementID, {Name: element.Name, Content: element.Content});
                    if (remoteCommanderCallback) {
                        remoteCommanderCallback({
                            success: "Element Created",
                            newElementeID: newElementID
                        });
                    }

                })).catch(function (newElementErrorResults) {
                    if (remoteCommanderCallback) {
                        remoteCommanderCallback({
                            Error: "Element Not Created",
                            Result: newElementErrorResults
                        });
                    }
                });


            },
            loadElement: function (elementKey, remoteCommanderCallback) {
                if (this.createElementInstance(elementKey) === true) {
                    remoteCommanderCallback({success: "Created Instance"});
                } else {
                    remoteCommanderCallback({error: "Instance already created"});
                }
            }
        });
    }
);


