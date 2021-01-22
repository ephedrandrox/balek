define([ 	'dojo/_base/declare',
        "dojo/_base/lang",

        'dojo/dom-class',
        'dojo/dom-construct',
        'dojo/on',



        "balek-modules/diaplode/navigator/Interface/menus/workspacesMenu/navigatorMainWidget",
        'balek-client/session/workspace/workspaceManagerInterfaceCommands',

    ],
    function (declare, lang,  domClass,
              domConstruct,
              on, navigatorMainWidget,  balekWorkspaceManagerInterfaceCommands ) {

        return declare( "diaplodeNavigatorInterfaceWorkspacesMenu",null, {
             _actions: null,

            _navigatorWorkspaceMenuWidgets:null,

            workspaceManagerCommands: null,
            _availableWorkspacesState: null,
            _availableWorkspacesStateWatchHandle: null,
            _workspaceManagerState: null,

            _targetNode: null,

            _navigatorMainWidget: null,

            constructor: function (args) {


                declare.safeMixin(this, args);

                this._navigatorWorkspaceMenuWidgets = {};
                console.log("Initializing Diaplode Navigator Interface Workspaces Menu...");



                let workspaceManagerInterfaceCommands = new balekWorkspaceManagerInterfaceCommands();
                this.workspaceManagerCommands = workspaceManagerInterfaceCommands.getCommands();

                this._availableWorkspacesState = this.workspaceManagerCommands.getAvailableWorkspacesState();
                this._workspaceManagerState = this.workspaceManagerCommands.getWorkspaceManagerState();


            },
            onAvailableWorkspacesStateChange: function(name, oldState, newState){
                console.log("navigator", name, oldState, newState);
                //let workspaceName = newState.workspaceName;
                let workspaceKey = name.toString();
                if(this._navigatorWorkspaceMenuWidgets[workspaceKey] === undefined){
                    this._navigatorWorkspaceMenuWidgets[workspaceKey] = newState;
                }else
                {
                    this._navigatorWorkspaceMenuWidgets[workspaceKey] = newState;
                }

                this.refreshWidget();
            },
            loadAndWatchWorkspaces: function(){
                let availableWorkspacesInState = JSON.parse(JSON.stringify(this._availableWorkspacesState));
                this._availableWorkspacesStateWatchHandle = this._availableWorkspacesState.watch(lang.hitch(this, this.onAvailableWorkspacesStateChange));
                for (const name in availableWorkspacesInState)
                {
                    console.log("navigator", name, availableWorkspacesInState[name]);
                    this._navigatorWorkspaceMenuWidgets[name.toString()] =  availableWorkspacesInState[name];
                }

                this.refreshWidget();
            },

            refreshWidget: function(){

            }

        });
    });