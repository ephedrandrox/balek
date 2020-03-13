define(['dojo/_base/declare',
        'dojo/dom-construct',
        'dojo/dom-style',
        'dojo/dom-class',
        "dojo/_base/window"
    ],
    function (declare, domConstruct, domStyle, domClass, win) {

        return declare("layerManager", null, {

            _maxZindex: 100000,
            _backgroundZindex: 10000,
            _mainContentZindex: 70000,
            _dialogZindex: 90000,

            _dialogLayer: null,

            _backgroundLayer: null,

            _mainContentLayer: null,

            _layerNodes: [],

            constructor: function (args) {

                declare.safeMixin(this, args);

                this._dialogLayer = this.createNewLayer();
                domClass.add(this._dialogLayer, "layerManagerDialogLayerNode");
                domStyle.set(this._dialogLayer, {"z-index": this._dialogZindex});


                this._backgroundLayer = this.createNewLayer();
                domClass.add(this._backgroundLayer, "layerManagerBackgroundLayerNode");
                domStyle.set(this._backgroundLayer, {"z-index": this._backgroundZindex});


                this._mainContentLayer = this.createNewLayer();
                domClass.add(this._mainContentLayer, "layerManagerMainContentLayerNode");
                domStyle.set(this._mainContentLayer, {"z-index": this._mainContentZindex});


            },
            getDialogLayer: function () {
                return this._dialogLayer;
            },
            getMainContentLayer: function () {
                return this._mainContentLayer;
            },
            getBackgroundLayer: function () {
                return this._backgroundLayer;

            },
            moveLayerToTop: function (layerNode) {
                // domStyle.set(this._topLayer,  {"z-index":  domStyle.get(this._topLayer, "z-index" )-1 });
            },
            createNewLayer: function (domNodeToPlaceIn) {

                let newLayer = domConstruct.create("div", {id: ("lmLayer")});

                domClass.add(newLayer, "layerManagerNode");
                domStyle.set(newLayer, {"z-index": 0});

                if (domNodeToPlaceIn) {
                    domConstruct.place(newLayer, domNodeToPlaceIn);

                } else {
                    domConstruct.place(newLayer, win.body());

                }

                this._layerNodes.push(newLayer);

                return newLayer;
            },
            reset() {
                this._dialogLayer.innerHTML = "";
                this._backgroundLayer.innerHTML = "";
                this._mainContentLayer.innerHTML = "";
            }


        });
    }
);
