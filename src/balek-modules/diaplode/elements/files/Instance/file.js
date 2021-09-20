define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/components/syncedCommander/Instance'

    ],
    function (declare, lang, syncedCommanderInstance) {
        return declare("moduleDiaplodeElementsFilesFileInstance", [syncedCommanderInstance], {

            _filesDatabase: null,
            _filesKey: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleDiaplodeElementsFilesFileInstance");

                this._commands={
                    "addContent" : lang.hitch(this, this.addContent),
                    "removeContent" : lang.hitch(this, this.removeContent)
                };



                this._interfaceState.set("fileContent","Loading...");


                if(this._filesDatabase && this._fileKey)
                {
                    this._filesDatabase.getUserFile(this._fileKey).then(
                        lang.hitch(this, function(userFileResult){
                     //       console.log("user File Retrieval",userFileResult);
                            this._interfaceState.set("fileContent",userFileResult.fileContent);


                        })
                    ).catch(lang.hitch(this, function(userFileError){
                        console.log("user File Retrieval error",userFileError);
                    }));
                }
                this.prepareSyncedState();
                this.setInterfaceCommands();
            },
            addContent: function(content, remoteCommandCallback)
            {
                this._filesDatabase.updateUserFile(this._fileKey, content).then(
                    lang.hitch(this, function(userFileResult){
                      //  console.log("user File Set",userFileResult);
                        this._interfaceState.set("fileContent", content);
                    })
                ).catch(lang.hitch(this, function(userFileError){
                    console.log("user File Set error",userFileError);
                }));
                remoteCommandCallback({success: "Content Added"});
            },
            removeContent: function(contentPosition, remoteCommandCallback){
                this._interfaceState.set("removeContent", contentPosition);
                remoteCommandCallback({success: "Content Removed"});
            }
        });
    });