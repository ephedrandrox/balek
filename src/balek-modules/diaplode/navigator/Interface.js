define(['dojo/_base/declare',
        'dojo/_base/lang',

        'balek-modules/Interface',

        'dojo/topic',
        "dojo/dom-construct",
        "dojo/dom-style",
        "dojo/_base/window",

        'dojo/Stateful',


        'balek-modules/diaplode/navigator/interfaceCommands',

        'balek-modules/diaplode/navigator/Interface/navigator',


//Balek Interface Extensions
        'balek-modules/components/syncedCommander/Interface'

    ],
    function (declare,
              lang,
              baseInterface,
              topic,
              domConstruct,
              domStyle,
              win,
              Stateful,
              navigatorInterfaceCommands,
              navigatorMainWidget,
              _syncedCommanderInterface) {

        return declare("moduleDiaplodeNavigatorModuleInterface", _syncedCommanderInterface, {
            _instanceKey: null,
            _navigator: null,

            _overlayViewState: null,

          //  _navigatorSystemMenusState: null,


            _isVisible: true,


            constructor: function (args) {
                declare.safeMixin(this, args);


                let overlayViewState = declare([Stateful], {
                });
                this._overlayViewState = new overlayViewState({
                    isVisible: false
                });

                this._commandsForOtherInterfaces = new navigatorInterfaceCommands();

                this._commandsForOtherInterfaces.setCommand("addSystemMenuList", lang.hitch(this, this.addSystemMenuList));

                this._commandsForOtherInterfaces.setCommand("toggleShowView", lang.hitch(this, this.toggleShowView));
                this._commandsForOtherInterfaces.setCommand("toggleWorkspaceShowView", lang.hitch(this, this.toggleWorkspaceShowView));
                this._commandsForOtherInterfaces.setCommand("toggleElementShowView", lang.hitch(this, this.toggleElementShowView))
                this._commandsForOtherInterfaces.setCommand("toggleContainerShowView", lang.hitch(this, this.toggleContainerShowView))
                this._commandsForOtherInterfaces.setCommand("getOverlayViewState", lang.hitch(this, this.getOverlayViewState))

                this._commandsForOtherInterfaces.setNavigatorReady();



            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to be here so remoteCommander works
                this.inherited(arguments);

                if (name === "navigatorInstanceKeys") {
                    if(this._navigator === null)
                    {

                        this._commandsForOtherInterfaces.getCommands().then(lang.hitch(this, function(navigatorCommands){
                            this._navigator = new navigatorMainWidget({
                                _navigatorCommands: navigatorCommands,
                                _instanceKey: this._instanceKey,
                                _componentKey: newState.componentKey
                            });
                        })).catch(function(errorResult){
                            console.log("Could not get navigator commands", errorResult);
                        });

                    }

                }

                if(name === "isVisible"){
                    console.log(oldState, newState);
                    let currentViewState = this._overlayViewState.get("isVisible");
                    if(currentViewState !== newState)
                    {
                        this._overlayViewState.set("isVisible", newState);
                    }
                }

                if(name === "elementMenuIsVisible"){
                    console.log(oldState, newState);
                    let currentViewState = this._overlayViewState.get("elementMenuIsVisible");
                    if(currentViewState !== newState)
                    {
                        this._overlayViewState.set("elementMenuIsVisible", newState);
                    }
                }
                if(name === "workspaceMenuIsVisible"){
                    console.log(oldState, newState);
                    let currentViewState = this._overlayViewState.get("workspaceMenuIsVisible");
                    if(currentViewState !== newState)
                    {
                        this._overlayViewState.set("workspaceMenuIsVisible", newState);
                    }
                }
                if(name === "containerMenuIsVisible"){
                    console.log(oldState, newState);
                    let currentViewState = this._overlayViewState.get("containerMenuIsVisible");
                    if(currentViewState !== newState)
                    {
                        this._overlayViewState.set("containerMenuIsVisible", newState);
                    }
                }
            },
            getOverlayViewState: function(){
                return  this._overlayViewState;
            },
            addSystemMenuList:function( syncedMap, menuCompanion){
                //todo remove this after making elements store for interfaces
                let loopUntil =  function(){
                    if(this._navigator && this._navigator._elementMenu ){
                        this._navigator._elementMenu.newMenu(syncedMap, menuCompanion);
                    }else {
                        setTimeout(lang.hitch(this, loopUntil), 500);
                    }
                };

                lang.hitch(this, loopUntil)();

            },
            receiveMessage: function (moduleMessage) {
                console.log("You shouldn't be seeing this", moduleMessage);
            },
            toggleShowView: function () {
                let currentViewState = this._overlayViewState.get("isVisible");
                this._overlayViewState.set("isVisible", !currentViewState);
                this._instanceCommands.setVisibility(!currentViewState);
            },
            toggleWorkspaceShowView: function () {
                console.log("toggleWorkspaceShowView ");
                let currentViewState = this._overlayViewState.get("workspaceMenuIsVisible");
                this._overlayViewState.set("workspaceMenuIsVisible", !currentViewState);
                this._instanceCommands.setWorkspaceMenuVisibility(!currentViewState);
            },
            toggleElementShowView: function () {
                console.log("toggleElementShowView ");

                let currentViewState = this._overlayViewState.get("elementMenuIsVisible");
                this._overlayViewState.set("elementMenuIsVisible", !currentViewState);
                this._instanceCommands.setElementMenuVisibility(!currentViewState);
            },
            toggleContainerShowView: function () {
                console.log("toggleContainerShowView ");
                let currentViewState = this._overlayViewState.get("containerMenuIsVisible");
                this._overlayViewState.set("containerMenuIsVisible", !currentViewState);
                this._instanceCommands.setContainerMenuVisibility(!currentViewState);
            },
            unload: function () {

                this._navigator.unload();
            }
        });
    }
);



