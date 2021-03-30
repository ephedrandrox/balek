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


                if(this._notesInstance && this._noteKey)
                {
                    this._notesInstance.getNote(this._noteKey).then(
                        lang.hitch(this, function(noteResult){
                            this._interfaceState.set("noteContent",noteResult.noteContent);
                        })
                    ).catch(lang.hitch(this, function(noteError){
                        console.log("user Note Retrieval error",noteError);
                    }));
                }
                this.prepareSyncedState();
                this.setInterfaceCommands();
            },
            addContent: function(content, remoteCommandCallback)
            {
               this._notesInstance.updateNote(this._noteKey, content).then(lang.hitch(this, function(userNoteResult){

                   this._interfaceState.set("noteContent", content);
                   remoteCommandCallback({success: "Content Added"});
               })).catch(lang.hitch(this, function(errorResult){
                    console.log("error updateing note", errorResult);
               }));

            },
            removeContent: function(contentPosition, remoteCommandCallback){
                this._interfaceState.set("removeContent", contentPosition);
                remoteCommandCallback({success: "Content Removed"});
            }
        });
    });