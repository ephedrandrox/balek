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

            _containerName: "no name",

            _containerState: null,
            _containerStateWatchHandle: null,

            _workspaceContainableState: null,
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

                //todo find anywhere that overwrites _workspaceContainableState and what uses it - update, refactor



                this._container.getContainable().then(lang.hitch(this, function(containableInterface){
                    console.log("XXDD","containableInterface", containableInterface );


                    if(containableInterface &&  containableInterface.getComponentState)
                    {
                        containableInterface.getWorkspaceContainableState().then(lang.hitch(this, function(workspaceStateResult){
                            console.log("XXDD","onWorkspaceContainableStateUpdate", workspaceStateResult );

                            if (this._workspaceContainableState === null){
                                this._workspaceContainableState = workspaceStateResult;

                            }


                            if (this._workspaceContainableState !== null)
                            {

                                this._workspaceContainableStateWatchHandle = this._workspaceContainableState.watch(lang.hitch(this, this.onWorkspaceContainableStateUpdate));

                                let containerName = this._workspaceContainableState.get("containerName");


                                console.log("XXDD","onWorkspaceContainableStateUpdate",containerName, this._workspaceContainableState  );

                                debugger;
                                if(containerName)
                                {
                                    this._containerName = containerName;
                                }

                                this.refreshWidget();

                            }


                        })).catch(lang.hitch(this, function(errorResult){
                            console.log("error", errorResult);


                        }));
                    }else {
                        console.log("XXDD","NoContainable!", containableInterface, this );

                    }


                })).catch(function(errorResult){
                    console.log("XXDD","errorResult", errorResult );

                });






            },
            postCreate: function () {
                console.log("navigator", "on Containers main widget post create", this.domNode);


                this.refreshWidget();

            },
            onWorkspaceContainableStateUpdate: function(name, oldState,newState){
                console.log("XXDD","onWorkspaceContainableStateUpdate", name, oldState, newState )

                if(name.toString() === "containerName")
                {

                    if(this.domNode){
                        this.domNode.innerHTML = newState;

                    }
                }
            },

            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onContainerStateChange: function (name, oldState, newState) {
                console.log("XXDD","onContainerStateChange", name, oldState, newState, this._containerState )
                this.refreshWidget();
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

                    let name = "Container"

                    console.log("XXDD","refreshWidget", name, this._container );


                    if(this._workspaceContainableState)
                   {
                       name = this._workspaceContainableState.get("containerName");
                   }
                    if (this._container && this._container.isInActiveWorkspace()) {

                        this.domNode.innerHTML += "";
                        if (this._container.isDocked()) {
                            this.domNode.innerHTML = "🍟 "  +name ;
                        }else {
                            this.domNode.innerHTML += "not docked";

                        }
                    } else if (this._container && this._container.isInOverlayWorkspace()) {
                        this.domNode.innerHTML = "overlay";

                    } else {
                        this.domNode.innerHTML += "not active workspace";
                        this.domNode.innerHTML = "🍟 " + name;
                       // this.domNode.remove();
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