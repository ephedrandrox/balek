define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        "dojo/dom-construct",
        "dojo/_base/window",
        'balek-modules/diaplode/elements/tasks/Interface/task',
        'balek-modules/components/syncedCommander/Interface',


    ],
    function (declare, lang,  topic, domConstruct, win, taskInterface, syncedCommanderInterface) {

        return declare("moduleDiaplodeElementsTasksInterface", syncedCommanderInterface, {
            _instanceKey: null,
            _createTaskSubscribeHandle: null,
            _taskInterfaces: [],

            constructor: function (args) {
                declare.safeMixin(this, args);
                this._interfaces = [];
                console.log("moduleDiaplodeElementsTasksInterface started", this._instanceKey);

               this._createTaskSubscribeHandle=  topic.subscribe("createNewDiaplodeTask", lang.hitch(this, function(taskContent){
                    console.log("createNewDiaplodeTask topic Command Called");
                    this._instanceCommands.createTask(taskContent).then(function(commandReturnResults){
                        debugger;
                        console.log("Create Task Received Command Response", commandReturnResults);
                    }).catch(function(commandErrorResults){
                        console.log("Create Task Received Error Response", commandErrorResults);
                    });
                }));

            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to inherited() so remoteCommander works
                this.inherited(arguments);
                console.log(name,newState);

                if(name.toString().substr(0,12) === "taskInstance" &&
                    newState.instanceKey && newState.componentKey && newState.sessionKey){
                    console.log("starttttttt");

                    this._taskInterfaces.push(new taskInterface({
                                    _instanceKey:newState.instanceKey,
                                    _componentKey:newState.componentKey,
                                    _sessionKey:newState.sessionKey}))
                }

            },
            unload: function () {
                this._createTaskSubscribeHandle.remove();

                for(taskInterfaceIndex in this._taskInterfaces)
                {
                    this._taskInterfaces[taskInterfaceIndex].unload();
                }
            }
        });
    }
);



