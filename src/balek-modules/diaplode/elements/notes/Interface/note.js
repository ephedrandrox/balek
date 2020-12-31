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
    //Dijit widget includes
       // "dijit/Editor",
        //"dojo/parser",
       // "dijit/_editor/plugins/AlwaysShowToolbar",
       // "dijit/_editor/plugins/FontChoice",
       // "dijit/_editor/plugins/TextColor",

        "dijit/_WidgetBase",
    "dijit/_TemplatedMixin",
    'dojo/text!balek-modules/diaplode/elements/notes/resources/html/note.html',
    'dojo/text!balek-modules/diaplode/elements/notes/resources/css/note.css',
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
          domClass,
          win,
          dojoReady,
          fx,
          dojoKeys,
          //Dijit widget includes
         // dijitEditor,
        //  dojoParser,
        //  AlwaysShowToolbar,
        // dijitEditorFontChoice,
        //  dijitEditorTextColor,
          _WidgetBase,
          _TemplatedMixin,
          template,
          mainCss,
          //Diaplode ui components
          getUserInput,
          //Balek Interface Includes
          _syncedCommanderInterface,
          _balekWorkspaceContainerContainable
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
        _viewNodePre: null,

        _dijitEditor: null,
        _dijitEditorNode: null,


        //##########################################################################################################
        //Startup Functions Section
        //##########################################################################################################

        constructor: function (args) {
            declare.safeMixin(this, args);


            domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());

           // domConstruct.place(domConstruct.toDom("<style src='dijit/themes/claro/claro.css'></style>"), win.body());

            domConstruct.place(domConstruct.toDom("<link rel=\"stylesheet\" href=\"/dijit/themes/claro/claro.css\">"), win.body());


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
            if (name === "noteContent") {
               this._viewNodePre.innerHTML =  newState ;
            }
           // console.log(name, newState);
        },
        _onDoubleClick: function(clickEvent)
        {
/*
            this._dijitEditorNode = domConstruct.create("div");
            this._dijitEditorNode.innerHTML = this._viewNode.innerHTML;

            domClass.add(this._dijitEditorNode, [this.baseClass+ "EditorDiv"]);

            domConstruct.place(this._dijitEditorNode, this.domNode, "only");

            dojoReady(lang.hitch(this, function(){
                this._dijitEditor = new dijitEditor({
                    // plugins: ["bold","italic","|","insertUnorderedList"],

                    extraPlugins: ['foreColor', 'hiliteColor']
                }, this._dijitEditorNode);

                //
                this._dijitEditor.onLoadDeferred.then(lang.hitch(this, function(){
                    this._dijitEditor.set("value", "<b>This is new content.</b>");
                }));
                this._dijitEditor.startup();

            }))
*/
            if(this._dijitEditorNode === null)
            {
                this._dijitEditorNode = domConstruct.create("textarea");
            }

            this._dijitEditorNode.value = this._viewNodePre.innerHTML;
            domClass.add(this._dijitEditorNode, [this.baseClass+ "EditorTextArea"]);
            domConstruct.place(this._dijitEditorNode, this.domNode, "only");


        },
        _onKeyUp: function(keyUpEvent){
            switch (keyUpEvent.keyCode) {
                case dojoKeys.ENTER:


                    break;
                case dojoKeys.ESCAPE:
                    if(this._dijitEditorNode.value.toString() === this._viewNodePre.innerHTML.toString())
                    {
                        domConstruct.place( this._viewNode, this.domNode, "only");
                    }else {
                        this._viewNodePre.innerHTML = "waiting for changes"
                        this._instanceCommands.addContent(this._dijitEditorNode.value);
                    }
                    domConstruct.place( this._viewNode, this.domNode, "only");
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