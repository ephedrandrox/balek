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
        "dijit/focus",
        'dijit/registry',
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        'dojo/text!balek-modules/diaplode/commander/resources/html/terminal.html',
        'dojo/text!balek-modules/diaplode/commander/resources/css/terminal.css',

        "balek-modules/diaplode/ui/input/getUserInput",

        'balek-modules/components/syncedStream/Interface',
        //Balek Interface Includes
        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',




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
              dijitFocus,
              dijitRegistry,
              _WidgetBase,
              _TemplatedMixin,
              template,
              mainCss,
              getUserInput,

              syncedStreamInterface,
              //Balek Interface Includes
              _syncedCommanderInterface,
              _balekWorkspaceContainerContainable,
              xTerm,
              xTermCss,
              xTermAddOnFit) {
        return declare("moduleDiaplodeCommanderInterfaceTerminal", [_WidgetBase, _TemplatedMixin, _syncedCommanderInterface, _balekWorkspaceContainerContainable], {
            _instanceKey: null,

            templateString: template,
            _mainCssString: mainCss,


            baseClass: "diaplodeCommanderInterfaceTerminal",

            _terminalInputNode: null,
            _terminalOutputNode: null,

            _xTermData: "",
            _xTerm: null,

            _sshSyncedStream: null,


            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {
                declare.safeMixin(this, args);

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                domConstruct.place(domConstruct.toDom("<style>" + xTermCss + "</style>"), win.body());

               // console.log("xtermCSS",this._xTermCssString );
                this.setContainerName(" 📺 - Terminal - ");


            },
            startup: function()
            {
               // console.log("startup terminal",this,  this.domNode);
                this.startupXTerm();
            },
            startupXTerm: function(){
               // console.log("startup X terminal",this,  this.domNode);



                if( this._xTerm === null &&this._sshSyncedStream !== null && this.domNode && dom.isDescendant(this.domNode, window.document)){

                  //  console.log("xterm", xTerm,
                   //     xTermCss,
                  //      xTermAddOnFit);

                    this._xTerm = new xTerm.Terminal({allowTransparency: true, theme: { background: 'rgba(5,95,90, .8)',  foreground: '#c39213' }});

                    this._xTermAddOnFit = new xTermAddOnFit.FitAddon();

                    //console.log("xterm",  this._xTerm);
                    this._xTerm.loadAddon(this._xTermAddOnFit);
                    this._xTerm.open(this._terminalOutputNode);

                    //this._xTermAddOnFit.fit();
                    // this._xTerm.fit();
                    this._xTerm.resize(80,24);


                    this._sshSyncedStream.beginStreaming( lang.hitch(this, this.writeToXterm));



                    this._xTerm.onKey(lang.hitch(this, function(xTermKeyEvent){
                       // console.log("xterm",xTermKeyEvent);

                        //this._instanceCommands.sendTerminalInput(xTermKeyEvent.key);

                    }));

                    this._xTerm.onResize(lang.hitch(this, function(xTermResizeEvent){
                        console.log("xterm", "xTermResizeEvent", xTermResizeEvent);

                        //this._instanceCommands.sendTerminalInput(xTermKeyEvent.key);

                    }));
                    this._xTerm.onData(lang.hitch(this, function(xTermDataEvent){
                        //console.log("xterm","xTermDataEvent", xTermDataEvent);

                        this._instanceCommands.sendTerminalInput(xTermDataEvent);


                        //this._instanceCommands.sendTerminalInput(xTermKeyEvent.key);

                    }));

                    this._xTerm.onBinary(lang.hitch(this, function(xTermBinaryEvent){
                        console.log("xterm","xTermBinaryEvent", xTermBinaryEvent);

                        //  this._instanceCommands.sendTerminalInput(xTermDataEvent);


                        //this._instanceCommands.sendTerminalInput(xTermKeyEvent.key);

                    }));


                    this._xTerm.parser.addCsiHandler({final: 't'}, params => {
                        const ps = params[0];
                        console.log("xterm", "ps", ps);
                        return false;      // any Ps that was not handled
                    });

                  //  console.log("xterm",  this._xTerm);


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
                    //console.log("xterm",  placedWidgetDomNode);

                    if(placedWidgetDomNode)
                    {
                        this.startupXTerm();
                       // this._xTerm.write(data);
                    }else {
                      //  console.log("xterm",  "No Dom Node", placedWidgetDomNode);

                    }
                }else {
                  //  console.log("xterm",  this._xTerm);

                    this._xTerm.write(data);

                }



            },
            postCreate: function () {
                // domConstruct.place(this.domNode, this._ContactsListDomNode);
               // topic.publish("addToMainContentLayerAlwaysOnTop", this.domNode);
                let dockedState = this._interfaceState.get("terminalDocked");
                dojoReady(lang.hitch(this, function(){
                    this.startup();
                }));

               // console.log("xterm",  this._xTerm);




                if(dockedState === 'false')
                {
                    //this.dockTerminal();
                }
                else
                {
                    //this.unDockTerminal();
                }
                this.initializeContainable();



            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onInterfaceStateChange: function (name, oldState, newState) {
                this.inherited(arguments);     //this has to be done so remoteCommander works
                if (name === "Status" && newState === "Ready") {
                   // console.log("Instance Status:", newState);
                }
                else if( name==="sshOutputComponentKey") {
                    if(this._sshSyncedStream === null)
                    {
                        this._sshSyncedStream = new syncedStreamInterface({_instanceKey: this._instanceKey,
                                                                    _componentKey : newState.toString()  });
                    }

                }
                else if( name==="terminalDocked") {
                   // console.log("terminalDocked Status:", newState);

                    if(newState==='true'){
                     //   this.dockTerminal();

                    }else
                    {
                     //   this.unDockTerminal();
                    }
                }else if (name === "terminalOutput" ) {
                  alert("terminalOutput should not be sent now ");
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
            _onFocus: function(event) {
                //  dijitFocus.focus(this._terminalInputNode);
                if (this._xTerm === null) {
                this.startupXTerm();
                }
            },
            _onClick: function(event){
             //   dijitFocus.focus(this._terminalInputNode);
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
                            console.log("Connecting Terminal");

                            this._instanceCommands.connectTerminal().then(function(remoteCommandResult){
                                console.log(remoteCommandResult);
                            })
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
            _onTerminalConnectClicked: function(clickEvent)
            {
                console.log("Connecting Terminal");

                this.startupXTerm();

               this._instanceCommands.connectTerminal().then(function(remoteCommandResult){
                   console.log(remoteCommandResult);
               })
            },
            _onTerminalKillClicked: function(clickEvent)
            {

                this._xTerm.resize( 132, 50);


                // this._xTermAddOnFit.fit();
                //this._instanceCommands.sendTerminalInput("\u0004");
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

               // console.log(elementBox);
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