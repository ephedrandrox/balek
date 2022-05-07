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
        'dojo/text!balek-modules/diaplode/elements/notes/resources/html/note.html',
        'dojo/text!balek-modules/diaplode/elements/notes/resources/css/note.css',
        //Diaplode ui components
        "balek-modules/diaplode/ui/input/getUserInput",
        //Balek Interface Includes
        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable',

        //quill includes
        'dojo/text!balek-modules/lib/quill/dist/quill.core.css',
        'dojo/text!balek-modules/lib/quill/dist/quill.snow.css',
        "balek-modules/lib/quill/dist/quill",

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
              QuillCSS,
              QuillSnowCSS,
              QuillBalek
    ) {
        return declare("moduleDiaplodeElementsNotesInterfaceNote", [_WidgetBase, _TemplatedMixin, _syncedCommanderInterface, _balekWorkspaceContainerContainable
        ], {
            _instanceKey: null,

            templateString: template,
            _mainCssString: mainCss,
            baseClass: "diaplodeElementsNotesInterfaceNote",

            _consoleInputNode: null,
            _consoleOutputNode: null,

            _consoleOnLoadSettingNode: null,

            _viewNode: null,

            _mainFlexDivNode: null,
            _toolbarNode: null,

            _quillEditor: null,
            _quillEditorNode: null,


            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {
                declare.safeMixin(this, args);

                console.log("quill", QuillSnowCSS);

                domConstruct.place(domConstruct.toDom("<style>" + QuillCSS + "</style>"), win.body());
                domConstruct.place(domConstruct.toDom("<style>" + QuillSnowCSS + "</style>"), win.body());

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());

                 console.log("quill", this);


                this.setContainerName("🗒 - Note");


                dojoReady(lang.hitch(this, function () {
                    if (this._componentKey) {
                        this.askToConnectInterface();
                    }
                }));
            },
            postCreate: function () {

                this.initializeContainable();

                this._quillEditor = new QuillBalek.default.Quill(this._viewNode, {
                    theme: 'snow',

                    modules: {
                        toolbar: this._toolbarNode
                    }

                });

                let noteContents = this._interfaceState.get("noteContent");
                if (noteContents) {

                    this.setNoteContents(noteContents);

                }

            },
            setNoteContents: function (noteContents) {

                if (this._quillEditor !== null) {
                    //if a string
                    let noteContentsDelta = noteContents;
                    if (typeof (noteContents) === "string") {
                        noteContentsDelta = new QuillBalek.default.Delta().insert(noteContents);
                    }


                    let oldContentLength = this._quillEditor.getLength();

                    this._quillEditor.setContents(noteContentsDelta);

                    this.setContainerName("🗒 - " + this._quillEditor.getText(0, 32));

                    if(oldContentLength === 1)
                    {
                        this._quillEditor.history.clear();
                    }

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
                if (name === "noteContent") {
                    this.setNoteContents(newState);
                }

            },
            _onDoubleClick: function (clickEvent) {
               //Nothing yet
            },
            _onKeyUp: function (keyUpEvent) {
                switch (keyUpEvent.keyCode) {
                    case dojoKeys.ENTER:
                        break;
                    case dojoKeys.ESCAPE:
                        let noteContents = this._quillEditor.getContents();
                        console.log("quill", noteContents);
                        this._instanceCommands.addContent(noteContents);
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