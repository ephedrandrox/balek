
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
        'dojo/text!balek-client/session/workspace/container/widgets/static/resources/html/staticContainer.html',
        'dojo/text!balek-client/session/workspace/container/widgets/static/resources/css/staticContainer.css',


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
              mainCss
              ) {
        return declare("balekWorkspaceContainerStaticWidget", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            _containedInterfaceHandle: null,
            _containerState: null,

            templateString: template,
            _mainCssString: mainCss,
            baseClass: "balekWorkspaceContainerStaticWidget",

            _contentNode: null,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("Initializing Balek Workspace Manager Container Manager Static Widget...");
                domConstruct.place(domConstruct.toDom("<style>" + this._mainCssString + "</style>"), win.body());

            },
            postCreate: function () {
                if(this._containedInterfaceHandle != null && this._containedInterfaceHandle.getDomNode)
                {
                   domConstruct.place(this._containedInterfaceHandle.getDomNode(), this._contentNode);
                }else
                {
                    console.log("no getDomNode function for _containedInterfaceHandle");
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
            },
            toggleShowView: function () {
                let currentStateToggle = {"visible": "hidden", "hidden": "visible"};
                domStyle.set(this.domNode, {"visibility": currentStateToggle[domStyle.get(this.domNode, "visibility")]});
            }
        });
    });