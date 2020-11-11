define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/dom-construct",
        "dojo/_base/window",
        'balek-modules/diaplode/elements/notes/Interface/note',
        'balek-modules/components/syncedCommander/Interface',


    ],
    function (declare, lang,  topic, domConstruct, win, noteInterface, syncedCommanderInterface) {

        return declare("moduleDiaplodeElementsNotesInterface", syncedCommanderInterface, {
            _instanceKey: null,
            _createNoteSubscribeHandle: null,
            _noteInterfaces: [],

            constructor: function (args) {
                declare.safeMixin(this, args);
                this._interfaces = [];
                console.log("moduleDiaplodeElementsNotesInterface started", this._instanceKey);

               this._createNoteSubscribeHandle=  topic.subscribe("createNewDiaplodeNote", lang.hitch(this, function(noteContent){
                    console.log("createNewDiaplodeNote topic Command Called");
                    this._instanceCommands.createNote(noteContent).then(function(commandReturnResults){
                        debugger;
                        console.log("Create Note Received Command Response", commandReturnResults);
                    }).catch(function(commandErrorResults){
                        console.log("Create Note Received Error Response", commandErrorResults);
                    });
                }));

            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to inherited() so remoteCommander works
                this.inherited(arguments);
                console.log(name,newState);

                if(name.toString().substr(0,12) === "noteInstance" &&
                    newState.instanceKey && newState.componentKey && newState.sessionKey){
                    console.log("starttttttt");

                    this._noteInterfaces.push(new noteInterface({
                                    _instanceKey:newState.instanceKey,
                                    _componentKey:newState.componentKey,
                                    _sessionKey:newState.sessionKey}))
                }

            },
            unload: function () {
                this._createNoteSubscribeHandle.remove();

                for(noteInterfaceIndex in this._noteInterfaces)
                {
                    this._noteInterfaces[noteInterfaceIndex].unload();
                }
            }
        });
    }
);



