define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'dojo/dom-class',
        'dojo/dom-construct',
        'dojo/dom-geometry',
        "dojo/_base/window",

        'dojo/on',
        "dojo/dom-attr",
        "dojo/dom-style",
        "dojo/keys",
        "dijit/focus",
        "dojo/ready",
        'dojo/_base/fx',


        'balek-modules/diaplode/ui/containers/workspaceContainer/workspaceContainerWidget',


    ],
    function (declare,
              lang,
              topic,

              domClass,
              domConstruct,
              domGeometry,
              win,

              on,
              domAttr,
              domStyle,
              dojoKeys,
              dijitFocus,
              dojoReady,
              fx,
              workspaceContainerWidget
    ) {

        return declare("diaplodeUIContainerWorkspaceContainer", null, {

            _diaplodeWorkspaceContainerState: null,

            _workspaceContainerWidget: null,


            constructor: function (args) {

                declare.safeMixin(this, args);
                if(this._componentKey){

                    console.log("Component Key!", this._componentKey);

                    this.getComponentState("diaplodeWorkspaceContainer").then(lang.hitch(this, function(stateResult){
                        this._diaplodeWorkspaceContainerState = stateResult;
                        this._diaplodeWorkspaceContainerState.watch(lang.hitch(this, this.onStateReceived));
                        //set and watch the state
                        console.log(this._diaplodeWorkspaceContainerState);
                    })).catch(lang.hitch(this, function(errorResult){
                        console.log(this._diaplodeWorkspaceContainerState);
                    }));

                }else {
                    console.log("No Component Key!");
                }

            },
            onStateReceived: function(name, oldState, newState)
            {
                console.log("COmponent State Received!");

                console.log(name, oldState, newState);
                if(name === 'elementBox' && oldState === undefined){
                    this.updateWidgetWithElementBox(newState);
                   // this.moveTo(Math.round(newState.t), Math.round(newState.l));
                   // this.resizeTo(Math.round(newState.w), Math.round(newState.h));
                }
                if(name === 'workspaceInfo' && oldState === undefined){
                    this.updateWidgetWorkspaceInfo(newState);
                    // this.moveTo(Math.round(newState.t), Math.round(newState.l));
                    // this.resizeTo(Math.round(newState.w), Math.round(newState.h));
                }

            },
            updateWidgetWorkspaceInfo: function(workspaceInfo){
                console.log("workspace Info", workspaceInfo);
            },
            updateWidgetWithElementBox: function(elementBox)
            {
                if(elementBox && elementBox.t !== undefined && elementBox.l !== undefined  ){
                    this.moveTo(Math.round(elementBox.t), Math.round(elementBox.l));
                }
                if(elementBox && elementBox.w !== undefined && elementBox.h !== undefined  ){
                    this.resizeTo(Math.round(elementBox.w), Math.round(elementBox.h));
                }
            },
            makeWorkspaceContainer: function(){
                console.log("Making Workspace Container");

                this._workspaceContainerWidget = new workspaceContainerWidget({
                    _instanceKey: this._instanceKey,
                    _componentKey: this._componentKey,
                    _contentNodeToContain: this.domNode,
                    _workspaceContainer: this,
                    _onMoveStop:lang.hitch(this, this.onMoved),
                    _onResizeStop:lang.hitch(this, this.onResized)});



                if(this._diaplodeWorkspaceContainerState){
                    let movableState =  this._diaplodeWorkspaceContainerState.get("elementBox");
                   this.updateWidgetWithElementBox(movableState);
                }


            },
            moveTo: function(t,l){
                //todo check that we are moving somewhere on screen
                if(this._workspaceContainerWidget.domNode){
                    domStyle.set(this._workspaceContainerWidget.domNode, "top", t+"px");
                    domStyle.set(this._workspaceContainerWidget.domNode, "left", l+"px");
                }
            },
            resizeTo: function(w,h){
                if(this._workspaceContainerWidget.domNode){
                    domStyle.set(this._workspaceContainerWidget.domNode, "width", w+"px");
                    domStyle.set(this._workspaceContainerWidget.domNode, "height", h+"px");
                }
            },
            onMoved: function(MoveEvent){
                this.updateInstanceElementBox();
            },
            onResized: function(MoveEvent){
               this.updateInstanceElementBox();
            },
            updateInstanceElementBox: function(){
                let elementBox = domGeometry.getContentBox(this._workspaceContainerWidget.domNode);
                console.log("resized sending Box", elementBox);
                this._componentStateSet("diaplodeWorkspaceContainer", "elementBox", elementBox);
            },

            getWorkspaceDomNode: function () {
                console.log("getting Dom Node");
                return this._workspaceContainerWidget.domNode;
            },
        });
    });