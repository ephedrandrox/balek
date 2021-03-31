define(['dojo/_base/declare',
        'dojo/_base/lang',

        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/on',
        "dojo/dom-class",
        "dojo/dom-attr",
        "dojo/dom-style",
        "dojo/keys",
        "dijit/focus",
        "dojo/ready",
        'dojo/_base/fx',

        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/diaplode/navigator/Interface/menus/containersMenu/resources/html/containerMenuItem.html',
        'dojo/text!balek-modules/diaplode/navigator/Interface/menus/containersMenu/resources/css/containerMenuItem.css',

        "balek-modules/diaplode/navigator/Interface/menus/containersMenu",
        //Diaplode ui components
        "balek-modules/diaplode/ui/input/getUserInput",

        'balek-modules/Interface'


    ],
    function (declare, lang,
              domConstruct, win, on, domClass, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx, _WidgetBase, _TemplatedMixin, template,
              mainCss, getUserInput,
              baseInterface) {

        return declare("diaplodeNavigatorInterfaceContainersMenuItemWidget", [_WidgetBase, _TemplatedMixin, baseInterface], {

            templateString: template,
            baseClass: "diaplodeNavigatorInterfaceContainersMenuItemWidget",


            _containerState: null,
            _containerStateWatchHandle: null,

            _mainCssString: mainCss,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                this._containerWatchHandles = {};
                console.log("navigator", "on Containers main widget constructor", this.baseClass);

                domConstruct.place(domConstruct.toDom("<style>" + mainCss + "</style>"), win.body());

                if (this._container && typeof this._container.getState === "function") {
                    this._containerState = this._container.getState();
                    this._containerStateWatchHandle = this._containerState.watch(lang.hitch(this, this.onContainerStateChange));
                }

            },
            postCreate: function () {
                console.log("navigator", "on Containers main widget post create", this.domNode);
                this.refreshWidget();

            },


            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onContainerStateChange: function (name, oldState, newState) {
                 this.refreshWidget()
            },

            _onClick: function () {

                this.onContainerMenuClick();

            },
            onContainerMenuClick: function (containerKey) {
                let container = this._container;
                console.log("container", container);

                if (container) {
                    container.setDocked(false);
                }
            },
            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################
            refreshWidget: function () {
                if (this.domNode) {
                    this.domNode.innerHTML = "";

                    if (this._container.isInActiveWorkspace()) {

                        this.domNode.innerHTML += "";
                        if (this._container.isDocked()) {
                            this.domNode.innerHTML = "docked";
                        }
                    } else if (this._container.isInOverlayWorkspace()) {
                        this.domNode.innerHTML = "";
                    } else {
                        this.domNode.innerHTML += "";
                    }
                }

            },


            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################

            unload: function () {
                console.log("Destroying menu");
                this.inherited(arguments);
                this.destroy();
            }

        });
    });