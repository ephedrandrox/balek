define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/diaplode/elements/files/Instance/file',
        'balek-modules/diaplode/elements/files/Database/files',

        'balek-modules/components/syncedCommander/Instance',
        'balek-modules/components/syncedMap/Instance'

    ],
    function (declare,
              lang,
              topic,

              fileInstance,
              filesDatabase,

              syncedCommanderInstance,
              syncedMapInstance) {
        return declare("moduleDiaplodeElementsFilesInstance", syncedCommanderInstance, {
            _instanceKey: null,
            _sessionKey: null,

            _filesDatabase: null,
            _fileInstances: {},

            _availableFiles: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._fileInstances = {};

                this._commands={
                    "createFile" : lang.hitch(this, this.createFile),
                    "loadFile" : lang.hitch(this, this.loadFile)
                };

                this._interfaceState.set("moduleName","moduleDiaplodeElementsFilesInstance");

                console.log("moduleDiaplodeElementsFilesInstance starting...");

                topic.publish("getSessionUserKey", this._sessionKey, lang.hitch(this, function(userKey) {
                    this._userKey = userKey;
                    this._filesDatabase = new filesDatabase({_instanceKey: this._instanceKey, _userKey: this._userKey});
                    this._filesDatabase.getUserFiles().then(lang.hitch(this, function (userFiles) {
                        userFiles.toArray().then(lang.hitch(this, function (userFilesArray) {

                            if (userFilesArray.length > 0) {
                               for( userFilesArrayKey in userFilesArray ) {
                                  // this.createFileInstance(userFilesArray[userFilesArrayKey]._id);
                                   if( !userFilesArray[userFilesArrayKey].name ){
                                       let fileContent = userFilesArray[userFilesArrayKey].fileContent;
                                       let fileName = fileContent.toString().trim().substr(0,32);
                                       userFilesArray[userFilesArrayKey].name = fileName;

                                   }
                                   this._availableFiles.add(userFilesArray[userFilesArrayKey]._id, userFilesArray[userFilesArrayKey]);

                               }

                            } else {
                                //no files for user returned
                            }
                        }));
                    })).catch(function (error) {
                        console.log(error);
                    });
                }));


                this._availableFiles  = new syncedMapInstance({_instanceKey: this._instanceKey});


                this._interfaceState.set("availableFilesComponentKey", this._availableFiles._componentKey);

                //console.log(this._availableFiles);



                this.prepareSyncedState();
                this.setInterfaceCommands();
            },
            getNameFromFileContent: function(fileContent)
            {
                //let fileName = fileContent.toString.trim();
                return fileContent;
            },

            createFileInstance: function(fileID){
                if(this._fileInstances[fileID] === undefined)
                {
                    let newFile = new fileInstance({_instanceKey: this._instanceKey,
                        _sessionKey: this._sessionKey,
                        _userKey: this._userKey,
                        _fileKey: fileID,
                        _filesDatabase: this._filesDatabase});

                    this._fileInstances[fileID] =newFile ;

                    this._interfaceState.set("fileInstance"+fileID , {instanceKey: newFile._instanceKey,
                        sessionKey: newFile._sessionKey,
                        userKey: newFile._userKey,
                        componentKey: newFile._componentKey});

                    return true;
                }else {
                    return false;
                }

            },
            //##########################################################################################################
            //Remote Commands Functions Section
            //##########################################################################################################
            createFile: function(fileContent, remoteCommanderCallback){

                this._filesDatabase.newUserFile(fileContent).then(lang.hitch(this, function(newFileID){
                    this.createFileInstance(newFileID);
                    if(remoteCommanderCallback)
                    {
                        remoteCommanderCallback({success: "File Created",
                        newFileID: newFileID});
                    }

                })).catch(function(newFileErrorResults){
                    if(remoteCommanderCallback) {
                        remoteCommanderCallback({
                            Error: "File Not Created",
                            Result: newFileErrorResults
                        });
                    }
                });


            },
            loadFile: function(fileKey, remoteCommanderCallback)
            {
                if(this.createFileInstance(fileKey) === true)
                {
                    remoteCommanderCallback({success: "Created Instance"});
                }else {
                    remoteCommanderCallback({error: "Instance already created"});
                }
            }
        });
    }
);

