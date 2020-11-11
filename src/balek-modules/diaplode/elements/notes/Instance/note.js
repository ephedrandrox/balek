define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/components/syncedCommander/Instance'

    ],
    function (declare, lang, syncedCommanderInstance) {
        return declare("moduleDiaplodeElementsNotesNoteInstance", [syncedCommanderInstance], {

            _notesDatabase: null,
            _notesKey: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleDiaplodeElementsNotesNoteInstance");

                this._commands={
                    "addContent" : lang.hitch(this, this.addContent),
                    "removeContent" : lang.hitch(this, this.removeContent)
                };


                this._interfaceState.set("noteContent","Loading...");


                if(this._notesDatabase && this._noteKey)
                {
                    this._notesDatabase.getUserNote(this._noteKey).then(
                        lang.hitch(this, function(userNoteResult){
                            console.log("user Note Retrieval",userNoteResult);
                            this._interfaceState.set("noteContent",userNoteResult.noteContent);


                        })
                    ).catch(lang.hitch(this, function(userNoteError){
                        console.log("user Note Retrieval error",userNoteError);
                    }));
                }
                this.prepareSyncedState();
                this.setInterfaceCommands();
            },
            addContent: function(content, remoteCommandCallback)
            {
                this._notesDatabase.updateUserNote(this._noteKey, content).then(
                    lang.hitch(this, function(userNoteResult){
                        console.log("user Note Set",userNoteResult);
                        this._interfaceState.set("noteContent", content);
                    })
                ).catch(lang.hitch(this, function(userNoteError){
                    console.log("user Note Set error",userNoteError);
                }));
                remoteCommandCallback({success: "Content Added"});
            },
            removeContent: function(contentPosition, remoteCommandCallback){
                this._interfaceState.set("removeContent", contentPosition);
                remoteCommandCallback({success: "Content Removed"});
            }
        });
    });