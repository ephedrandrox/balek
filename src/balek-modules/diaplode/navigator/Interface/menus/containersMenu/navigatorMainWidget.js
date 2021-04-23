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
        'balek-client/session/workspace/workspaceManagerInterfaceCommands',

        //Balek Interface Includes
        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable'

    ],
    function (declare, lang,
              domConstruct, win, on, domClass, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx, _WidgetBase, _TemplatedMixin, template,
              mainCss, containersMenu, containerMenuItem, getUserInput,balekWorkspaceManagerInterfaceCommands,
              _syncedCommanderInterface,
              _balekWorkspaceContainerContainable) {

        return declare("diaplodeNavigatorInterfaceContainersMenuNavigatorMainWidget", [_syncedCommanderInterface,containersMenu, _WidgetBase, _TemplatedMixin, _balekWorkspaceContainerContainable], {

            templateString: template,
            baseClass: "diaplodeNavigatorInterfaceContainersMenuNavigatorMainWidget",

            _containerWidgets: null,


            workspaceManagerCommands: null,

            _mainCssString: mainCss,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                this._containerWidgets = {};

                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();

                console.log("navigator", "on Containers main widget constructor", this.baseClass);

                domConstruct.place(domConstruct.toDom("<style>" + mainCss + "</style>"), win.body());

            },
            postCreate: function () {
                console.log("navigator", "on Containers main widget post create", this.domNode);
                console.log("ZZXXContainer", this);

                this.putInWorkspaceOverlayContainer();
                console.log("ZZXXContainer", this);

                this.loadAndWatchContainers();

            },
            putInWorkspaceOverlayContainer: function(){
                console.log("ZZXXContainer", "putInWorkspaceOverlayContainer", this);

                this.initializeContainable();
                console.log("ZZXXContainer","putInWorkspaceOverlayContainer", this);

                this.getContainerKeys().then(lang.hitch(this, function(containerKeys) {
                    //this waits until the containable has component state for container Keys
                    //               console.log(containerKeys, typeof containerKeys );
                    console.log("ZZXX", containerKeys);

                    if (Array.isArray(containerKeys) && containerKeys.length === 0) {
                        //the containable has not been added to a container
                        //adding it to the workspace puts it in a
                        // console.log("users", containerKeys);

                        let workspaceContainerWidgetPath = "balek-client/session/workspace/container/widgets/movable/movableContainerWidget";
                        let activeOverlayWorkspaceKey = this.workspaceManagerCommands.getActiveOverlayWorkspace().getWorkspaceKey();
                        console.log("ZZXX", activeOverlayWorkspaceKey);



                        this.workspaceManagerCommands.addToWorkspaceContainer(this, workspaceContainerWidgetPath)
                            .then(lang.hitch(this, function (workspaceContainerKey) {
                                console.log("ZZXX", "gotWorkspaceContainerKey", workspaceContainerKey);

                                // this.connectContainer(workspaceContainerKey);

                                this.workspaceManagerCommands.addContainerToWorkspace(workspaceContainerKey, activeOverlayWorkspaceKey)
                                    .then(lang.hitch(this, function (addContainerToWorkspaceResponse) {
                                        console.log("ZZXX","Container added to workspace", addContainerToWorkspaceResponse);
                                    }))
                                    .catch(lang.hitch(this, function (error) {
                                        console.log( "ZZXX","Error adding container to workspace", error);
                                    }));
                            })).catch(lang.hitch(this, function (error) {
                            console.log("ZZXX", "workspaces container error", error);
                        }));

                    } else {
                        //component containable is already in a container
                        this.connectContainer(containerKeys);
                        console.log("ZZXX","already in a container", containerKeys);
                    }
                })).catch(lang.hitch(this, function (error) {
                    console.log( "systemMenu","getting container keys error", error);
                }));

            },
            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################

            _onClick: function () {
                console.log("navigator", "on containers main widget click");

            }, onInterfaceStateChange: function (name, oldState, newState) {
                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommands and link them
                console.log("ZZXX", name, newState);
                this.inherited(arguments);



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
            //Workspace Container Functions Section
            //##########################################################################################################

            getDomNode: function()
            {
                return this.domNode;
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