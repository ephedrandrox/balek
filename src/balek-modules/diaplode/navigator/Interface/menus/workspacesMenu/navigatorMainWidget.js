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

        'dojo/text!balek-modules/diaplode/navigator/Interface/menus/workspacesMenu/resources/html/navigatorMainWidget.html',
        'dojo/text!balek-modules/diaplode/navigator/Interface/menus/workspacesMenu/resources/css/navigatorMainWidget.css',

        "balek-modules/diaplode/navigator/Interface/menus/workspacesMenu",
        //Diaplode ui components
        "balek-modules/diaplode/ui/input/getUserInput",

        'balek-client/session/workspace/workspaceManagerInterfaceCommands',

        //Balek Interface Includes
        'balek-modules/components/syncedCommander/Interface',
        'balek-client/session/workspace/container/containable'



    ],
    function (declare, lang,
              domConstruct, win, on, domClass, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx,  _WidgetBase, _TemplatedMixin, template,
              mainCss, workspacesMenu, getUserInput,
              balekWorkspaceManagerInterfaceCommands,

              _syncedCommanderInterface,
              _balekWorkspaceContainerContainable) {

        return declare("diaplodeNavigatorInterfaceWorkspacesMenuNavigatorMainWidget", [ _WidgetBase, _TemplatedMixin,_syncedCommanderInterface, workspacesMenu, _balekWorkspaceContainerContainable  ], {

            templateString: template,
            baseClass: "diaplodeNavigatorInterfaceWorkspacesMenuNavigatorMainWidget",


            workspaceManagerCommands: null,


            _mainCssString: mainCss,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {
                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();


                console.log("navigator", "on workspaces main widget constructor", this.baseClass);

                domConstruct.place(domConstruct.toDom("<style>" + mainCss + "</style>"), win.body());


            },
            postCreate: function()
            {
                console.log("navigator", "on workspaces main widget post create", this.domNode);

                this.putInWorkspaceOverlayContainer();

                this.loadAndWatchWorkspaces();

            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommands and link them
                console.log("ZZXX", name, newState);
                this.inherited(arguments);



            },

            putInWorkspaceOverlayContainer: function(){
                console.log("ZZXX", this);

                this.initializeContainable();
                console.log("ZZXX", this);

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

            _onClick: function(){
                console.log("navigator", "on workspaces main widget click");

            },
            onWorkspaceMenuClick: function (workspaceKey, changeActiveWorkspace, event) {
                event.stopPropagation();
                console.log(event);
                if(event.altKey){
                    let getNameForWorkspace = new getUserInput({question: "Choose a Workspace Name", inputReplyCallback: lang.hitch(this, function(newWorkspaceName){
                            console.log("Requesting new workspace name", newWorkspaceName, this.workspaceManagerCommands);
                            this.workspaceManagerCommands.changeWorkspaceName(workspaceKey, newWorkspaceName, function(result){
                                console.log("navigator", "Workspace name changed", result);
                            });
                            getNameForWorkspace.unload();
                        }) });
                }else
                {
                    changeActiveWorkspace(workspaceKey, function(result){
                        console.log("navigator", result);
                    });
                }

            },
            onAddWorkspaceClicked: function (event){
                console.log(event);
                let getNameForWorkspace = new getUserInput({question: "Choose a Workspace Name", inputReplyCallback: lang.hitch(this, function(newWorkspaceName){
                        console.log("Requesting new Workspace", newWorkspaceName, this.workspaceManagerCommands);
                        this.workspaceManagerCommands.requestNewWorkspace(newWorkspaceName).then(function(result){
                            console.log("navigator", "New Workspace create", result);
                        }).catch(function(errorResult){
                            alert(errorResult);
                        });
                        getNameForWorkspace.unload();
                    }) });

            },
            //##########################################################################################################
            //UI Functions Section
            //##########################################################################################################
            refreshWidget: function(){
                console.log("navigator", "on workspaces main widget refresh");

                console.log("navigator", "refreshing from menu", this.domNode);
                if(this.domNode){
                    this.domNode.innerHTML = "";

                    let newWorkspaceButton = domConstruct.create("div");
                    newWorkspaceButton.setAttribute("title", "New Workspace");
                    newWorkspaceButton.setAttribute("id", "addWorkspaceCommand");

                    newWorkspaceButton.innerHTML = "New ❖"
                    domClass.add(newWorkspaceButton, "diaplodeNavigatorInterfaceWorkspacesMenuNavigatorMainWidgetAddCommandDiv");

                    on(newWorkspaceButton, 'click', lang.hitch(this, function (evt) {
                        console.log("navigator", "new workspace clicked");

                        evt.stopPropagation();
                        this.onAddWorkspaceClicked();
                    }));

                    domConstruct.place(newWorkspaceButton, this.domNode);

                    for( const workspaceKey in this._navigatorWorkspaceMenuWidgets )
                    {
                        let workspaceState = this._navigatorWorkspaceMenuWidgets[workspaceKey];

                        let newWorkspaceInfo = domConstruct.create("div");

                        newWorkspaceInfo.innerHTML = "❖ - " + workspaceState.workspaceName;

                        newWorkspaceInfo.setAttribute("title", "Switch to " +workspaceState.workspaceName + " workspace \n(Opt + Click) to rename");

                        domClass.add(newWorkspaceInfo, "diaplodeNavigatorInterfaceWorkspacesMenuNavigatorMainWidgetWorkspaceNameDiv");


                        if(this.isActiveWorkspace && this.isActiveWorkspace(workspaceKey)){
                            domClass.add(newWorkspaceInfo, "diaplodeNavigatorInterfaceWorkspacesMenuNavigatorMainWidgetWorkspaceNameDivActive");
                        }else {
                            domClass.remove(newWorkspaceInfo, "diaplodeNavigatorInterfaceWorkspacesMenuNavigatorMainWidgetWorkspaceNameDivActive");
                        }


                        on(newWorkspaceInfo, 'click', lang.hitch(this, this.onWorkspaceMenuClick , workspaceKey,  this.workspaceManagerCommands.changeActiveWorkspace));

                        domConstruct.place(newWorkspaceInfo, this.domNode);

                        // this._mainWorkspacesDiv.innerHTML += workspaceState.workspaceName + "<br>";
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