define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",

        'dojo/on',
        "dojo/dom-attr",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/session/menu/Interface/workspaces/resources/html/workspaces.html',
        'dojo/text!balek-modules/session/menu/Interface/workspaces/resources/css/workspaces.css',

        'balek-modules/session/menu/Interface/workspaces/workspaceListItem',

        'balek-client/session/workspace/workspaceManagerInterfaceCommands'

    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, _WidgetBase, _TemplatedMixin, template, templateCSS, workspaceListItem, balekWorkspaceManagerInterfaceCommands) {
        return declare("moduleSessionMenuInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "sessionWorkspaces",

            workspaceManagerCommands: null,

            _availableWorkspacesState: null,
            _availableWorkspacesStateWatchHandle: null,

            _workspaceListItems: null,

           // _workspaceStore: null,

            constructor: function (args) {

                declare.safeMixin(this, args);
                this._workspaceListItems = {};

                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();

                this._availableWorkspacesState = this.workspaceManagerCommands.getAvailableWorkspacesState();
                this._workspaceManagerState = this.workspaceManagerCommands.getWorkspaceManagerState();


                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());


            },
            postCreate: function(){
                let availableWorkspacesInState = JSON.parse(JSON.stringify(this._availableWorkspacesState));
                this._availableWorkspacesStateWatchHandle = this._availableWorkspacesState.watch(lang.hitch(this, this.onAvailableWorkspacesStateChange));
                for (const name in availableWorkspacesInState)
                {
                    console.log(name, availableWorkspacesInState[name]);
                    this.addOrRefreshAvailableWorkspace(availableWorkspacesInState[name]);
                }
            },
            _onAddWorkspaceButtonClick: function () {
                this.requestNewWorkspace();
            },
            requestNewWorkspace: function () {
                console.log("Requesting new workspace");
                //topic.publish("requestNewWorkspace");
                console.log( this.workspaceManagerCommands);
                this.workspaceManagerCommands.requestNewWorkspace();
            },
            addOrRefreshAvailableWorkspace: function(workspaceInfo){
                let workspaceKey = workspaceInfo.workspaceKey;
                let workspaceName = workspaceInfo.workspaceName;
                let activeWorkspace = this._workspaceManagerState.get("activeWorkspace");


                if (this._workspaceListItems[workspaceKey] === undefined) {
                    this._workspaceListItems[workspaceKey] = new workspaceListItem({
                        _instanceKey: this._instanceKey,
                        workspaceManagerCommands: this.workspaceManagerCommands,
                        _workspaceKey: workspaceKey,
                        _workspaceName: workspaceName,
                        _activeWorkspace: activeWorkspace
                    });
                    domConstruct.place(this._workspaceListItems[workspaceKey].domNode, this._workspaceListDiv)
                }
                /*else {
                    this._workspaceListItems[workspaceKey].refreshView({
                        _workspaceName: workspaceName,
                        _activeWorkspace: activeWorkspace
                    });
                }*/


            },
            onAvailableWorkspacesStateChange: function(name, oldState, newState){
            //       console.log(name, oldState, newState);
                this.addOrRefreshAvailableWorkspace(newState);
            },
            unload: function () {
                this._availableWorkspacesStateWatchHandle.unwatch();

                for (const workspaceKey in this._workspaceListItems) {
                    this._workspaceListItems[workspaceKey].unload();
                    this._workspaceListItems[workspaceKey].destroy();
                    delete this._workspaceListItems[workspaceKey];
                }
                this.destroy();
            }
        });
    });