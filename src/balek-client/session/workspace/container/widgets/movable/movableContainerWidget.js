
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
        'dojo/text!balek-client/session/workspace/container/widgets/movable/resources/html/movableContainer.html',
        'dojo/text!balek-client/session/workspace/container/widgets/movable/resources/css/movableContainer.css',
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
        return declare("balekWorkspaceContainerMovableWidget", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            _containedInterfaceHandle: null,
            _containerState: null,


            _containerOnMoved: null,
            templateString: template,
            _mainCssString: mainCss,
            _resizeHandleCssString: resizeHandleCSS,
            baseClass: "balekWorkspaceContainerMovableWidget",


            _topBarNode: null,
            _bottomBarNode: null,
            _contentNode: null,


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
            _onClick: function(event)
            {
                console.log("movableContainerWidget onClick",event );
                 //this.workspaceManagerCommands.activateContainerInWorkspace(this.workspaceManagerCommands.getActiveWorkspace(), this._containerKey);

            },
             _onPointerOver: function(event)
                {
                            console.log("movableContainerWidget onClick",event );

                            if(event.altKey)
                            {
                                     this.workspaceManagerCommands.activateContainerInWorkspace(this.workspaceManagerCommands.getActiveWorkspace(), this._containerKey);
                            }
               },

            postCreate: function () {

                if(this._containedInterfaceHandle != null && this._containedInterfaceHandle.getDomNode)
                {
                   domConstruct.place(this._containedInterfaceHandle.getDomNode(), this._contentNode);
                }else
                {
                                console.log("no getDomNode function for _containedInterfaceHandle");

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

                this._dnd = new Moveable(this.domNode);

                this._dnd.on("MoveStop", lang.hitch(this, this.onWidgetMoveStop));

                this._dnd.on("MoveStart", lang.hitch(this, this.onWidgetMoveStart));

                if(this._containerOnMoved !== null){
                 this._dnd.on("Move", this._containerOnMoved);
                }

            },
            makeClickMovable: function(){

            },
            removeClickMovable: function(){
            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
              onWidgetMoveStart: function (){
                     this.workspaceManagerCommands.activateContainerInWorkspace(this.workspaceManagerCommands.getActiveWorkspace(), this._containerKey);

               },
             onWidgetMoveStop: function (){
                this.updateMovableContainerElementBox()
             },
            onWidgetResizeStop: function (){
                this.updateMovableContainerElementBox();
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