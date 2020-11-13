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
        'dojo/text!balek-modules/diaplode/commander/resources/html/terminal.html',
        'dojo/text!balek-modules/diaplode/commander/resources/css/terminal.css',
        //Balek Interface Includes
        'balek-modules/components/syncedCommander/Interface',
        "balek-modules/diaplode/ui/containers/movable"

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
              _syncedCommanderInterface,
              _diaplodeMovableContainer) {
        return declare("moduleDiaplodeCommanderInterfaceTerminal", [_WidgetBase, _TemplatedMixin, _syncedCommanderInterface, _diaplodeMovableContainer], {
            _instanceKey: null,

            templateString: template,
            _mainCssString: mainCss,
            baseClass: "diaplodeCommanderInterfaceTerminal",

            _terminalInputNode: null,
            _terminalOutputNode: null,


            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {
                declare.safeMixin(this, args);

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
            },
            postCreate: function () {
                // domConstruct.place(this.domNode, this._ContactsListDomNode);
                topic.publish("addToMainContentLayerAlwaysOnTop", this.domNode);
                let dockedState = this._interfaceState.get("terminalDocked");

                if(dockedState === 'false')
                {
                    this.dockTerminal();
                }
                else
                {
                    this.unDockTerminal();
                }
                this.makeMovable();

            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onInterfaceStateChange: function (name, oldState, newState) {
                this.inherited(arguments);     //this has to be done so remoteCommander works
                if (name === "Status" && newState === "Ready") {
                    console.log("Instance Status:", newState);
                }
                else if( name==="terminalDocked") {
                    console.log("terminalDocked Status:", newState);

                    if(newState==='true'){
                        this.dockTerminal();

                    }else
                    {
                        this.unDockTerminal();
                    }
                }else if (name === "terminalOutput" ) {
                    this._terminalOutputNode.innerHTML ="<pre>"+ newState+ "</pre>";

                    this._terminalOutputNode.scrollTop = this._terminalOutputNode.scrollHeight;
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
            _onTerminalInputKeyUp: function(keyUpEvent){
                console.log("Key up code an dstuff---------------------------",keyUpEvent);
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        keyUpEvent.preventDefault();
                        if (this._shiftDown) {
                            this._instanceCommands.sendTerminalInput(this._terminalInputNode.value);
                            this._instanceCommands.sendTerminalInput( "\n");
                        } else {
                            if (this._terminalInputNode.value === "") {
                                this._instanceCommands.sendTerminalInput( "\n");
                            }else
                            {
                                this._instanceCommands.sendTerminalInput(this._terminalInputNode.value);
                                this._terminalInputNode.value = "";
                            }
                        }
                        break;
                    case dojoKeys.ESCAPE:
                        keyUpEvent.preventDefault();
                        if (this._shiftDown) {
                        } else {
                            if(this._terminalInputNode.value != ""){
                                this._terminalInputNode.value = "";
                                keyUpEvent.stopPropagation();
                            }
                        }
                        break;
                    case dojoKeys.SHIFT:
                        this._shiftDown = false;
                        break;
                }
            },
            _terminalOnLoadToggleClicked: function(clickEvent){

                let currentSetting = this._interfaceState.get("terminalDocked");
                if(currentSetting === "docked")
                {

                }else
                {
                    this._commanderInstanceCommands.saveSettings({terminalDockedOnLoad: false}).then(
                        function(results){
                            console.log("got results", results);
                        });
                }
            },
            _onTerminalUndockButtonClicked: function(clickEvent)
            {
                this._instanceCommands.undockInterface();
            },
            _onTerminalKillClicked: function(clickEvent)
            {
                this._instanceCommands.sendTerminalInput("\u0004");
            },
            _onViewportResize: function(resizeEvent)
            {
                if(this._interfaceState.get("terminalDocked") === 'true'){
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
            unDockTerminal: function(){
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
            dockTerminal: function(){
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