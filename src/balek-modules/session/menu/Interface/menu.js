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

        'dojo/text!balek-modules/session/menu/resources/html/menu.html',
        'dojo/text!balek-modules/session/menu/resources/css/menu.css',

        'balek-modules/session/menu/Interface/userMenu',
        'balek-modules/session/menu/Interface/systemMenu',
        'balek-modules/session/menu/Interface/workspacesMenu',
        'balek-modules/session/menu/Interface/modulesMenu',
    ],
    function (declare, lang, topic, domClass, domConstruct, win, on, domAttr, _WidgetBase, _TemplatedMixin, template, templateCSS, userMenu, systemMenu, workspacesMenu, modulesMenu) {

        return declare("moduleSessionMenuInterface", [_WidgetBase, _TemplatedMixin], {
            _instanceKey: null,
            templateString: template,
            baseClass: "sessionMenu",

            _userMenu: null,
            _systemMenu: null,
            _workspacesMenu: null,
            _modulesMenu: null,

            constructor: function (args) {

                declare.safeMixin(this, args);

                //should maybe give id and check for these before adding more and more in case body already has style
                domConstruct.place(domConstruct.toDom("<style>" + templateCSS + "</style>"), win.body());

                this._userMenu = {};
                this._systemMenu = {};
                this._workspacesMenu = {};
                this._modulesMenu = {};
            },
            postCreate() {
                this.addUserMenu();
                this.addModulesMenu();
                this.addWorkspacesMenu();
                this.addSystemMenu();

                //addToMainContentLayerAlwaysOnTop provided by client uiManager
                topic.publish("addToMainContentLayerAlwaysOnTop", this.domNode);

            },
            addUserMenu(userData) {
                this._userMenu = new userMenu({_instanceKey: this._instanceKey});
                domConstruct.place(this._userMenu.domNode, this.domNode);
            },
            addSystemMenu(systemData) {
                this._systemMenu = new systemMenu({_instanceKey: this._instanceKey});
                domConstruct.place(this._systemMenu.domNode, this.domNode);
            },
            addWorkspacesMenu() {
                this._workspacesMenu = new workspacesMenu({_instanceKey: this._instanceKey});
                domConstruct.place(this._workspacesMenu.domNode, this.domNode);
            },
            addModulesMenu() {
                this._modulesMenu = new modulesMenu({_instanceKey: this._instanceKey});
                domConstruct.place(this._modulesMenu.domNode, this.domNode);
            },
            unload: function () {
                this._userMenu.unload();
                this._modulesMenu.unload();
                this._workspacesMenu.unload();
                this._systemMenu.unload();
                this.destroy();
            }


        });
    });