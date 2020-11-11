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
        //Balek Interface Includes
        'balek-modules/components/syncedCommander/Interface',
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
              //Balek Interface Includes
              _syncedCommanderInterface) {
        return declare("moduleDiaplodeCommanderInterfaceConsole", [_WidgetBase, _TemplatedMixin, _syncedCommanderInterface], {
            _instanceKey: null,

            templateString: template,
            _mainCssString: mainCss,
            baseClass: "diaplodeCommanderInterfaceConsole",

            _consoleInputNode: null,
            _consoleOutputNode: null,

            _consoleOnLoadSettingNode: null,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {
                declare.safeMixin(this, args);

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                dijitViewPort.on("resize", lang.hitch(this, this._onViewportResize));
            },
            postCreate: function () {
               // domConstruct.place(this.domNode, this._ContactsListDomNode);
                topic.publish("addToMainContentLayerAlwaysOnTop", this.domNode);
                let dockedState = this._interfaceState.get("consoleDocked");

                if(dockedState === 'false')
                {
                    this.dockConsole();
                }
                else
                {
                    this.unDockConsole();
                }
            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onInterfaceStateChange: function (name, oldState, newState) {
                this.inherited(arguments);     //this has to be done so remoteCommander works
                if (name === "Status" && newState === "Ready") {
                    console.log("Instance Status:", newState);
                }
                else if( name==="consoleDocked") {
                    console.log("consoleDocked Status:", newState);

                    if(newState==='true'){
                        this.dockConsole();

                    }else
                    {
                        this.unDockConsole();
                    }
                }else if (name === "consoleOutput" ) {
                    this._consoleOutputNode.innerHTML ="<pre>"+ newState+ "</pre>";

                    this._consoleOutputNode.scrollTop = this._consoleOutputNode.scrollHeight;
                }
                console.log(name, newState);
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
                console.log("Key up code an dstuff---------------------------",keyUpEvent);
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
                        console.log("got results", results);
                        });
                }
            },
            _onConsoleUndockButtonClicked: function(clickEvent)
            {
                this._instanceCommands.undockInterface();
            },
            _onConsoleNewNoteButtonClicked: function(clickEvent){
                console.log("clicked");
                topic.publish("createNewDiaplodeNote");
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
                        domStyle.set(this.domNode, {"top":(30-elementBox.h) + "px"});

                    }else {
                        console.log("resized undocked");

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

                console.log(elementBox);
                fx.slideTo({
                    node: this.domNode,
                    top:  30-elementBox.h,
                    left: "0",
                    unit: "px",
                    duration: 200,
                    onEnd: lang.hitch(this,function(){
                        domStyle.set(this.domNode, {"visibility": "visible"});
                    })
                }).play();
            },
            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################
            unload: function () {
                this.inherited(arguments);
                this.destroy();
            }
        });
    });