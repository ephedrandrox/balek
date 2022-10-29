define(['dojo/_base/declare',
        'dojo/_base/lang',
        'balek-modules/components/syncedCommander/Instance'

    ],
    function (declare, lang, syncedCommanderInstance) {
        return declare("moduleDiaplodeElementsTasksTaskInstance", [syncedCommanderInstance], {

            _tasksDatabase: null,
            _tasksKey: null,

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("starting moduleDiaplodeElementsTasksTaskInstance");

                this._commands={
                    "addContent" : lang.hitch(this, this.addContent),
                    "removeContent" : lang.hitch(this, this.removeContent),
                    "setStatus": lang.hitch(this, this.setStatus)
                };


                this._interfaceState.set("taskContent","Loading...");

                this._interfaceState.set("taskStatus","☑️");

                if(this._tasksDatabase && this._taskKey)
                {
                    this._tasksDatabase.getUserTask(this._taskKey).then(
                        lang.hitch(this, function(userTaskResult){
                            console.log("user Task Retrieval",userTaskResult);
                            this._interfaceState.set("taskContent",userTaskResult.taskContent);
                            this._interfaceState.set("taskStatus",userTaskResult.taskStatus);


                        })
                    ).catch(lang.hitch(this, function(userTaskError){
                        console.log("user Task Retrieval error",userTaskError,this._taskKey );
                    }));
                }
                this.prepareSyncedState();
                this.setInterfaceCommands();
            },
            addContent: function(content, remoteCommandCallback)
            {
                this._tasksDatabase.updateUserTask(this._taskKey, content).then(
                    lang.hitch(this, function(userTaskResult){
                 //       console.log("user Task Set",userTaskResult);
                        this._interfaceState.set("taskContent", content);
                    })
                ).catch(lang.hitch(this, function(userTaskError){
                    console.log("user Task Set error",userTaskError);
                }));
                remoteCommandCallback({success: "Content Added"});
            },
            removeContent: function(contentPosition, remoteCommandCallback){
                this._interfaceState.set("removeContent", contentPosition);
                remoteCommandCallback({success: "Content Removed"});
            },
            setStatus: function(taskStatus, remoteCommandCallback)
            {


                this._tasksDatabase.updateUserTaskStatus(this._taskKey, taskStatus).then(
                    lang.hitch(this, function(userTaskUpdateResult){

                        this._interfaceState.set("taskStatus", taskStatus);
                        remoteCommandCallback({success: "Status Updated"});

                    })
                ).catch(lang.hitch(this, function(userTaskError){
                    console.log("user Task Set error",userTaskError);
                    remoteCommandCallback({error: "Status Updated"});

                }));

            }
        });
    });