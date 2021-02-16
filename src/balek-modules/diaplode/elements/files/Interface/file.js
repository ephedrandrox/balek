define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        //Dojo browser includes
        'dojo/dom',
        'dojo/dom-construct',
        "dojo/dom-geometry",
        "dojo/dom-style",
        "dojo/dom-class",
        "dojo/_base/window",
        "dojo/ready",
        "dojo/fx",
        "dojo/keys",

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        'dojo/text!balek-modules/diaplode/elements/files/resources/html/file.html',
        'dojo/text!balek-modules/diaplode/elements/files/resources/css/file.css',
        //Diaplode ui components
        "balek-modules/diaplode/ui/input/getUserInput",
        //Balek Interface Includes
        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',

        'dojo/text!balek-modules/lib/codemirror/lib/codemirror.css',
        'dojo/text!balek-modules/lib/codemirror/theme/ayu-dark.css',
        "balek-modules/lib/codemirror/lib/codemirror",
        "balek-modules/lib/codemirror/mode/javascript/javascript"

    ],
    function (declare,
              lang,
              topic,
              //Dojo browser includes
              dom,
              domConstruct,
              domGeometry,
              domStyle,
              domClass,
              win,
              dojoReady,
              fx,
              dojoKeys,
              _WidgetBase,
              _TemplatedMixin,
              template,
              mainCss,
              //Diaplode ui components
              getUserInput,
              //Balek Interface Includes
              _syncedCommanderInterface,
              _balekWorkspaceContainerContainable,
              // CodeMirror,
              CodeMirrorCSS,
              CodeMirrorCSSTheme,
              CodeMirror,
              //  CodeMirrorModeJavascript,
              CodeMirrorModeJavascript
    ) {
        return declare("moduleDiaplodeElementsFilesInterfaceFile", [_WidgetBase, _TemplatedMixin, _syncedCommanderInterface, _balekWorkspaceContainerContainable
        ], {
            _instanceKey: null,

            templateString: template,
            _mainCssString: mainCss,
            baseClass: "diaplodeElementsFilesInterfaceFile",

            _consoleInputNode: null,
            _consoleOutputNode: null,

            _consoleOnLoadSettingNode: null,

            _viewNode: null,
            _viewNodeCodeMirror: null,

            _dijitEditor: null,
            _dijitEditorNode: null,


            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {
                declare.safeMixin(this, args);


                domConstruct.place(domConstruct.toDom("<style>" + CodeMirrorCSS + "</style>"), win.body());
                domConstruct.place(domConstruct.toDom("<style>" + CodeMirrorCSSTheme + "</style>"), win.body());

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());


                dojoReady(lang.hitch(this, function () {
                    if (this._componentKey) {
                        this.askToConnectInterface();
                    }
                }));
            },
            postCreate: function () {

                this.initializeContainable();


                if (this._viewNodeCodeMirror === null) {


                    console.log("file", CodeMirror);

                    let currentFileContent = this._interfaceState.get("fileContent");
                    if (currentFileContent) {
                        //  this._viewNodeCodeMirror.setValue(currentFileContent);
                    }

                    this._viewNodeCodeMirror = CodeMirror(lang.hitch(this, function (element) {

                        console.log("elelment", element);

                        let currentFileContent = this._interfaceState.get("fileContent");
                        if (currentFileContent) {
                            //  this._viewNodeCodeMirror.setValue(currentFileContent);
                        }

                        domConstruct.place(element, this._viewNode, "only");

                    }), {
                        value: "loading", lineNumbers: true,
                        mode: "javascript",
                        autoRefresh: true,
                        theme: 'ayu-dark'
                    });


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
                if (name === "fileContent") {
                    //  this._viewNodeTextArea.innerHTML =  newState ;

                    if (this._viewNodeCodeMirror !== null) {
                        this._viewNodeCodeMirror.setValue(newState);
                    }
                }
                // console.log(name, newState);
            },
            _onDoubleClick: function (clickEvent) {


            },
            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:


                        break;
                    case dojoKeys.ESCAPE:

                        this._instanceCommands.addContent(this._viewNodeCodeMirror.getValue());
                        break;
                    case dojoKeys.SHIFT:
                        break;

                }
            },
            _onKeyDown: function (keyDownEvent) {
                switch (keyDownEvent.keyCode) {

                    case dojoKeys.SHIFT:
                        break;
                }
            },
            _onFocus: function (event) {

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