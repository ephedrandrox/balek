define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',

        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",

        'dojo/on',
        "dojo/dom-attr",
        "dojo/dom-style",
        "dojo/keys",
        "dijit/focus",
        "dojo/ready",
        'dojo/_base/fx',

    ],
    function (declare,
              lang,
              topic,

              domClass,
              domConstruct,
              win,

              on,
              domAttr,
              domStyle,
              dojoKeys,
              dijitFocus,
              dojoReady,
              fx) {

        return declare("diaplodeUIContainerMovable", null, {

            constructor: function (args) {

                declare.safeMixin(this, args);

            },
            moveTo: function(x,y){
                //make this part of a Movable class that inherits
                this._xRelativePosition = x;
                this._yRelativePosition = y;


                domStyle.set(this.domNode, "top", y+"%");
                domStyle.set(this.domNode, "left", x+"%");
            }
        });
    });