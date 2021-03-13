define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/dom-construct",
        "dojo/_base/window",
        'balek-modules/diaplode/elements/notes/Interface/note',
        'balek-modules/components/syncedCommander/Interface',

        'balek-client/session/workspace/workspaceManagerInterfaceCommands',
        'balek-modules/diaplode/navigator/interfaceCommands',
        'balek-modules/components/syncedMap/Interface'



    ],
    function (declare, lang,  topic, domConstruct, win, noteInterface, syncedCommanderInterface, balekWorkspaceManagerInterfaceCommands, navigatorInterfaceCommands, syncedMapInterface) {

        return declare("moduleDiaplodeElementsNotesInterface", syncedCommanderInterface, {
            _instanceKey: null,
            _createNoteSubscribeHandle: null,
            _noteInterfaces: {},

            _availableNotes: null,

            workspaceManagerCommands: null,
            navigatorCommands: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();


                this.navigatorCommands = new navigatorInterfaceCommands();



                this._interfaces = [];
             //   console.log("moduleDiaplodeElementsNotesInterface started", this._instanceKey);

               this._createNoteSubscribeHandle=  topic.subscribe("createNewDiaplodeNote", lang.hitch(this, function(noteContent){
                //    console.log("createNewDiaplodeNote topic Command Called");
                    this._instanceCommands.createNote(noteContent).then(function(commandReturnResults){
                        //debugger;
                 //       console.log("Create Note Received Command Response", commandReturnResults);
                    }).catch(function(commandErrorResults){
                        console.log("Create Note Received Error Response", commandErrorResults);
                    });
                }));

            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to inherited() so remoteCommander works
                this.inherited(arguments);
               // console.log(name,newState);

                if(name.toString().substr(0,12) === "noteInstance" &&
                    newState.instanceKey && newState.componentKey && newState.sessionKey){
                   // console.log("starttttttt");

                    let elementKey = name.toString().substr(12);
                    console.log("Elemtne Key from string:", elementKey)
                    let newNoteInterface = new noteInterface({
                        _instanceKey:newState.instanceKey,
                        _componentKey:newState.componentKey,
                        _sessionKey:newState.sessionKey});

                    newNoteInterface.getContainerKeys().then(lang.hitch(this, function(containerKeys){
                      //  console.log(containerKeys, typeof containerKeys );
                        if(Array.isArray(containerKeys) && containerKeys.length === 0)
                        {
                            topic.publish("addToCurrentWorkspace",newNoteInterface );
                        }else
                        {
                      //      console.log(containerKeys.length);
                        }
                    })).catch(lang.hitch(this, function(error){
                        console.log(error);
                    }));
                    this._noteInterfaces[elementKey] = newNoteInterface;
                }else if(name.toString() === "availableNotesComponentKey")
                {
                    if(this._availableNotes === null){
                        this._availableNotes = new syncedMapInterface({_instanceKey: this._instanceKey, _componentKey: newState.toString()});


                        this.navigatorCommands.getCommands().then(lang.hitch(this, function(navigatorCommands){
                            /*   navigatorCommands.addSyncedMap(this._availableNotes, {
                                   onLoadItem: lang.hitch(this, this._instanceCommands.loadTask)

                               });
   */

                            navigatorCommands.addSystemMenuList( this._availableNotes,  {
                                name: "Notes",
                                load: lang.hitch(this,this.loadNote)
                            });
                            //todo send commands to load, along with objects info

                        })).catch(function(errorResult){
                            console.log(errorResult);
                        });
                      //  console.log(this._availableNotes);
                    }
                }
            },
            loadNote: function(elementId){
                return new Promise(lang.hitch(this, function(Resolve, Reject){

                   let elementInterface = this.getElementInterface(elementId);





                if(elementInterface){
                    console.log("already Loaded ", elementId, elementInterface);

                    let workspace = this.workspaceManagerCommands.getActiveWorkspace();

                    let containerKey = elementInterface._assignedContainer._containerKey;

                    console.log("already Loaded ", workspace,containerKey);

                    this.workspaceManagerCommands.activateContainerInWorkspace(workspace, containerKey);

                }else
                {
                    //check loaded
                    console.log("Loading Element ", elementId, elementInterface);
                    this._instanceCommands.loadNote(elementId).then(function(Result){

                        if(Result.error){
                            console.log("reject", elementId);

                            Reject({error: Result});
                        }else {
                            console.log("Accept", elementId, Result);

                            Resolve({success: Result});

                        }

                    }).catch(function(errorResult){
                        console.log("reject", elementId);

                        Reject({error: errorResult});

                    });

                }


                }));
                //load: this._instanceCommands.loadNote

            },
            getElementInterface: function(elementId){
                return this._noteInterfaces[elementId];
            },
            unload: function () {
                this._createNoteSubscribeHandle.remove();

                this._availableNotes.unload();

                for(noteInterfaceIndex in this._noteInterfaces)
                {
                    this._noteInterfaces[noteInterfaceIndex].unload();
                }
            }

        });
    }
);



