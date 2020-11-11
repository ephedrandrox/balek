define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-modules/diaplode/elements/notes/Instance/note',
        'balek-modules/components/syncedCommander/Instance'
    ],
    function (declare, lang, topic, noteInstance, syncedCommanderInstance) {
        return declare("moduleDiaplodeElementsNotesInstance", syncedCommanderInstance, {
            _instanceKey: null,
            _sessionKey: null,

            _noteInstances: [],

            constructor: function (args) {
                declare.safeMixin(this, args);
                this._noteInstances = [];

                this._commands={
                    "createNote" : lang.hitch(this, this.createNote)
                };

                this._interfaceState.set("moduleName","moduleDiaplodeElementsNotesInstance");

                console.log("moduleDiaplodeElementsNotesInstance starting...");

                this.prepareSyncedState();
                this.setInterfaceCommands();
            },
            //##########################################################################################################
            //Remote Commands Functions Section
            //##########################################################################################################
            createNote: function(remoteCommanderCallback){
                let newNote = new noteInstance({_instanceKey: this._instanceKey, _sessionKey: this._sessionKey, _userKey: this._userKey})
                //todo replace component key with note Key after database created
                this._interfaceState.set("noteInstance"+newNote._componentKey , {instanceKey: newNote._instanceKey,
                    sessionKey: newNote._sessionKey,
                    userKey: newNote._userKey,
                    componentKey: newNote._componentKey});
                if(remoteCommanderCallback)
                {
                    remoteCommanderCallback({success: "Note Created"});
                }
            }
        });
    }
);


