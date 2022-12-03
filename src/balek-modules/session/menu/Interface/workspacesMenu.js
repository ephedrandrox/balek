define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",
        'dojo/dom-style',
        'dojo/on',
        "dojo/dom-attr",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/session/menu/resources/html/workspacesMenu.html',
        'dojo/text!balek-modules/session/menu/resources/css/workspacesMenu.css',
        'balek-modules/session/menu/Interface/workspaces/workspaces',
    ],
    function (declare,
              lang,
              topic,
              domClass,
              domConstruct,
              win,
              domStyle,
              on,
              domAttr,
              _WidgetBase,
              _TemplatedMixin,
              template,
              templateCSS,
              sessionMenuWorkspacesMenu) {

        return declare("moduleSessionWorkspaceMenuInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "sessionMenuWorkspacesMenu",

            _sessionMenuWorkspacesInterface: null,
           // _workspacesStore: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                //should maybe give id and check for these before adding more and more in case body already has style
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

             /*   topic.publish("getWorkspacesStore", lang.hitch(this, function (workspacesStore) {
                    this._workspacesStore = workspacesStore;
                    this._sessionMenuWorkspacesInterface = new sessionMenuWorkspacesMenu({
                        _instanceKey: this._instanceKey,
                        _workspacesStore: workspacesStore
                    });
                    this._workspacesWatchHandle = this._workspacesStore.watch("workspaces", lang.hitch(this, this.watchChange));
                    this._activeWorkspacesWatchHandle = this._workspacesStore.watch("activeWorkspace", lang.hitch(this, this.watchChange));
                    this._sessionMenuWorkspacesInterface.reload();
                    topic.publish("addToMainContentLayerFirstBelowTop", this._sessionMenuWorkspacesInterface.domNode);
                }));
*/
                this._sessionMenuWorkspacesInterface = new sessionMenuWorkspacesMenu({
                    _instanceKey: this._instanceKey
                });
                topic.publish("addToMainContentLayerFirstBelowTop", this._sessionMenuWorkspacesInterface.domNode);
            },
            _mouseEnter: function (eventObject) {
                domClass.add(this._workspacesIconDiv, "mouseOverSessionWorkspacesMenuWorkspaceIcon");
            },
            _mouseLeave: function (eventObject) {
                domClass.remove(this._workspacesIconDiv, "mouseOverSessionWorkspacesMenuWorkspaceIcon");
            },
            _onClick: function (eventObject) {
                this.toggleShowView();
            },
            watchChange: function (name, oldValue, newValue) {
                if (name === "workspaces" || name === "activeWorkspace") {
                    this._sessionMenuWorkspacesInterface.reload();
                }
            },
            toggleShowView: function () {
                let currentStateToggle = {"visible": "hidden", "hidden": "visible"};
                domStyle.set(this._sessionMenuWorkspacesInterface.domNode, {"visibility": currentStateToggle[domStyle.get(this._sessionMenuWorkspacesInterface.domNode, "visibility")]});
            },
            unload: function () {
                this._sessionMenuWorkspacesInterface.unload();
              //  this._workspacesWatchHandle.remove();
              //  this._activeWorkspacesWatchHandle.remove();
                this.destroy();
            }
        });
    });