define(['dojo/_base/declare',
    'dojo/_base/lang',
    'dojo/topic',
    //Dojo browser includes
    'dojo/dom',
    'dojo/dom-construct',
    "dojo/dom-geometry",
    "dojo/dom-style",
    "dojo/_base/window",
    "dojo/ready",
    "dojo/fx",
    "dojo/keys",
    //Dijit widget includes
    "dijit/Viewport",
    "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    'dojo/text!balek-modules/diaplode/elements/tasks/resources/html/task.html',
    'dojo/text!balek-modules/diaplode/elements/tasks/resources/css/task.css',
    //Diaplode ui components
    "balek-modules/diaplode/ui/input/getUserInput",
    //Balek Interface Includes
    'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable'

],
function (declare,
          lang,
          topic,
          //Dojo browser includes
          dom,
          domConstruct,
          domGeometry,
          domStyle,
          win,
          dojoReady,
          fx,
          dojoKeys,
          //Dijit widget includes
          dijitViewPort,
          _WidgetBase,
          _TemplatedMixin,
          template,
          mainCss,
          //Diaplode ui components
          getUserInput,
          //Balek Interface Includes
          _syncedCommanderInterface,
          _balekWorkspaceContainerContainable) {
    return declare("moduleDiaplodeElementsTasksInterfaceTask", [_WidgetBase, _TemplatedMixin, _syncedCommanderInterface, _balekWorkspaceContainerContainable], {
        _instanceKey: null,

        templateString: template,
        _mainCssString: mainCss,
        baseClass: "diaplodeElementsTasksInterfaceTask",

        _consoleInputNode: null,
        _consoleOutputNode: null,

        _consoleOnLoadSettingNode: null,

        _statusNode: null,
        _descriptionNode: null,

        //##########################################################################################################
        //Startup Functions Section
        //##########################################################################################################

        constructor: function (args) {
            declare.safeMixin(this, args);

            domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
            dojoReady(lang.hitch(this, function () {
                if (this._componentKey) {
                    this.askToConnectInterface();
                }
            }));

        },
        postCreate: function () {
            this.initializeContainable();
        },
        //##########################################################################################################
        //Event Functions Section
        //##########################################################################################################
        onInterfaceStateChange: function (name, oldState, newState) {
            this.inherited(arguments);     //this has to be done so remoteCommander works
            if (name === "Status" && newState === "Ready") {
                console.log("Instance Status:", newState);
            }
            if (name === "taskContent") {
               this._descriptionNode.innerHTML = newState;
            }
            if (name === "taskStatus") {
                this._statusNode.innerHTML = newState;
            }
           // console.log(name, newState);
        },
        _onStatusClick: function(clickEvent){

            let currentStatus = this._interfaceState.get("taskStatus");
            if(currentStatus !== "✅"){
                this._instanceCommands.setStatus("✅").then(function(commandResult){
                    console.log(commandResult);
                });
            }else {
             this._instanceCommands.setStatus("☑️").then(function(commandResult){
                    console.log(commandResult);
                });
            }

        },
        _onDoubleClick: function(clickEvent)
        {
            let currentValue = this._interfaceState.get("taskContent");
            let getDataForTask = new getUserInput({question: "Change Task to...",
                initialValue: currentValue,
                inputReplyCallback: lang.hitch(this, function(newtaskContent){
                    console.log("Requesting Task Data Change with", newtaskContent);

                    this._instanceCommands.addContent(newtaskContent).then(function(commandResult){
                        console.log(commandResult);
                    });



                    getDataForTask.unload();
                }) });

        },
        _onKeyUp: function(keyUpEvent){
            switch (keyUpEvent.keyCode) {
                case dojoKeys.ENTER:
                    break;
                case dojoKeys.ESCAPE:
                    break;
                case dojoKeys.SHIFT:
                    break;

            }
        },
        _onKeyDown: function(keyDownEvent){
            switch (keyDownEvent.keyCode) {

                case dojoKeys.SHIFT:
                    break;
            }
        },
        _onFocus: function(event){

        },
        //##########################################################################################################
        //UI Functions Section
        //##########################################################################################################
        //no UI Functions yet
        //##########################################################################################################
        //Interface Functions Section
        //##########################################################################################################
        unload: function () {
            this.inherited(arguments);
            this.destroy();
        }
    });
});