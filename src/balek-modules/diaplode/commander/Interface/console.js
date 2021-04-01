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
        'dojo/text!balek-modules/diaplode/commander/resources/html/console.html',
        'dojo/text!balek-modules/diaplode/commander/resources/css/console.css',
        'balek-modules/diaplode/navigator/interfaceCommands',

        //Diaplode ui components
        "balek-modules/diaplode/ui/input/getUserInput",
        "balek-modules/diaplode/commander/Interface/menus/workspacesMenu/menuWidget",
        //Balek Interface Includes
        'balek-modules/components/syncedCommander/Interface',
        //xTerm
        'balek-modules/lib/xterm/lib/xterm',
        'dojo/text!balek-modules/lib/xterm/css/xterm.css',
        'balek-modules/lib/xterm-addon-fit/lib/xterm-addon-fit'


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
              navigatorInterfaceCommands,
              //Diaplode ui components
              getUserInput,
              workspaceMenu,

              //Balek Interface Includes
              _syncedCommanderInterface,
              xTerm,
              xTermCss,
              xTermAddOnFit) {
        return declare("moduleDiaplodeCommanderInterfaceConsole", [_WidgetBase, _TemplatedMixin, _syncedCommanderInterface], {
            _instanceKey: null,

            templateString: template,
            _mainCssString: mainCss,
            baseClass: "diaplodeCommanderInterfaceConsole",

            _consoleInputNode: null,
            _consoleOutputNode: null,

            _consoleOnLoadSettingNode: null,

            navigatorCommands: null,


            _workspacesMenuDiv: null,

            _workspaceMenuWidget: null,
            _workspaceManagerState: null,
            _workspaceStateList: null,

            _xTerm: null,


            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {
                declare.safeMixin(this, args);
                this.navigatorCommands = new navigatorInterfaceCommands();

                this._workspaceMenuWidget = new workspaceMenu();

                this._workspaceManagerState = null;
                this._workspaceStateList =  null;

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());

                let timeout;

                dijitViewPort.on( 'resize', lang.hitch(this, function(event){
                    clearTimeout(timeout);
                    timeout = setTimeout(lang.hitch(this, this._onViewportResize), 500)
                }));



            },
            postCreate: function () {
               // domConstruct.place(this.domNode, this._ContactsListDomNode);
                topic.publish("addToMainContentLayerAlwaysOnTop", this.domNode);
                let dockedState = this._interfaceState.get("consoleDocked");
                topic.publish("addToMainContentLayerAlwaysOnTop",  this._workspaceMenuWidget.domNode );
                domConstruct.place(domConstruct.toDom("<style>" + xTermCss + "</style>"), win.body());

                if(dockedState === 'false')
                {
                    this.dockConsole();
                }
                else
                {
                    this.unDockConsole();
                }

                this.checkForWorkspaceStates();
            },
            startup: function()
            {
                // console.log("startup terminal",this,  this.domNode);
                this.startupXTerm();
            },
            startupXTerm: function(){

                if( this._xTerm === null  && this.domNode && dom.isDescendant(this.domNode, window.document)){

                    this._xTerm = new xTerm.Terminal({allowTransparency: true, theme: { background: 'rgba(0,0,0, .6)',  foreground: '#c39213', foreground: 'white' }});


                    this._xTermAddOnFit = new xTermAddOnFit.FitAddon();

                    //console.log("xterm",  this._xTerm);
                    this._xTerm.loadAddon(this._xTermAddOnFit);

                    //this._xTerm.resize(150,30);
                    this._xTerm.open(this._consoleOutputNode);

                    this._xTermAddOnFit.fit();
                    if (this._interfaceState !== null)
                    {
                        let consoleOutput = this._interfaceState.get("consoleOutput");
                        if(consoleOutput)
                        {
                            this.writeToXterm(this._interfaceState.get("consoleOutput"));
                        }
                    }




                }else
                {
                    // console.log("startup Xterm not ready",this._xTerm , this.domNode , dom.isDescendant(this.domNode, window.document) );
                }








            },
            writeToXterm: function(data)
            {
                if(this._xTerm === null)
                {
                    //todo make isDomNodePlaced function
                    let placedWidgetDomNode = dom.byId(this.id);

                    if(placedWidgetDomNode)
                    {
                        this.startupXTerm();

                    }else {
                        //this.domNode Not placed
                    }
                }else {
                    data = data.replace(/\n/g, '\r\n');

                    this._xTerm.reset();

                    this._xTerm.write(data);

                }



            },

            checkForWorkspaceStates: function() {
                if (this._workspaceManagerState === null){

                    this._workspaceManagerState = this._workspaceMenuWidget.getWorkspaceManagerState();
                    this._workspaceManagerStateWatchHandle = this._workspaceManagerState.watch(lang.hitch(this, this.onWorkspaceManagerStateChange));

                }

                if (this._workspaceStateList === null){
                    this._workspaceStateList = this._workspaceMenuWidget.getWorkspacesStateList();
                    this._workspaceManagerStateListWatchHandle = this._workspaceStateList.watch(lang.hitch(this, this.onWorkspaceManagerStateChange));

                    this.updateWorkspaceNameDiv();
                }


            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            updateWorkspaceNameDiv: function()
            {
                if(this._workspaceManagerState !== null && this._workspaceStateList !== null )
                {
                    let activeWorkspaceKey = this._workspaceManagerState.get("activeWorkspace");
                    if (activeWorkspaceKey){
                        let activeWorkspaceInfo = this._workspaceStateList.get(activeWorkspaceKey);
                       this._workspacesMenuDiv.innerHTML = activeWorkspaceInfo.workspaceName +" - ❖" ;
                    }
                }else {
                    this.checkForWorkspaceStates();
                }
            },
            onWorkspaceManagerStateChange: function(name, oldState, newState){
                console.log("workspaceMenu", name, oldState, newState);


                    this.updateWorkspaceNameDiv();

            },

            onInterfaceStateChange: function (name, oldState, newState) {
                this.inherited(arguments);     //this has to be done so remoteCommander works
                if (name === "Status" && newState === "Ready") {
                   // console.log("Instance Status:", newState);
                }
                else if( name==="consoleDocked") {
                    //console.log("consoleDocked Status:", newState);

                    if(newState==='true'){
                        this.dockConsole();

                    }else
                    {
                        this.unDockConsole();
                    }
                }else if (name === "consoleOutput" ) {
                   // this._consoleOutputNode.innerHTML ="<pre>"+ newState+ "</pre>";

                  //  this._consoleOutputNode.scrollTop = this._consoleOutputNode.scrollHeight;

                    this.writeToXterm(newState);
                }
               // console.log(name, newState);
                },
            _onKeyUp: function(keyUpEvent){
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();
                        if (this._shiftDown) {

                        } else {

                        }
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        if (this._shiftDown) {

                        } else {

                            this._instanceCommands.dockInterface();
                            keyUpEvent.stopPropagation();
                        }
                        break;
                    case dojoKeys.SHIFT:
                        this._shiftDown = false;
                        break;

                }
            },
            _onKeyDown: function(keyDownEvent){
                switch (keyDownEvent.keyCode) {

                    case dojoKeys.SHIFT:
                        this._shiftDown = true;
                        break;

                }
            },
            _onFocus: function(event){

            },
            _onConsoleInputKeyUp: function(keyUpEvent){
               // console.log("Key up code an dstuff---------------------------",keyUpEvent);
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();
                        if (this._shiftDown) {
                            this._instanceCommands.sendConsoleInput(this._consoleInputNode.value);
                            this._instanceCommands.sendConsoleInput( "\n");
                        } else {
                            if (this._consoleInputNode.value === "") {
                                this._instanceCommands.sendConsoleInput( "\n");
                            }else
                            {
                                this._instanceCommands.sendConsoleInput(this._consoleInputNode.value);
                                this._consoleInputNode.value = "";
                            }
                        }
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        if (this._shiftDown) {
                        } else {
                            if(this._consoleInputNode.value != ""){
                                this._consoleInputNode.value = "";
                                keyUpEvent.stopPropagation();
                            }
                        }
                        break;
                    case dojoKeys.SHIFT:
                        this._shiftDown = false;
                        break;
                }
            },
            _consoleOnLoadToggleClicked: function(clickEvent){

                let currentSetting = this._interfaceState.get("consoleDocked");
                if(currentSetting === "docked")
                {

                }else
                {
                    this._commanderInstanceCommands.saveSettings({consoleDockedOnLoad: false}).then(
                        function(results){
                      //  console.log("got results", results);
                        });
                }
            },
            _onConsoleUndockButtonClicked: function(clickEvent)
            {
                this._instanceCommands.undockInterface();
            },
            _onConsoleNewFileButtonClicked: function(clickEvent){
                console.log("New File clicked");

                let getDataForFile = new getUserInput({question: "Start File with...",
                    inputReplyCallback: lang.hitch(this, function(newFileData){
                        console.log("Requesting new File with", newFileData);

                        topic.publish("createNewDiaplodeFile", newFileData);



                        getDataForFile.unload();
                    }) });

            },
            _onConsoleNewNoteButtonClicked: function(clickEvent){
                console.log("New Note clicked");

                let getDataForNote = new getUserInput({question: "Start Note with...",
                                inputReplyCallback: lang.hitch(this, function(newNoteData){
                        console.log("Requesting new Note with", newNoteData);

                        topic.publish("createNewDiaplodeNote", newNoteData);



                                    getDataForNote.unload();
                    }) });

            },
            _onConsoleNewTaskButtonClicked: function(clickEvent){
                console.log("New Task clicked");

                let getNameForTask = new getUserInput({question: "Name Task",
                    inputReplyCallback: lang.hitch(this, function(newTaskName){
                        console.log("Requesting new Task with", newTaskName);

                        topic.publish("createNewDiaplodeTask", newTaskName);

                        getNameForTask.unload();
                    }) });

            },
            _onLoadModuleButtonClicked: function(clickEvent){
                console.log("New Command clicked");

                let getModuleName = new getUserInput({question: "Module Name",
                    inputReplyCallback: lang.hitch(this, function(loadModuleName){
                        console.log("Requesting Module ", loadModuleName);

                        //topic.publish("createNewDiaplodeCommand", newCommandName);
                        //this could be something the commander handles
                        let moduleID = loadModuleName;
                        topic.publish("isModuleLoaded", moduleID, function (moduleIsLoaded) {

                            topic.publish("getAvailableModulesState", lang.hitch(this, function (availableModulesStore) {
                               console.log("getAvailableModulesState", availableModulesStore);
                            }));

                            console.log("isModuleLoaded ", moduleIsLoaded);
                            if (moduleIsLoaded) {
                                moduleIsLoaded.toggleShowView();
                            } else {
                                topic.publish("requestModuleLoad", moduleID);
                            }
                        });


                        getModuleName.unload();
                    }) });

            },
            _onConsoleNewTerminalButtonClicked: function(clickEvent){
                console.log("New Terminal clicked");

               this._commanderInstanceCommands.newTerminal().then(function(remoteCommandResult){
                   console.log(remoteCommandResult);
               });

            },
            _onNavigatorToggleShowNavigatorViewButtonClicked: function(clickEvent){
                console.log("Toggle  Navigator overlay");

                this.navigatorCommands.getCommands().then(lang.hitch(this, function(navigatorCommands){

                    navigatorCommands.toggleShowView();

                })).catch(function(errorResult){
                    console.log(errorResult);
                });



            },
            _onNavigatorToggleShowWorkspaceViewButtonClicked: function(clickEvent){
                console.log("Toggle Workspace Navigator");

                this.navigatorCommands.getCommands().then(lang.hitch(this, function(navigatorCommands){

                    navigatorCommands.toggleWorkspaceShowView();

                })).catch(function(errorResult){
                    console.log(errorResult);
                });



            },
            _onNavigatorToggleShowElementViewButtonClicked: function(clickEvent){
                console.log("Toggle Element Navigator");

                this.navigatorCommands.getCommands().then(lang.hitch(this, function(navigatorCommands){

                    navigatorCommands.toggleElementShowView();

                })).catch(function(errorResult){
                    console.log(errorResult);
                });



            },
            _onNavigatorToggleShowContainerViewButtonClicked: function(clickEvent){
                console.log("Toggle Container Navigator");

                this.navigatorCommands.getCommands().then(lang.hitch(this, function(navigatorCommands){

                    navigatorCommands.toggleContainerShowView();

                })).catch(function(errorResult){
                    console.log(errorResult);
                });



            },
            _onWorkspacesClicked: function(event){
                console.log("Workspaces Clicked");
                this.checkForWorkspaceStates();


                let workspacesMenu = this._workspaceMenuWidget;


                workspacesMenu.toggleShowView();
               // console.log(workspacesMenu);

            },
            _onRunCommandClicked: function(clickEvent)
            {
                let getCommand = new getUserInput({question: "Enter Command",
                    inputReplyCallback: lang.hitch(this, function(userCommand){
                        console.log("Executing Command ", userCommand);

                       this._instanceCommands.executeCommand(userCommand).then(function(reply){
                            console.log(reply);
                        }).catch(function(error){
                           console.log(error);
                       });


                        getCommand.unload();
                    }) });
            },
            _onConsoleKillClicked: function(clickEvent)
            {
                this._instanceCommands.sendConsoleInput("\u0004");
            },
            _onSettingButtonClicked: function(clickEvent){
                alert("put console settings here");
            },
            _onViewportResize: function(resizeEvent)
            {
                    if(this._interfaceState.get("consoleDocked") === 'true'){
                        console.log("resized docked");
                        let elementBox = domGeometry.getContentBox(this.domNode);
                        domStyle.set(this.domNode, {"top":(35-elementBox.h) + "px"});

                    }else {
                        console.log("resized undocked");

                    }

                    if(this._xTermAddOnFit !== null){
                        this._xTermAddOnFit.fit();
                    }
            },
            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################
            unDockConsole: function(){
                fx.slideTo({
                        node: this.domNode,
                        top: "0",
                        left: "0",
                        unit: "px",
                        duration: 200,
                        onBegin: lang.hitch(this, function(){
                            domStyle.set(this.domNode, {"visibility": "visible"});
                        })
                    }).play();
            },
            dockConsole: function(){
                let elementBox = domGeometry.getContentBox(this.domNode);

               // console.log(elementBox);
                fx.slideTo({
                    node: this.domNode,
                    top:  35-elementBox.h,
                    left: "0",
                    unit: "px",
                    duration: 200,
                    onEnd: lang.hitch(this,function(){
                        domStyle.set(this.domNode, {"visibility": "visible", "top": (35-domGeometry.getContentBox(this.domNode).h)+ "px" });
                    })
                }).play();
            },
            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################
            unload: function () {
                this.inherited(arguments);

                this._workspaceManagerStateListWatchHandle.unwatch();
                this._workspaceManagerStateListWatchHandle.unload();

                this.__workspaceManagerStateWatchHandle.unwatch();
                this.__workspaceManagerStateWatchHandle.unload();



                this.destroy();
            }
        });
    });