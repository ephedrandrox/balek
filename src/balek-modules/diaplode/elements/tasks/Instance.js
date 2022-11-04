define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/diaplode/elements/tasks/Instance/task',
        'balek-modules/diaplode/elements/tasks/Database/tasks',

        'balek-modules/components/syncedCommander/Instance',
        'balek-modules/components/syncedMap/Instance'

    ],
    function (declare,
              lang,
              topic,

              taskInstance,
              tasksDatabase,

              syncedCommanderInstance,
              syncedMapInstance) {
        return declare("moduleDiaplodeElementsTasksInstance", syncedCommanderInstance, {
            _instanceKey: null,
            _sessionKey: null,

            _tasksDatabase: null,
            _taskInstances: {},

            _availableTasks: null,

            constructor: function (args) {
                declare.safeMixin(this, args);

                this._taskInstances = {};

                this._commands={
                    "createTask" : lang.hitch(this, this.createTask),
                    "loadTask" : lang.hitch(this, this.loadTask)
                };

                this._interfaceState.set("moduleName","moduleDiaplodeElementsTasksInstance");

                console.log("moduleDiaplodeElementsTasksInstance starting...");

                topic.publish("getSessionUserKey", this._sessionKey, lang.hitch(this, function(userKey) {
                    this._userKey = userKey;
                    this._tasksDatabase = new tasksDatabase({_instanceKey: this._instanceKey, _userKey: this._userKey});
                    this._tasksDatabase.getUserTasks().then(lang.hitch(this, function (userTasksArray) {

                            if (userTasksArray.length > 0) {
                               for( userTasksArrayKey in userTasksArray ) {
                                   if( !userTasksArray[userTasksArrayKey].name ){
                                       let taskContent = userTasksArray[userTasksArrayKey].taskContent;
                                       let taskName = taskContent.toString().trim().substr(0,32);
                                       userTasksArray[userTasksArrayKey].name = taskName;

                                   }
                                  // this.createTaskInstance(userTasksArray[userTasksArrayKey]._id);
                                   this._availableTasks.add(userTasksArray[userTasksArrayKey]._id, userTasksArray[userTasksArrayKey]);
                               }
                            } else {
                                //no tasks for user returned
                            }

                    })).catch(function (error) {
                        console.log(error);
                    });
                }));


                this._availableTasks  = new syncedMapInstance({_instanceKey: this._instanceKey});


                this._interfaceState.set("availableTasksComponentKey", this._availableTasks._componentKey);

               // console.log(this._availableTasks);



                this.prepareSyncedState();
                this.setInterfaceCommands();
            },
            createTaskInstance: function(taskID){
                if(this._taskInstances[taskID] === undefined)
                {
                    let newTask = new taskInstance({_instanceKey: this._instanceKey,
                        _sessionKey: this._sessionKey,
                        _userKey: this._userKey,
                        _taskKey: taskID,
                        _tasksDatabase: this._tasksDatabase});


                    this._taskInstances[taskID] = newTask ;

                    this._interfaceState.set("taskInstance"+taskID , {instanceKey: newTask._instanceKey,
                        sessionKey: newTask._sessionKey,
                        userKey: newTask._userKey,
                        componentKey: newTask._componentKey});
                    return true;
                }else {
                    return false;
                }

            },
            //##########################################################################################################
            //Remote Commands Functions Section
            //##########################################################################################################
            createTask: function(taskContent, remoteCommanderCallback){

                this._tasksDatabase.newUserTask(taskContent).then(lang.hitch(this, function(newTaskID){
                    this.createTaskInstance(newTaskID);
                    if(remoteCommanderCallback)
                    {
                        remoteCommanderCallback({success: "Task Created",
                        newTaskID: newTaskID});
                    }

                })).catch(function(newTaskErrorResults){
                    if(remoteCommanderCallback) {
                        remoteCommanderCallback({
                            Error: "Task Not Created",
                            Result: newTaskErrorResults
                        });
                    }
                });


            },
            loadTask: function(taskKey, remoteCommanderCallback)
            {

                if( this.createTaskInstance(taskKey) === true)
                {
                    remoteCommanderCallback({success: "Created Instance"});
                }else {
                    remoteCommanderCallback({error: "Instance already created"});
                }
            }
        });
    }
);


