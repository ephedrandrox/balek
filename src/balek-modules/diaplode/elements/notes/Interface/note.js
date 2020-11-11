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
    'dojo/text!balek-modules/diaplode/elements/notes/resources/html/note.html',
    'dojo/text!balek-modules/diaplode/elements/notes/resources/css/note.css',
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
          diaplodeMovableContainer) {
    return declare("moduleDiaplodeElementsNotesInterfaceNote", [_WidgetBase, _TemplatedMixin, _syncedCommanderInterface, diaplodeMovableContainer], {
        _instanceKey: null,

        templateString: template,
        _mainCssString: mainCss,
        baseClass: "diaplodeElementsNotesInterfaceNote",

        _consoleInputNode: null,
        _consoleOutputNode: null,

        _consoleOnLoadSettingNode: null,

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
            topic.publish("addToMainContentLayer", this.domNode);
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
            console.log(name, newState);
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