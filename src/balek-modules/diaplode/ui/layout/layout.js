define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/_base/array',
        "dojo/dom-geometry",
        "dojo/window",
    ],
    function (declare,
              lang,
              arrayUtil,
              domGeom,
              dojoWindow,
        ) {
        return declare("diaplodeUILayout", [], {
            constructor: function (args) {
                declare.safeMixin(this, args);
                console.log("diaplodeUILayout  starting...");
            },
            getAnimationArrangeWidgetsGridDynamic : function(widgets, anchorObject){

                console.log("diaplodeUILayout  getAnimationArrangeWidgetsGridDynamic...", widgets, anchorObject);

                let animations = new Array();

                let windowDimensions = dojoWindow.getBox();

                let anchorOffsets = domGeom.position(anchorObject);

                const animationSpeed = 300;
                const animationRate = 10;

                let anchorBottomOffset = 20 + anchorOffsets.h;

                let lastTop = 0;
                let lastLeft = 0;
                let newTop = 0;
                let widgetWidth = 0;
                let widgetHeight = 0;

                let padding = 10;
                let heightPadding = 40;

                let anchorPosition =  domGeom.position(anchorObject, true);
                let anchorWidthOffset = anchorPosition.w;
                let anchorHeightOffset = anchorPosition.h/2;

                let widthToWork = windowDimensions.w - anchorOffsets.x - anchorWidthOffset;
                let topToWork = windowDimensions.h - heightPadding - anchorOffsets.y-anchorHeightOffset;

                let direction = "SouthEast";


                let transformFunction = {
                    "NorthEast" : function(){

                        newTop = lastTop - padding - widgetHeight;

                        if(lastLeft === 0 )
                        {
                            lastLeft = + anchorWidthOffset;
                        }

                        if (-anchorOffsets.y + heightPadding >= newTop  )
                        {
                            newTop =   - padding - widgetHeight;
                            lastLeft+= widgetWidth + padding;
                        }
                        lastTop = newTop;

                    },
                    "NorthWest" : function(){

                        newTop = lastTop - padding - widgetHeight;

                        //If going West, we need to move a widgets width that way to start
                        if(lastLeft === 0 )
                        {
                            lastLeft = - widgetWidth;
                        }

                        if (-anchorOffsets.y + heightPadding >= newTop  )
                        {

                            newTop = 0 - padding - widgetHeight;
                            lastLeft -= widgetWidth + padding;

                        }
                        lastTop = newTop;

                    },
                    "SouthEast" : function(){
                        newTop = lastTop + padding;

                        if(lastLeft === 0 )
                        {
                            lastLeft = + anchorWidthOffset;
                        }

                        if (topToWork <= (newTop + widgetHeight + padding + anchorBottomOffset ))
                        {
                            newTop = padding;
                            lastLeft+=  widgetWidth + padding;
                        }
                        lastTop = newTop+widgetHeight;

                    },
                    "SouthWest" : function (){
                        newTop = lastTop + padding;

                        //If going West, we need to move a widgets width that way to start
                        if(lastLeft === 0 )
                        {
                            lastLeft = - widgetWidth;
                        }

                        //if we have reached the bottom, go to the top
                        if (topToWork <= (newTop + widgetHeight + padding + anchorBottomOffset ))
                        {
                            newTop = padding;
                            lastLeft= lastLeft-widgetWidth - padding;
                        }
                        lastTop = newTop+widgetHeight;
                    }
                }

                //propigate south
                if(topToWork >= (windowDimensions.h/2)) {
                    if (widthToWork >= (windowDimensions.w / 2)) {
                        direction = "SouthEast";
                    }else{
                        direction = "SouthWest"
                    }
                }
                else
                {

                    if(widthToWork >= (windowDimensions.w/2))
                    {
                        direction = "NorthEast";
                    }else{
                        direction = "NorthWest";
                    }
                }

                let addAnimation = function(domNode, top, left){
                    animations.push(dojo.fx.slideTo({
                        node: domNode,
                        top: top ,
                        left: left ,
                        unit: "px",
                        rate: animationRate,
                        duration: animationSpeed
                    }));
                }

                let directionTransform = transformFunction[direction.toString()];

                arrayUtil.forEach(widgets, function(widget, index){
                    let widgetPosition =  domGeom.position(widget.domNode, true);
                    widgetWidth = widgetPosition.w;
                    widgetHeight = widgetPosition.h;
                    directionTransform();
                    addAnimation(widget.domNode, newTop,  lastLeft + padding);

                });
                return dojo.fx.combine(animations);
            },

        });
    }
);


