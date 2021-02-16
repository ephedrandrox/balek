define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/dom-construct",
        "dojo/_base/window",
        'balek-modules/diaplode/elements/files/Interface/file',
        'balek-modules/components/syncedCommander/Interface',

        'balek-client/session/workspace/workspaceManagerInterfaceCommands',
        'balek-modules/diaplode/navigator/interfaceCommands',
        'balek-modules/components/syncedMap/Interface'



    ],
    function (declare, lang,  topic, domConstruct, win, fileInterface, syncedCommanderInterface, balekWorkspaceManagerInterfaceCommands, navigatorInterfaceCommands, syncedMapInterface) {

        return declare("moduleDiaplodeElementsFilesInterface", syncedCommanderInterface, {
            _instanceKey: null,
            _createFileSubscribeHandle: null,
            _fileInterfaces: [],

            _availableFiles: null,

            workspaceManagerCommands: null,
            navigatorCommands: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();


                this.navigatorCommands = new navigatorInterfaceCommands();



                this._interfaces = [];
             //   console.log("moduleDiaplodeElementsFilesInterface started", this._instanceKey);

               this._createFileSubscribeHandle=  topic.subscribe("createNewDiaplodeFile", lang.hitch(this, function(fileContent){
                //    console.log("createNewDiaplodeFile topic Command Called");
                    this._instanceCommands.createFile(fileContent).then(function(commandReturnResults){
                        //debugger;
                 //       console.log("Create File Received Command Response", commandReturnResults);
                    }).catch(function(commandErrorResults){
                        console.log("Create File Received Error Response", commandErrorResults);
                    });
                }));

            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to inherited() so remoteCommander works
                this.inherited(arguments);
               // console.log(name,newState);

                if(name.toString().substr(0,12) === "fileInstance" &&
                    newState.instanceKey && newState.componentKey && newState.sessionKey){
                   // console.log("starttttttt");

                    let newFileInterface = new fileInterface({
                        _instanceKey:newState.instanceKey,
                        _componentKey:newState.componentKey,
                        _sessionKey:newState.sessionKey});

                    newFileInterface.getContainerKeys().then(lang.hitch(this, function(containerKeys){
                      //  console.log(containerKeys, typeof containerKeys );
                        if(Array.isArray(containerKeys) && containerKeys.length === 0)
                        {
                            topic.publish("addToCurrentWorkspace",newFileInterface );
                        }else
                        {
                      //      console.log(containerKeys.length);
                        }
                    })).catch(lang.hitch(this, function(error){
                        console.log(error);
                    }));
                    this._fileInterfaces.push(newFileInterface);
                }else if(name.toString() === "availableFilesComponentKey")
                {
                    if(this._availableFiles === null){
                        this._availableFiles = new syncedMapInterface({_instanceKey: this._instanceKey, _componentKey: newState.toString()});


                        this.navigatorCommands.getCommands().then(lang.hitch(this, function(navigatorCommands){
                            /*   navigatorCommands.addSyncedMap(this._availableFiles, {
                                   onLoadItem: lang.hitch(this, this._instanceCommands.loadTask)

                               });
   */

                            navigatorCommands.addSystemMenuList( this._availableFiles,  {
                                name: "Files",
                                load: this._instanceCommands.loadFile
                            });
                            //todo send commands to load, along with objects info

                        })).catch(function(errorResult){
                            console.log(errorResult);
                        });
                      //  console.log(this._availableFiles);
                    }
                }
            },
            unload: function () {
                this._createFileSubscribeHandle.remove();

                this._availableFiles.unload();

                for(fileInterfaceIndex in this._fileInterfaces)
                {
                    this._fileInterfaces[fileInterfaceIndex].unload();
                }
            }

        });
    }
);



