define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/components/syncedCommander/Instance'

    ],
    function (declare, lang, syncedCommanderInstance) {
        return declare("moduleDiaplodeElementsNotesNoteInstance", [syncedCommanderInstance], {

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleDiaplodeElementsNotesNoteInstance");

                this._commands={
                    "addContent" : lang.hitch(this, this.addContent),
                    "removeContent" : lang.hitch(this, this.removeContent)
                };

                this._interfaceState.set("name",this._menuItemName);

                this.prepareSyncedState();
                this.setInterfaceCommands();
            },
            addContent: function(content, remoteCommandCallback)
            {
                this._interfaceState.set("name", name);
                remoteCommandCallback({success: "Content Added"});
            },
            removeContent: function(contentPosition, remoteCommandCallback){
                this._interfaceState.set("removeContent", contentPosition);
                remoteCommandCallback({success: "Content Removed"});
            }
        });
    });