define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/diaplode/elements/notes/Instance/note',
        'balek-modules/diaplode/elements/notes/Database/notes',

        'balek-modules/components/syncedCommander/Instance'
    ],
    function (declare,
              lang,
              topic,

              noteInstance,
              notesDatabase,

              syncedCommanderInstance) {
        return declare("moduleDiaplodeElementsNotesInstance", syncedCommanderInstance, {
            _instanceKey: null,
            _sessionKey: null,

            _notesDatabase: null,
            _noteInstances: [],

            constructor: function (args) {
                declare.safeMixin(this, args);
                this._noteInstances = [];

                this._commands={
                    "createNote" : lang.hitch(this, this.createNote)
                };

                this._interfaceState.set("moduleName","moduleDiaplodeElementsNotesInstance");

                console.log("moduleDiaplodeElementsNotesInstance starting...");

                topic.publish("getSessionUserKey", this._sessionKey, lang.hitch(this, function(userKey) {
                    this._userKey = userKey;
                    this._notesDatabase = new notesDatabase({_instanceKey: this._instanceKey, _userKey: this._userKey});
                    this._notesDatabase.getUserNotes().then(lang.hitch(this, function (userNotes) {
                        userNotes.toArray().then(lang.hitch(this, function (userNotesArray) {

                            if (userNotesArray.length > 0) {
                               for( userNotesArrayKey in userNotesArray ) {
                                   this.createNoteInstance(userNotesArray[userNotesArrayKey]._id);
                               }

                            } else {
                                //no notes for user returned
                            }
                        }));
                    })).catch(function (error) {
                        console.log(error);
                    });
                }));
                this.prepareSyncedState();
                this.setInterfaceCommands();
            },
            createNoteInstance: function(noteID){
                let newNote = new noteInstance({_instanceKey: this._instanceKey,
                    _sessionKey: this._sessionKey,
                    _userKey: this._userKey,
                    _noteKey: noteID,
                    _notesDatabase: this._notesDatabase});

                this._noteInstances.push(newNote);

                this._interfaceState.set("noteInstance"+noteID , {instanceKey: newNote._instanceKey,
                    sessionKey: newNote._sessionKey,
                    userKey: newNote._userKey,
                    componentKey: newNote._componentKey});
            },
            //##########################################################################################################
            //Remote Commands Functions Section
            //##########################################################################################################
            createNote: function(noteContent, remoteCommanderCallback){

                this._notesDatabase.newUserNote(noteContent).then(lang.hitch(this, function(newNoteID){
                    this.createNoteInstance(newNoteID);
                    if(remoteCommanderCallback)
                    {
                        remoteCommanderCallback({success: "Note Created",
                        newNoteID: newNoteID});
                    }

                })).catch(function(newNoteErrorResults){
                    if(remoteCommanderCallback) {
                        remoteCommanderCallback({
                            Error: "Note Not Created",
                            Result: newNoteErrorResults
                        });
                    }
                });


            }
        });
    }
);


