define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/diaplode/elements/notes/Instance/note',
        'balek-modules/diaplode/elements/notes/Database/notes',

        'balek-modules/components/syncedCommander/Instance',
        'balek-modules/components/syncedMap/Instance'

    ],
    function (declare,
              lang,
              topic,

              noteInstance,
              notesDatabase,

              syncedCommanderInstance,
              syncedMapInstance) {
        return declare("moduleDiaplodeElementsNotesInstance", syncedCommanderInstance, {
            _instanceKey: null,
            _sessionKey: null,

            _notesDatabase: null,
            _noteInstances: {},

            _availableNotes: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._noteInstances = {};

                this._commands={
                    "createNote" : lang.hitch(this, this.createNote),
                    "loadNote" : lang.hitch(this, this.loadNote)
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
                                  // this.createNoteInstance(userNotesArray[userNotesArrayKey]._id);
                                   if( !userNotesArray[userNotesArrayKey].name ){
                                       let noteContent = userNotesArray[userNotesArrayKey].noteContent;
                                       let noteName = noteContent.toString().trim().substr(0,32);
                                       userNotesArray[userNotesArrayKey].name = noteName;

                                   }
                                   this._availableNotes.add(userNotesArray[userNotesArrayKey]._id, userNotesArray[userNotesArrayKey]);

                               }

                            } else {
                                //no notes for user returned
                            }
                        }));
                    })).catch(function (error) {
                        console.log(error);
                    });
                }));


                this._availableNotes  = new syncedMapInstance({_instanceKey: this._instanceKey});


                this._interfaceState.set("availableNotesComponentKey", this._availableNotes._componentKey);

                //console.log(this._availableNotes);



                this.prepareSyncedState();
                this.setInterfaceCommands();
            },
            getNameFromNoteContent: function(noteContent)
            {
                //let noteName = noteContent.toString.trim();
                return noteContent;
            },

            createNoteInstance: function(noteID){
                if(this._noteInstances[noteID] === undefined)
                {
                    let newNote = new noteInstance({_instanceKey: this._instanceKey,
                        _sessionKey: this._sessionKey,
                        _userKey: this._userKey,
                        _noteKey: noteID,
                        _notesDatabase: this._notesDatabase});

                    this._noteInstances[noteID] =newNote ;

                    this._interfaceState.set("noteInstance"+noteID , {instanceKey: newNote._instanceKey,
                        sessionKey: newNote._sessionKey,
                        userKey: newNote._userKey,
                        componentKey: newNote._componentKey});

                    return true;
                }else {
                    return false;
                }

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


            },
            loadNote: function(noteKey, remoteCommanderCallback)
            {
                if(this.createNoteInstance(noteKey) === true)
                {
                    remoteCommanderCallback({success: "Created Instance"});
                }else {
                    remoteCommanderCallback({error: "Instance already created"});
                }
            }
        });
    }
);


