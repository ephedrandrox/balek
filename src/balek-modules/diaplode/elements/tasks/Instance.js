define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'balek-modules/diaplode/elements/tasks/Instance/task',
        'balek-modules/diaplode/elements/tasks/Database/tasks',

        'balek-modules/components/syncedCommander/Instance'
    ],
    function (declare,
              lang,
              topic,

              taskInstance,
              tasksDatabase,

              syncedCommanderInstance) {
        return declare("moduleDiaplodeElementsTasksInstance", syncedCommanderInstance, {
            _instanceKey: null,
            _sessionKey: null,

            _tasksDatabase: null,
            _taskInstances: [],

            constructor: function (args) {
                declare.safeMixin(this, args);
                this._taskInstances = [];

                this._commands={
                    "createTask" : lang.hitch(this, this.createTask)
                };

                this._interfaceState.set("moduleName","moduleDiaplodeElementsTasksInstance");

                console.log("moduleDiaplodeElementsTasksInstance starting...");

                topic.publish("getSessionUserKey", this._sessionKey, lang.hitch(this, function(userKey) {
                    this._userKey = userKey;
                    this._tasksDatabase = new tasksDatabase({_instanceKey: this._instanceKey, _userKey: this._userKey});
                    this._tasksDatabase.getUserTasks().then(lang.hitch(this, function (userTasks) {
                        userTasks.toArray().then(lang.hitch(this, function (userTasksArray) {

                            if (userTasksArray.length > 0) {
                               for( userTasksArrayKey in userTasksArray ) {
                                   this.createTaskInstance(userTasksArray[userTasksArrayKey]._id);
                               }

                            } else {
                                //no tasks for user returned
                            }
                        }));
                    })).catch(function (error) {
                        console.log(error);
                    });
                }));
                this.prepareSyncedState();
                this.setInterfaceCommands();
            },
            createTaskInstance: function(taskID){
                let newTask = new taskInstance({_instanceKey: this._instanceKey,
                    _sessionKey: this._sessionKey,
                    _userKey: this._userKey,
                    _taskKey: taskID,
                    _tasksDatabase: this._tasksDatabase});

                this._taskInstances.push(newTask);

                this._interfaceState.set("taskInstance"+taskID , {instanceKey: newTask._instanceKey,
                    sessionKey: newTask._sessionKey,
                    userKey: newTask._userKey,
                    componentKey: newTask._componentKey});
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


            }
        });
    }
);


