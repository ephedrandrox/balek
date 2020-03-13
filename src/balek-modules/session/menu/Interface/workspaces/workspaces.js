define(['dojo/_base/declare',
        'dojo/_base/lang',
        'dojo/topic',
        'dojo/dom-class',
        'dojo/dom-construct',
        "dojo/_base/window",

        'dojo/on',
        "dojo/dom-attr",
        "dijit/_WidgetBase",
        "dijit/_TemplatedMixin",

        'dojo/text!balek-modules/session/menu/Interface/workspaces/resources/html/workspaces.html',
        'dojo/text!balek-modules/session/menu/Interface/workspaces/resources/css/workspaces.css',

        'balek-modules/session/menu/Interface/workspaces/workspaceListItem',
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, _WidgetBase, _TemplatedMixin, template, templateCSS, workspaceListItem) {
        return declare("moduleSessionMenuInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "sessionWorkspaces",

            _workspaceListItems: null,

            _workspaceStore: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                //todo should maybe give id and check for these before adding more and more in case body already has style
                //Or even better, make a style manager that receives events to add styles
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

                if (this._workspaceListItems === null) {
                    this._workspaceListItems = {};
                }

            },
            _onAddWorkspaceButtonClick: function () {
                this.requestNewWorkspace();
            },
            requestNewWorkspace: function () {
                console.log("Requesting new workspace");
                topic.publish("requestNewWorkspace");
            },
            reload: function () {
                let workspaces = this._workspacesStore.get("workspaces");
                let activeWorkspace = this._workspacesStore.get("activeWorkspace");
                for (const workspaceKey in workspaces) {
                    if (this._workspaceListItems[workspaceKey] === undefined) {
                        this._workspaceListItems[workspaceKey] = new workspaceListItem({
                            _instanceKey: this._instanceKey,
                            _workspaceState: this._workspacesStore,
                            _workspaceKey: workspaces[workspaceKey]._workspaceKey,
                            _workspaceName: workspaces[workspaceKey]._workspaceName,
                            _activeWorkspace: activeWorkspace
                        });
                        domConstruct.place(this._workspaceListItems[workspaceKey].domNode, this._workspaceListDiv)
                    } else {
                        this._workspaceListItems[workspaceKey].refreshView({
                            _workspaceName: workspaces[workspaceKey]._workspaceName,
                            _activeWorkspace: activeWorkspace
                        });
                    }
                }
            },
            unload: function () {
                for (const workspaceKey in this._workspaceListItems) {
                    this._workspaceListItems[workspaceKey].unload();
                    this._workspaceListItems[workspaceKey].destroy();
                    delete this._workspaceListItems[workspaceKey];
                }
                this.destroy();
            }
        });
    });