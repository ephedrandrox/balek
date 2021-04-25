//Navigator Interface Class
define([
        //Dojo Includes
        'dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        //Balek Command Includes
        'balek-client/session/workspace/workspaceManagerInterfaceCommands',
        //Diaplode Includes
        "balek-modules/diaplode/navigator/Interface/menus/workspacesMenu/navigatorMainWidget",//todo make this like elementMenu Structure
        "balek-modules/diaplode/navigator/Interface/menus/containersMenu/navigatorMainWidget",//todo make this like elementMenu Structure
        "balek-modules/diaplode/navigator/Interface/menus/elementsMenu",
        "balek-modules/diaplode/navigator/Interface/menus/customMenu",

        //Balek Class Extensions
        'balek-modules/components/syncedCommander/Interface'
    ],
    function (
              //Dojo Includes
              declare,
              lang,
              topic,
              //Balek Command Includes
              balekWorkspaceManagerInterfaceCommands,
              //Diaplode Includes
              workspacesMenu,
              containersMenu,
              elementsMenu,
              customMenu,
              //Balek Class Extensions
              _syncedCommanderInterface) {

        return declare("moduleDiaplodeNavigatorInterface", [ _syncedCommanderInterface], {

            _isVisible: false,

            _instanceKey: null,

            baseClass: "diaplodeNavigatorInterface",


             _elementMenu: null,
             _containerMenu: null,
             _workspaceMenu: null,
            _customMenu: null,

            //##########################################################################################################
            //Startup Functions Section
            //##########################################################################################################

            constructor: function (args) {
                declare.safeMixin(this, args);

            },

            //##########################################################################################################
            //Event Functions Section
            //##########################################################################################################
            onRemoteCommandsInitiated: function(){
               // console.log("navigator" , this._instanceCommands);

            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //Since We are extending with the remoteCommander
                //We Check for interfaceRemoteCommands and link them

                this.inherited(arguments);

                if (name.toString() === "workspaceMenuKey" && this._workspaceMenu === null) {
                    console.log("ZZXX", name, newState);

                    this._workspaceMenu = new workspacesMenu({_navigatorInterface: this,
                        _componentKey: newState.toString(),
                        _sessionKey: this._sessionKey,
                        _instanceKey: this._instanceKey});
                }


                if (name.toString() === "containerMenuKey" && this._containerMenu === null) {
                    console.log("ZZXX", name, newState);

                    this._containerMenu = new containersMenu({_navigatorInterface: this,
                        _componentKey: newState.toString(),
                        _sessionKey: this._sessionKey,
                        _instanceKey: this._instanceKey});
                }

                if (name.toString() === "elementMenuKey" && this._elementMenu === null) {
                    console.log("ZZXXELEMENTS", name, newState);

                    this._elementMenu = new elementsMenu({_navigatorInterface: this,
                        _componentKey: newState.toString(),
                        _sessionKey: this._sessionKey,
                        _instanceKey: this._instanceKey});

                    console.log("ZZXXELEMENTS", this._elementMenu);

                }

                if (name.toString() === "customMenuKey" && this._customMenu === null) {
                    console.log("ZZXXcustomMenuKey", name, newState);

                    this._customMenu = new customMenu({_navigatorInterface: this,
                        _componentKey: newState.toString(),
                        _sessionKey: this._sessionKey,
                        _instanceKey: this._instanceKey});

                    console.log("ZZXXcustomMenuKey", this._customMenu);

                }
            },

            //##########################################################################################################
            //Interface Functions Section
            //##########################################################################################################
            toggleWorkspaceShowView: function () {
                console.log("toggleWorkspaceShowView ");

                this._workspaceMenu.toggleShowView();
            },
            toggleElementShowView: function () {
                console.log("toggleElementShowView ");

                this._elementMenu.toggleShowView();
            },
            toggleContainerShowView: function () {
                console.log("toggleContainerShowView ");

                this._containerMenu.toggleShowView();
            },
            refreshView: function(){
                this._elementMenu.refreshView();

                this._containerMenu.refreshView();
                this._workspaceMenu.refreshView();
            },
            show: function(){
                console.log("QQAA", "show");
                this._isVisible = true;
                this.refreshView();
            },
            hide: function(){
                console.log("QQAA", "hide");
                this._isVisible = false;
                this.refreshView();

            },
            isVisible: function(){
                return this._isVisible;
            },
            unload: function() {

                this._elementMenu.unload();
                    this._containerMenu.unload();
                    this._workspaceMenu.unload();

                console.log("destroying navigator");
                this.inherited(arguments);
                this.destroy();
            }
        });
    });