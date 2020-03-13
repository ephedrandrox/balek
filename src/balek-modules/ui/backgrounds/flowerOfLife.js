define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",

        'dojo/on',
        "dojo/dom-attr",
        "dojo/aspect",
        "dojox/gfx/fx",
        'balek-modules/ui/backgrounds/flowerOfLife/flowerCircle',
        'balek-modules/ui/backgrounds/background',
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/ui/backgrounds/resources/html/flowerOfLife.html',
        'dojo/text!balek-modules/ui/backgrounds/resources/css/flowerOfLife.css',

    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, aspect, dojoxGfxFX, flowerCircle, uiBackgroundsBackground, _WidgetBase, _TemplatedMixin, template, templateCSS) {
        return declare("moduleUIBackgroundsFlowerOfLifeInterface", [_WidgetBase, _TemplatedMixin, uiBackgroundsBackground], {
            _instanceKey: null,
            templateString: template,
            baseClass: "uiBackgroundsFlowerOfLife",

            angleArray: [30,
                90,
                150,
                210, 270,
                330],

            _radius: 300,
            _center: {x: 0, y: 0},
            _backgroundColor: "rgba(0,0,0,.3)",
            _flowerSize: 5,

            constructor: function (args) {

                declare.safeMixin(this, args);

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

            },
            createFlower: function (depth) {
                let i = 0;

                for (i = 0; i <= depth; i++) {
                    let newCenter = {};
                    newCenter.x = this._center.x;
                    newCenter.y = this._center.y - (this._radius * i);

                    this._flowerStart = new flowerCircle({
                        parentFlower: null,
                        _surface: this._surface,
                        _flowerGroup: this._flower,
                        _flowerDepth: i,
                        _flowerSize: depth,
                        _center: newCenter,
                        _radius: this._radius,
                        _children: [null, null, null, null, null, null]
                    });

                    let di = 0;
                    let angPos = 0;
                    for (angPos = 0; angPos <= 5; angPos++) {
                        let angle = this.angleArray[angPos];
                        for (di = 0; di < i; di++) {
                            if (!(angPos == 5 && di == i - 1)) {
                                newCenter = this.getStartPointFromAngle(newCenter.x, newCenter.y, angle, this._radius);

                                this._flowerStart = new flowerCircle({
                                    parentFlower: null,
                                    _surface: this._surface,
                                    _flowerGroup: this._flower,
                                    _flowerDepth: i,
                                    _flowerSize: depth,
                                    _center: newCenter,
                                    _radius: this._radius,
                                    _children: [null, null, null, null, null, null]
                                });
                            }
                        }
                    }
                }
            },
            enlargeFlowerAnimation: function () {
                let centerPoint = this.getSurfaceCenterPoint();
                let newCircleGrow = dojoxGfxFX.animateTransform({
                    duration: 3000,
                    shape: this._flower,
                    transform:
                        [{
                            name: "translate",
                            start: [centerPoint.x, centerPoint.y],
                            end: [centerPoint.x, centerPoint.y]
                        }, {
                            name: "scale",
                            start: [.25, .25],
                            end: [1, 1]
                        }]
                });
                this._flower.stopAnimation = false;
                newCircleGrow.play();
                setTimeout(lang.hitch(this, function () {
                    this._flower.stopAnimation = true;
                }), 10000);
            },
            getStartPointFromAngle: function (cx, cy, a, r) {
                let returnCords = {x: 0, y: 0};
                returnCords.x = (Math.cos(a * (Math.PI / 180)) * r) + cx;
                returnCords.y = (Math.sin(a * (Math.PI / 180)) * r) + cy;
                return returnCords;
            },
            startup: function () {
                this._flower = this._surface.createGroup();
                this.createFlower(this._flowerSize);
                this.enlargeFlowerAnimation();
            }
        });
    });