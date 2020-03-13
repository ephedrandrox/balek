define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/dom-class',
        'dojo/dom-style',
        'dojo/aspect',

        'dojo/_base/fx',


        'balek-client/ui/layoutManager',
        'balek-client/ui/layerManager',
        'dojo/text!balek-client/resources/css/balek.css',


    ],
    function (declare, lang, topic, domConstruct, win, domClass, domStyle, aspect, fx, layoutManager, layerManager, mainCSS) {

        return declare(null, {

            _layoutManager: null,
            _layerManager: null,
            _workspacesStore: null,
            _workspacesStoreActiveWorkspaceWatch: null,
            _backgroundInterface: null,
            constructor: function (args) {

                declare.safeMixin(this, args);

                this._layerManager = new layerManager();
                this._layoutManager = new layoutManager();

                this._workspacesStoreActiveWorkspaceWatch = {};

                topic.subscribe("addToMainContentLayer", lang.hitch(this, this.addToMainContentLayer));
                topic.subscribe("addToMainContentLayerAlwaysOnTop", lang.hitch(this, this.addToMainContentLayerAlwaysOnTop));
                topic.subscribe("addToMainContentLayerFirstBelowTop", lang.hitch(this, this.addToMainContentLayerFirstBelowTop));

                topic.subscribe("addToBackgroundLayer", lang.hitch(this, this.addToBackgroundLayer));

                topic.subscribe("loadBackground", lang.hitch(this, this.loadBackground));


                topic.subscribe("displayAsDialog", lang.hitch(this, this.displayAsDialog));
                topic.subscribe("workspaceStoreAvailable", lang.hitch(this, this.onWorkspaceStoreAvailable));

                topic.subscribe("resetUI", lang.hitch(this, this.resetUI));

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + mainCSS + "</style>"), win.body());

            },
            addToMainContentLayer: function (domNode) {
                let mainContentLayer = this._layerManager.getMainContentLayer();
                domConstruct.place(domNode, mainContentLayer);
                domStyle.set(domNode, {"z-index": this._layerManager._mainContentZindex});

            },
            addToMainContentLayerAlwaysOnTop: function (domNode) {
                this.addToMainContentLayer(domNode);
                domStyle.set(domNode, {"z-index": this._layerManager._mainContentZindex + 1000});

            },
            addToMainContentLayerFirstBelowTop: function (domNode) {
                this.addToMainContentLayer(domNode);
                domStyle.set(domNode, {"z-index": this._layerManager._mainContentZindex + 900});

            },
            addToBackgroundLayer: function (domNode, returnCallback) {
                let backgroundLayer = this._layerManager.getBackgroundLayer();
                domConstruct.place(domNode, backgroundLayer);
                domStyle.set(domNode, {"z-index": this._layerManager._backgroundZindex});
                if (returnCallback)
                    returnCallback();

            },
            displayAsDialog: function (widget) {
                //todo check if dialog is being shown, if it is, create a new one on top
                let domNode = widget.domNode;
                let dialogLayer = this._layerManager.getDialogLayer();
                domConstruct.place(domNode, dialogLayer);
                domStyle.set(domNode, {"z-index": this._layerManager._dialogZindex});
                domStyle.set(dialogLayer, {"visibility": "visible"});

                fx.fadeIn({
                    node: dialogLayer,
                    onEnd: function () {
                        domNode.focus();
                    }
                }).play();

                aspect.after(widget, "destroy", function () {
                    let fadeOutAnimation = fx.fadeOut({node: dialogLayer});
                    fadeOutAnimation.onEnd = function () {
                        domStyle.set(dialogLayer, {"visibility": "hidden"});

                    };
                    fadeOutAnimation.play();

                });

            },
            onWorkspaceStoreAvailable: function (workspaceStore) {

                if (this._workspacesStore === null) {
                    this._workspacesStore = workspaceStore;
                    this._workspacesStoreActiveWorkspaceWatch = this._workspacesStore.watch("activeWorkspace", lang.hitch(this, this.onActiveWorkspaceChange));
                } else {
                    this._workspacesStoreActiveWorkspaceWatch.unwatch();
                    this._workspacesStore = workspaceStore;
                    this._workspacesStoreActiveWorkspaceWatch = this._workspacesStore.watch("activeWorkspace", lang.hitch(this, this.onActiveWorkspaceChange));
                }
            },
            onActiveWorkspaceChange: function (name, oldWorkspaceKey, newWorkspaceKey) {
                let workspaces = this._workspacesStore.get("workspaces");
                if (oldWorkspaceKey === null) {
                    this.addToMainContentLayer(workspaces[newWorkspaceKey].domNode);
                } else {

                    domConstruct.place(workspaces[newWorkspaceKey].domNode, workspaces[oldWorkspaceKey].domNode, "replace");
                }
            },
            loadBackground: function (background) {
                let backgroundInterfacePath = "balek-modules/ui/backgrounds/" + background;
                try {
                    require([backgroundInterfacePath], lang.hitch(this, function (backgroundInterface) {
                        this._backgroundInterface = new backgroundInterface();

                        topic.publish("addToBackgroundLayer", this._backgroundInterface.domNode, lang.hitch(this, function () {
                            this._backgroundInterface.startup();
                        }));

                    }));
                } catch (err) {
                    console.log("could not load background interface");
                    console.log(err);
                }

            },
            resetUI: function (returnWhenDone) {
                this._layerManager.reset();
                this._layoutManager.reset();
                returnWhenDone();
            }

        });
    }
);
