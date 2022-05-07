define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/components/syncedCommander/Instance'
    ],
    function (declare, lang, syncedCommanderInstance) {
        return declare("moduleDiaplodeConversationsMainInstance", [syncedCommanderInstance], {
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleDiaplodeConversationsMainInstance");

                this._commands={
                    "addContent" : lang.hitch(this, this.addContent),
                    "removeContent" : lang.hitch(this, this.removeContent)
                };

                this._interfaceState.set("moduleName","moduleDiaplodeConversationsMainInstance");

                this.prepareSyncedState();
                this.setInterfaceCommands();
            },
            addContent: function(content, remoteCommandCallback)
            {
                this._interfaceState.set("content", content);
                remoteCommandCallback({success: "Content Added"});
            },
            removeContent: function(contentToRemove, remoteCommandCallback){
                this._interfaceState.set("removeContent", contentToRemove);
                remoteCommandCallback({success: "Content Removed"});
            }
        });
    });