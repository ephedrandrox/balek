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
        "dojo/dnd/Moveable"

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
              Moveable
            ) {

        return declare("diaplodeUIContainerMovable", null, {
            _dnd: null,
            _diaplodeMovableState: null,

            constructor: function (args) {

                declare.safeMixin(this, args);
                if(this._componentKey){

                    console.log("Component Key!", this._componentKey);

                  this.getComponentState("diaplodeMovable").then(lang.hitch(this, function(stateResult){
                      this._diaplodeMovableState = stateResult;
                      this._diaplodeMovableState.watch(lang.hitch(this, this.onStateReceived));

                      //set and watch the state
                      console.log(this._diaplodeMovableState);
                  })).catch(lang.hitch(this, function(errorResult){
                      console.log(this._diaplodeMovableState);
                  }));

                }else {
                    console.log("No Component Key!");
                }

            },
            onStateReceived: function(name, oldState, newState)
            {
                console.log(name, oldState, newState);
                if(name === 'elementBox' && oldState === undefined){
                    this.moveTo(Math.round(newState.t), Math.round(newState.l));
                }

            },
            makeMovable: function(){

                if(this._diaplodeMovableState){
                   let movableState =  this._diaplodeMovableState.get("elementBox");
                    if(movableState && movableState.x !== undefined && movableState.y !== undefined  ){
                        this.moveTo(Math.round(movableState.x), Math.round(movableState.y));
                    }
                }
                this._dnd = new Moveable(this.domNode);
                this._dnd.on("MoveStop", lang.hitch(this, this.onMoved));

            },
            moveTo: function(t,l){
            //todo check that we are moving somewhere on screen
                if(this.domNode){
                    domStyle.set(this.domNode, "top", t+"px");
                    domStyle.set(this.domNode, "left", l+"px");
                }
            },
            onMoved: function(MoveEvent){
                let elementBox = domGeometry.getContentBox(this.domNode);
                this._componentStateSet("diaplodeMovable", "elementBox", elementBox);
            }
        });
    });