define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'balek-server/session/sessionsController/instanceCommands',

        'balek-modules/diaplode/elements/notes/Instance/note',
        'balek-modules/diaplode/elements/notes/Database/notes',

        'balek-modules/components/syncedCommander/Instance',
        'balek-modules/components/syncedMap/Instance',
        "dojo/node!sanitize-html"

    ],
    function (declare,
              lang,
              topic,

              SessionsControllerInstanceCommands,
              noteInstance,
              notesDatabase,

              syncedCommanderInstance,
              syncedMapInstance,
              nodeSanitizeHtml) {
        return declare("moduleDiaplodeElementsNotesInstance", syncedCommanderInstance, {
            _instanceKey: null,
            _sessionKey: null,

            _notesDatabase: null,
            _noteInstances: {},

            sessionsControllerCommands: null,

            _availableNotes: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                let sessionsControllerInstanceCommands = new SessionsControllerInstanceCommands();
                this.sessionsControllerCommands = sessionsControllerInstanceCommands.getCommands();

                this._noteInstances = {};

                this._commands={
                    "createNote" : lang.hitch(this, this.createNote),
                    "loadNote" : lang.hitch(this, this.loadNote)
                };

                this._interfaceState.set("moduleName","moduleDiaplodeElementsNotesInstance");

                console.log("moduleDiaplodeElementsNotesInstance starting...");

                    this._userKey = this.sessionsControllerCommands.getSessionUserKey(this._sessionKey);
                    this._notesDatabase = new notesDatabase({_instanceKey: this._instanceKey, _userKey: this._userKey});
                    this._notesDatabase.getUserNotes().then(lang.hitch(this, function (userNotesArray) {


                            if (userNotesArray.length > 0) {
                               for( userNotesArrayKey in userNotesArray ) {
                                  // this.createNoteInstance(userNotesArray[userNotesArrayKey]._id);
                                   if( !userNotesArray[userNotesArrayKey].name ){
                                       let noteContent = userNotesArray[userNotesArrayKey].noteContent;
                                       let noteName = this.getNameFromNoteContent(noteContent);


                                       userNotesArray[userNotesArrayKey].name = noteName;

                                   }
                                   this._availableNotes.add(userNotesArray[userNotesArrayKey]._id, userNotesArray[userNotesArrayKey]);

                               }

                            } else {
                                //no notes for user returned
                            }

                    })).catch(function (error) {
                        console.log(error);
                    });


                this._availableNotes  = new syncedMapInstance({_instanceKey: this._instanceKey});


                this._interfaceState.set("availableNotesComponentKey", this._availableNotes._componentKey);

                //console.log(this._availableNotes);



                this.prepareSyncedState();
                this.setInterfaceCommands();
            },
            getNameFromNoteContent: function(noteContent)
            {
                let noteName = "Unable To Get Name!";
                let noteString = "";

                if(typeof noteContent === "string"){
                    noteString =  noteContent.toString();
                }else if(typeof noteContent === "object"){
                    if(Array.isArray( noteContent.ops))
                    {

                        noteString = noteContent.ops.find(function(element){
                            if(element.insert && typeof element.insert === "string"){
                                return true;
                            }else {
                                return false;
                            }

                        }).insert.toString();
                    }else {
                        noteString = JSON.stringify(noteContent);
                    }

                }

                noteName =  nodeSanitizeHtml(noteString.toString().trim().substr(0,32));
                return noteName;
            },

            createNoteInstance: function(noteID){
                if(this._noteInstances[noteID] === undefined)
                {
                    let newNote = new noteInstance({_instanceKey: this._instanceKey,
                        _sessionKey: this._sessionKey,
                        _userKey: this._userKey,
                        _noteKey: noteID,
                        _notesInstance: this});

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

                    this._availableNotes.add(newNoteID, {_id: newNoteID, _userKey: this._userKey, noteContent: noteContent, name: this.getNameFromNoteContent(noteContent) });
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
            updateNote: function(noteKey, noteContent){

                return new Promise(lang.hitch(this, function(Resolve, Reject){
                    this._notesDatabase.updateUserNote(noteKey, noteContent).then(
                        lang.hitch(this, function(userNoteResult){
                            //  console.log("user Note Set",userNoteResult);
                            this._availableNotes.add(noteKey, {_id: noteKey, _userKey: this._userKey, noteContent: noteContent, name: this.getNameFromNoteContent(noteContent) });

                            Resolve(userNoteResult);
                        })
                    ).catch(lang.hitch(this, function(userNoteError){
                        console.log("user Note Set error",userNoteError);
                    }));
                }));

            },
            getNote: function(noteKey){
                return new Promise(lang.hitch(this, function(Resolve, Reject) {
                    this._notesDatabase.getUserNote(noteKey).then(
                        lang.hitch(this, function (noteResult) {
                            console.log("system menu", noteResult);
                            Resolve(noteResult);
                        })
                    ).catch(lang.hitch(this, function (noteError) {
                        Reject(noteError);
                        console.log("user Note Retrieval error", noteError);
                    }));
                }));
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


