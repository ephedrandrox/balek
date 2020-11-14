
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
        'dojo/text!balek-modules/diaplode/ui/containers/workspaceContainer/resources/html/workspaceContainer.html',
        'dojo/text!balek-modules/diaplode/ui/containers/workspaceContainer/resources/css/workspaceContainer.css',
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
        return declare("moduleDiaplodeUIContainerWorkspaceContainerWidget", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,

            templateString: template,
            _mainCssString: mainCss,
            _resizeHandleCssString: resizeHandleCSS,
            baseClass: "diaplodeUIContainerWorkspaceContainerWidget",


            _topBarNode: null,
            _bottomBarNode: null,
            _contentNode: null,

            _contentNodeToContain: null,

            _workspaceContainer: null,
            _dnd: null,
            _onMoveStop: null,
            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {
                declare.safeMixin(this, args);

                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());
                domConstruct.place(domConstruct.toDom("<style>" + this._resizeHandleCssString + "</style>"), win.body());

            },
            postCreate: function () {

                if(this._contentNodeToContain != null)
                {
                   domConstruct.place(this._contentNodeToContain, this._contentNode);

                }
                topic.publish("addToMainContentLayerAlwaysOnTop", this.domNode);

                this._dnd = new Moveable(this.domNode, {handle: this._topBarNode});

                var handle = new ResizeHandle({
                    targetContainer: this.domNode
                }).placeAt(this._bottomBarNode);

                if(this._onMoveStop != null && this._workspaceContainer != null){
                    this._dnd.on("MoveStop", this._onMoveStop);
                }

            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################
            //no UI Functions
            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################
            unload: function () {
                this.inherited(arguments);
                this.destroy();
            }
        });
    });