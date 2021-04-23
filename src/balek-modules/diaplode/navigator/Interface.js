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


          //  _navigatorSystemMenusState: null,


            _isVisible: true,


            constructor: function (args) {
                declare.safeMixin(this, args);


                this._commandsForOtherInterfaces = new navigatorInterfaceCommands();

               this._commandsForOtherInterfaces.setCommand("addSystemMenuList", lang.hitch(this, this.addSystemMenuList));

                this._commandsForOtherInterfaces.setCommand("toggleShowView", lang.hitch(this, this.toggleShowView));
                this._commandsForOtherInterfaces.setCommand("toggleWorkspaceShowView", lang.hitch(this, this.toggleWorkspaceShowView));
                this._commandsForOtherInterfaces.setCommand("toggleElementShowView", lang.hitch(this, this.toggleElementShowView))
                this._commandsForOtherInterfaces.setCommand("toggleContainerShowView", lang.hitch(this, this.toggleContainerShowView))

                this._commandsForOtherInterfaces.setNavigatorReady();


            },
            onInterfaceStateChange: function (name, oldState, newState) {
                //this has to be here so remoteCommander works
                this.inherited(arguments);

                if (name === "navigatorInstanceKeys") {
                    if(this._navigator === null)
                    {

                        this._navigator = new navigatorMainWidget({
                            _instanceKey: this._instanceKey,
                            _componentKey: newState.componentKey
                        });
                    }

                }

                if(name === "isVisible"){
                    console.log(oldState, newState);
                    this._isVisible = newState;
                    this.refreshView();
                }

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
            refreshView: function(){
                if(this._isVisible)
                {
                    this._navigator.show();

                }else
                {
                    this._navigator.hide();
                }
            },
            toggleShowView: function () {
                let isVisible = this._isVisible;
                this._isVisible = !isVisible;

                this.refreshView();

                this._instanceCommands.setVisibility(this._isVisible);
            },
            toggleWorkspaceShowView: function () {
                console.log("toggleWorkspaceShowView ");

                this._navigator.toggleWorkspaceShowView();
            },
            toggleElementShowView: function () {
                console.log("toggleElementShowView ");

                this._navigator.toggleElementShowView();
            },
            toggleContainerShowView: function () {
                console.log("toggleContainerShowView ");

                this._navigator.toggleContainerShowView();
            },
            unload: function () {

                this._navigator.unload();
            }
        });
    }
);



