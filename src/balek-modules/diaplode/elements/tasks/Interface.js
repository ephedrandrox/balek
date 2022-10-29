define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/dom-construct",
        "dojo/_base/window",
        'balek-modules/diaplode/elements/tasks/Interface/task',
        'balek-modules/components/syncedCommander/Interface',

        'balek-client/session/workspace/workspaceManagerInterfaceCommands',
        'balek-modules/diaplode/navigator/interfaceCommands',
        'balek-modules/components/syncedMap/Interface'



    ],
    function (declare, lang,  topic, domConstruct, win, taskInterface, syncedCommanderInterface, balekWorkspaceManagerInterfaceCommands, navigatorInterfaceCommands, syncedMapInterface ) {

        return declare("moduleDiaplodeElementsTasksInterface", syncedCommanderInterface, {
            _instanceKey: null,
            _createTaskSubscribeHandle: null,
            _taskInterfaces: [],

            _availableTasks: null,

            workspaceManagerCommands: null,
            navigatorCommands: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();


                this.navigatorCommands = new navigatorInterfaceCommands();





                this._interfaces = [];
        //        console.log("moduleDiaplodeElementsTasksInterface started", this._instanceKey);

               this._createTaskSubscribeHandle=  topic.subscribe("createNewDiaplodeTask", lang.hitch(this, function(taskContent){
           //         console.log("createNewDiaplodeTask topic Command Called");
                    this._instanceCommands.createTask(taskContent).then(function(commandReturnResults){
                        debugger;
           //             console.log("Create Task Received Command Response", commandReturnResults);
                    }).catch(function(commandErrorResults){
                        console.log("Create Task Received Error Response", commandErrorResults);
                    });
                }));

            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to inherited() so remoteCommander works
                this.inherited(arguments);
             //   console.log(name,newState);

                if(name.toString().substr(0,12) === "taskInstance" &&
                    newState.instanceKey && newState.componentKey && newState.sessionKey){
                    console.log("starttttttt");
                    let newTaskInterface  = new taskInterface({
                        _instanceKey:newState.instanceKey,
                        _componentKey:newState.componentKey,
                        _sessionKey:newState.sessionKey});

                    newTaskInterface.getContainerKeys().then(lang.hitch(this, function(containerKeys){
                        //this waits until the containable has component state for container Keys
                        //               console.log(containerKeys, typeof containerKeys );
                        if(Array.isArray(containerKeys) && containerKeys.length === 0)
                        {
                            //the containable has not been added to a container
                            //adding it to the workspace puts it in a
                            console.log(containerKeys);
                            let workspaceContainerWidgetPath = "balek-client/session/workspace/container/widgets/movable/movableContainerWidget"
                            let activeWorkspaceKey = this.workspaceManagerCommands.getActiveWorkspace().getWorkspaceKey();
                            this.workspaceManagerCommands.addToWorkspaceContainer(newTaskInterface, workspaceContainerWidgetPath )
                                .then(lang.hitch(this, function(workspaceContainerKey){
                                   console.log("gotWorkspaceContainerKey", workspaceContainerKey);
                                   this.workspaceManagerCommands.addContainerToWorkspace(workspaceContainerKey, activeWorkspaceKey)
                                       .then(lang.hitch(this, function(addContainerToWorkspaceResponse){
                                           console.log("Container added to workspace", addContainerToWorkspaceResponse);
                                       }))
                                       .catch(lang.hitch(this, function(error){
                                           console.log("Error adding container to workspace", error);
                                       }));
                            })).catch(lang.hitch(this, function(error){
                            }));
                            //topic.publish("addToCurrentWorkspace",newTaskInterface );
                        }else
                        {
                            //component containable is already in a container
                            console.log("already in a container", containerKeys);
                        }
                    })).catch(lang.hitch(this, function(error){
                        console.log(error);
                    }));

                    this._taskInterfaces.push(newTaskInterface);
                }else if(name.toString() === "availableTasksComponentKey")
                {
                    if(this._availableTasks === null){
                        this._availableTasks = new syncedMapInterface({_instanceKey: this._instanceKey, _componentKey: newState.toString()});


                        this.navigatorCommands.getCommands().then(lang.hitch(this, function(navigatorCommands){
                         /*   navigatorCommands.addSyncedMap(this._availableTasks, {
                                onLoadItem: lang.hitch(this, this._instanceCommands.loadTask)

                            });
*/

                            navigatorCommands.addSystemMenuList( this._availableTasks,  {
                                name: "Tasks",
                                emoji: "🎯️",
                                load: this._instanceCommands.loadTask
                            });
                            //todo send commands to load, along with objects info

                        })).catch(function(errorResult){
                            console.log(errorResult);
                        });
                      // console.log(this._availableTasks);
                    }
                }

            },
           // availableTaskStateChange: function(taskKey, oldState, newState){
          //          console.log("Tasks",taskKey, oldState, newState );

          //      this._instanceCommands.loadTask(taskKey).then().catch();


          //  },
            unload: function () {
                this._createTaskSubscribeHandle.remove();

                this._availableTasks.unload();

                for(taskInterfaceIndex in this._taskInterfaces)
                {
                    this._taskInterfaces[taskInterfaceIndex].unload();
                }
            }
        });
    }
);


