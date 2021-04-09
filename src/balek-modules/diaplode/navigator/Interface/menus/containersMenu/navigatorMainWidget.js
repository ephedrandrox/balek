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

        'dojo/text!balek-modules/diaplode/navigator/Interface/menus/containersMenu/resources/html/navigatorMainWidget.html',
        'dojo/text!balek-modules/diaplode/navigator/Interface/menus/containersMenu/resources/css/navigatorMainWidget.css',

        "balek-modules/diaplode/navigator/Interface/menus/containersMenu",
        "balek-modules/diaplode/navigator/Interface/menus/containersMenu/containerMenuItem",

        //Diaplode ui components
        "balek-modules/diaplode/ui/input/getUserInput",

        'balek-modules/Interface'


    ],
    function (declare, lang,
              domConstruct, win, on, domClass, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx, _WidgetBase, _TemplatedMixin, template,
              mainCss, containersMenu, containerMenuItem, getUserInput,
              baseInterface) {

        return declare("diaplodeNavigatorInterfaceContainersMenuNavigatorMainWidget", [_WidgetBase, _TemplatedMixin, containersMenu, baseInterface], {

            templateString: template,
            baseClass: "diaplodeNavigatorInterfaceContainersMenuNavigatorMainWidget",

            _containerWidgets: null,

            _mainCssString: mainCss,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                this._containerWidgets = {};
                console.log("navigator", "on Containers main widget constructor", this.baseClass);

                domConstruct.place(domConstruct.toDom("<style>" + mainCss + "</style>"), win.body());

            },
            postCreate: function () {
                console.log("navigator", "on Containers main widget post create", this.domNode);
                this.loadAndWatchContainers();

            },

            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            _onClick: function () {
                console.log("navigator", "on containers main widget click");

            },
            onContainerMenuClick: function (containerKey) {
                let container = this._containers[containerKey];
                console.log("container", container);

                if (container) {
                    container.setDocked(false);
                }
            },
            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################
            refreshWidget: function () {
                console.log("AAA", "on workspaces main widget refresh");

                console.log("AAA", "refreshing from menu", this.domNode, this._containers);
                if (this.domNode) {

                    this.domNode.innerHTML = "🍟"
                    for (const containerKey in this._containers) {

                        //todo this should be  a state watch thing to add widgets
                        // let containerState = this._containers[containerKey].getState();

                        let container = this._containers[containerKey];
                        if (container && container !== "gone" && typeof container.getState === "function") {

                            if (this._containerWidgets[containerKey] === undefined) {
                                console.log("AAA", "container being created", containerKey);

                                this._containerWidgets[containerKey] = new containerMenuItem({_container: container , _containerMenu: this});



                                // this.domNode.innerHTML= "hi";

                            } else {

                                //check if in domnode
                            }



                            if (this._containerWidgets[containerKey].domNode) {

                                if (this._containerWidgets[containerKey]._container.isInActiveWorkspace()) {

                                    if (this._containerWidgets[containerKey]._container.isDocked()) {
                                        domConstruct.place(this._containerWidgets[containerKey].domNode, this.domNode);
                                        this._containerWidgets[containerKey].refreshWidget();
                                    }
                                } else if (this._containerWidgets[containerKey]._container.isInOverlayWorkspace()) {
                                    //dont add anywhere yet
                                } else {
                                    // not in active workspace dont add anywhere yet
                                }
                            }


                        } else {
                            console.log("AAA", "container gone", containerKey);
                        }
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