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

        'balek-modules/Interface'


    ],
    function (declare, lang,
              domConstruct, win, on, domClass, domAttr, domStyle, dojoKeys,
              dijitFocus, dojoReady, fx,  _WidgetBase, _TemplatedMixin, template,
              mainCss, workspacesMenu, getUserInput,
 baseInterface) {

        return declare("diaplodeNavigatorInterfaceWorkspacesMenuNavigatorMainWidget", [_WidgetBase, _TemplatedMixin, workspacesMenu, baseInterface], {

            templateString: template,
            baseClass: "diaplodeNavigatorInterfaceWorkspacesMenuNavigatorMainWidget",




            _mainCssString: mainCss,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {

                console.log("navigator", "on workspaces main widget constructor", this.baseClass);

                domConstruct.place(domConstruct.toDom("<style>" + mainCss + "</style>"), win.body());

            },
            postCreate: function()
            {
                console.log("navigator", "on workspaces main widget post create", this.domNode);
                this.loadAndWatchWorkspaces();

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
                    newWorkspaceButton.innerHTML = "❖"
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
                        domClass.add(newWorkspaceInfo, "diaplodeNavigatorInterfaceWorkspacesMenuNavigatorMainWidgetWorkspaceNameDiv");
                        on(newWorkspaceInfo, 'click', lang.hitch(this, this.onWorkspaceMenuClick , workspaceKey,  this.workspaceManagerCommands.changeActiveWorkspace));

                        domConstruct.place(newWorkspaceInfo, this.domNode);

                        // this._mainWorkspacesDiv.innerHTML += workspaceState.workspaceName + "<br>";
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