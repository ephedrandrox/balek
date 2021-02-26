
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
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",
        'dojo/text!balek-client/session/workspace/container/widgets/movableResizableFrame/resources/html/movableResizableFrame.html',
        'dojo/text!balek-client/session/workspace/container/widgets/movableResizableFrame/resources/css/movableResizableFrame.css',
        'dojo/text!dojox/layout/resources/ResizeHandle.css',
        "dojox/layout/ResizeHandle",
        "dojo/dnd/Moveable",

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
              _WidgetBase,
              _TemplatedMixin,
              template,
              mainCss,
              resizeHandleCSS,
              ResizeHandle,
              Moveable
              ) {
        return declare("balekWorkspaceContainerWidgetMovableResizableFrame", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            _containedInterfaceHandle: null,
            _containerState: null,
            _containerKey: null,

            templateString: template,
            _mainCssString: mainCss,
            _resizeHandleCssString: resizeHandleCSS,
            baseClass: "balekWorkspaceContainerWidgetMovableResizableFrame",


            workspaceManagerCommands: null,
            containerCommands: null,

            _topBarBackgroundNode: null,
            _bottomBarNode: null,
            _contentNode: null,

            _topBarCloseNode: null,
            _topBarDockNode: null,


            _dnd: null,
            _resizeHandle: null,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("Initializing Balek Workspace Manager Container Manager Movable Widget...");

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                domConstruct.place(domConstruct.toDom("<style>" + this._resizeHandleCssString + "</style>"), win.body());

            },
            startup: function(){
               console.log("balekWorkspaceContainerWidgetMovableResizableFrame startup called");

               this._containedInterfaceHandle.startup();
            },
            postCreate: function () {

               if(this._containedInterfaceHandle != null)
                {
                   domConstruct.place(this._containedInterfaceHandle.domNode, this._contentNode);

                }

                let elementBox =  this._containerState.get("movableContainerElementBox");

                if(elementBox !== undefined)
                {
                    this.updateWidgetWithElementBox(elementBox);
                }else
                {
                console.log("no element Box");
                }
               // topic.publish("addToMainContentLayerAlwaysOnTop", this.domNode);

                //topic.publish("addToCurrentWorkspace", this);

                this._dnd = new Moveable(this.domNode, {handle: this._topBarBackgroundNode});



                this._resizeHandle = new ResizeHandle({
                    targetContainer: this.domNode,
                    activeResize: true
                }).placeAt(this._bottomBarNode);


                this._dnd.on("MoveStop", lang.hitch(this, this.onWidgetMoveStop));

                this._dnd.on("MoveStart", lang.hitch(this, function(){
                    console.log("onMoveStart");
                    this.workspaceManagerCommands.activateContainerInWorkspace(this.workspaceManagerCommands.getActiveWorkspace(), this._containerKey);
                }));


                    this._resizeHandle.on("resize", lang.hitch(this, this.onWidgetResizeStop));


            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            _onTopMouseDown: function(mouseEvent){
                this.workspaceManagerCommands.activateContainerInWorkspace(this.workspaceManagerCommands.getActiveWorkspace(), this._containerKey);
                console.log("Mousedown");
            },
            onWidgetMoveStop: function (){
                this.updateMovableContainerElementBox()
             },
            onWidgetResizeStop: function (){
                this.updateMovableContainerElementBox();
            },
            _onDockNodeMouseDown: function(mouseEvent){

                console.log("Mousedown", mouseEvent);
                mouseEvent.stopPropagation();

                if(this.containerCommands !== null
                && this.containerCommands.hide && typeof this.containerCommands.hide === "function" ){
                    console.log("Mousedown", this.containerCommands.hide);

                    this.containerCommands.hide();

                }else {
                    console.log("Mousedown", this.containerCommands);

                }

            },
            _onCloseNodeMouseDown: function(mouseEvent){
                console.log("Mousedown",    mouseEvent);

                mouseEvent.stopPropagation();
            },
            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################
             updateWidgetWithElementBox: function(elementBox)
             {
              if(elementBox && elementBox.t !== undefined && elementBox.l !== undefined  ){
                                                 this.moveTo(Math.round(elementBox.t), Math.round(elementBox.l));
                                             }
                                             if(elementBox && elementBox.w !== undefined && elementBox.h !== undefined  ){
                                                 this.resizeTo(Math.round(elementBox.w), Math.round(elementBox.h));
                                             }
             },
             moveTo: function(t,l){
                            //todo check that we are moving somewhere on screen
                            if(this.domNode){
                                domStyle.set(this.domNode, "top", t+"px");
                                domStyle.set(this.domNode, "left", l+"px");
                            }
                        },
                         resizeTo: function(w,h){
                                        if(this.domNode){
                                            domStyle.set(this.domNode, "width", w+"px");
                                            domStyle.set(this.domNode, "height", h+"px");
                                        }
                                    },
            //no UI Functions
            //##########################################################################################################

            updateMovableContainerElementBox: function()
            {
                            let elementBox = domGeometry.getContentBox(this.domNode);
                            this.setContainerState("movableContainerElementBox", elementBox);
            },
            //Interface Functions Section
            //##########################################################################################################
            unload: function () {
                this.inherited(arguments);
                this.destroy();
            },
            toggleShowView: function () {
                let currentStateToggle = {"visible": "hidden", "hidden": "visible"};
                domStyle.set(this.domNode, {"visibility": currentStateToggle[domStyle.get(this.domNode, "visibility")]});
            }
        });
    });