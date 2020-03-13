define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-style',
        'dojo/dom-construct',
        "dojo/_base/window",

        'dojo/on',
        "dojo/dom-attr",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/session/menu/resources/html/modulesMenu.html',
        'dojo/text!balek-modules/session/menu/resources/css/modulesMenu.css',
        'balek-modules/session/menu/Interface/modules/modules'


    ],
    function (declare, lang, topic, domClass, domStyle, domConstruct, win, on, domAttr, _WidgetBase, _TemplatedMixin, template, templateCSS, sessionMenuModules) {
        return declare("moduleSessionSystemMenuInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "sessionMenuModulesMenu",

            _sessionMenuModulesInterface: null,
            _availableModulesStore: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

                topic.publish("getAvailableModulesState", lang.hitch(this, function (availableModulesStore) {
                    this._availableModulesStore = availableModulesStore;
                    this._sessionMenuModulesInterface = new sessionMenuModules({
                        _instanceKey: this._instanceKey,
                        _availableModulesStore: availableModulesStore
                    });
                    this._availableModulesStore.watch("availableModules", lang.hitch(this, this.watchChange));
                    topic.publish("addToMainContentLayerFirstBelowTop", this._sessionMenuModulesInterface.domNode);
                }));
            },
            _mouseEnter: function (eventObject) {
                domClass.add(this._modulesIconDiv, "mouseOversessionMenuModulesMenuModuleIcon");
            },
            _mouseLeave: function (eventObject) {
                domClass.remove(this._modulesIconDiv, "mouseOversessionMenuModulesMenuModuleIcon");
            },
            _onClick: function (eventObject) {
                this.toggleShowView();
            },
            watchChange: function (name, oldValue, newValue) {
                if (name === "availableModules") {
                    this._sessionMenuModulesInterface.reload();
                }
            },
            toggleShowView: function () {
                let currentStateToggle = {"visible": "hidden", "hidden": "visible"};
                domStyle.set(this._sessionMenuModulesInterface.domNode, {"visibility": currentStateToggle[domStyle.get(this._sessionMenuModulesInterface.domNode, "visibility")]});
            },
            unload: function () {
                this._sessionMenuModulesInterface.unload();
                this.destroy();
            }
        });
    });