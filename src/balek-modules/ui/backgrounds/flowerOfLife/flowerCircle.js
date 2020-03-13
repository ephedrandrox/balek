define(['dojo/_base/declare', 'dojo/_base/array', 'dojo/_base/lang', "dojo/fx", "dojox/gfx", "dojox/gfx/fx"],
    function (declare, array, lang, fx, gfx, gfxFx) {

        return declare("flowerCircle", null, {
            angleArray: [270,
                330,
                30,
                90,
                150,
                210],
            constructor: function (args) {

                this.createdPetals = new Array();

                this._anglePosition = 0;

                declare.safeMixin(this, args);

                this._circle = this._flowerGroup.createCircle({
                    cx: this._center.x, cy: this._center.y, r: this._radius
                }).setFill("rgb(0,0,0,.1)")
                    .setStroke("rgb(0,0,0,.1)").moveToBack();
                this.animateCircle();
            },
            animateCircle: function (endColor) {

                if (endColor == null) {
                    var endColor = "rgba(" + (Math.floor((Math.random() * 100) + 1)) + "," + (Math.floor((Math.random() * 100) + 1)) + "," + (Math.floor((Math.random() * 100) + 1)) + " ,.2)";
                }

                let circleAnimations = {
                    newCircleFade: gfxFx.animateFill({
                        shape: this._circle,
                        duration: 500,
                        color: {start: "rgba(255,255,255,0)", end: endColor}
                    }),
                    newCircleGrow: gfxFx.animateTransform({
                        duration: 1000 * (this._flowerDepth + 1),
                        shape: this._circle,
                        transform: [
                            {
                                name: "translate",
                                start: [this._center.x, this._center.y],
                                end: [0, 0]
                            },
                            {
                                name: "scale",
                                start: [0, 0],
                                end: [1, 1]
                            },
                        ]
                    })
                };
                let newAnimation = fx.combine([circleAnimations.newCircleFade, circleAnimations.newCircleGrow]);

                let thisObj = this;
                newAnimation.onEnd = function () {
                    thisObj.animateCircleColor();
                };
                newAnimation.play();
            },
            animateCircleColor: function (endColor) {

                if (endColor == null) {
                    var endColor = "rgba(" + (Math.floor((Math.random() * 125) + 1)) + "," + (Math.floor((Math.random() * 125) + 1)) + "," + (Math.floor((Math.random() * 125) + 1)) + " ,.2)";
                }

                let duration = Math.floor((Math.random() * 3000) + 1);

                let newAnimation = gfxFx.animateFill({
                    shape: this._circle,
                    duration: duration,
                    color: {end: endColor}
                });
                newAnimation.onEnd = lang.hitch(this, function () {
                    if (this._flowerGroup.stopAnimation != true)
                        this.animateCircleColor();
                });
                newAnimation.play();
            },
            getStartPointFromAngle: function (cx, cy, a, r) {
                var returnCords = {x: 0, y: 0};
                returnCords.x = (Math.cos(a * (Math.PI / 180)) * r) + cx;
                returnCords.y = (Math.sin(a * (Math.PI / 180)) * r) + cy;
                return returnCords;
            }
        });
    });