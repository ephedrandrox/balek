define(['dojo/_base/declare',
        'dojo/_base/lang',
        "dojo/dom-construct",
        "dojo/_base/window",

        "balek-modules/diaplode/elements/interfaceCommands",

        'balek-modules/components/syncedCommander/Interface',
        'balek-modules/components/syncedMap/Interface'
    ],
    function (declare,
              lang,
              domConstruct,
              win,
              interfaceCommands,
              syncedCommanderInterface,
              syncedMapInterface) {

        return declare("moduleDiaplodeElementsFilesInterface", syncedCommanderInterface, {
            _instanceKey: null,

            _elementInterfaces: [],

            _availableElements: null,

            _getAvailableElementsResolves: null,


            constructor: function (args) {
                declare.safeMixin(this, args);


                this._elementInterfaces = [];
                this._getAvailableElementsResolves = [];
                this._commandsForOtherInterfaces = new interfaceCommands();


                console.log("GGGG", "Initializing Diaplode Element Interface...");


            },
            onRemoteCommandsInitiated: function () {
                console.log("GGGG", "Remote Commands Initiated - Setting up Local commands...");

                this._commandsForOtherInterfaces.setCommand("getAvailableElements", lang.hitch(this, this.getAvailableElements));
                this._commandsForOtherInterfaces.setCommand("loadElement", lang.hitch(this, this.loadElement));
                this._commandsForOtherInterfaces.setCommand("createElement", lang.hitch(this, this.createElement));

                this._commandsForOtherInterfaces.setReady();

            },
            getAvailableElements: function () {
                return new Promise(lang.hitch(this, function (Resolve, Reject) {
                    if (this._availableElements === null) {
                        this._getAvailableElementsResolves.push({Resolve: Resolve, Reject: Reject});
                    } else {
                        Resolve(this._availableElements);
                    }
                }));
            },
            loadElement: function () {
                if (this._instanceCommands && this._instanceCommands.loadElement) {
                    this._instanceCommands.loadElement(arguments);
                }
            },
            createElement: function () {
                if (this._instanceCommands && this._instanceCommands.createElement) {
                    this._instanceCommands.createElement(arguments).then(function (commandReturnResults) {
                        console.log("Create Element Success", commandReturnResults);

                    }).catch(function (commandErrorResults) {
                        console.log("Create Element Received Error Response", commandErrorResults);
                    });
                }
            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to inherited() so remoteCommander works
                this.inherited(arguments);
                // console.log(name,newState);

                if (name.toString() === "availableElementsComponentKey") {
                    if (this._availableElements === null) {
                        this._availableElements = new syncedMapInterface({
                            _instanceKey: this._instanceKey,
                            _componentKey: newState.toString()
                        });
                        this._getAvailableElementsResolves.forEach(lang.hitch(this, function (commandRequest) {
                            commandRequest.Resolve(this._availableElements);
                        }));
                    }
                }
            },
            unload: function () {
                this._availableElements.unload();
                for (const elementInterfaceIndex in this._elementInterfaces) {
                    this._elementInterfaces[elementInterfaceIndex].unload();
                }
            }
        });
    }
);



